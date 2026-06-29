import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Creates a PDF from an HTML element
 */
export async function createPdfFromElement(element: HTMLElement): Promise<Blob> {
  // Capture with html2canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: 1200, // force a good width
    onclone: (documentClone) => {
      // Simulate print styles by finding elements with print:* classes
      // and applying them as normal classes
      // This is a simplified approach, tailwind print classes usually start with 'print:'
      const elements = documentClone.querySelectorAll('*');
      elements.forEach((el) => {
        const classes = Array.from(el.classList);
        classes.forEach(cls => {
          if (cls.startsWith('print:')) {
            const normalClass = cls.replace('print:', '');
            el.classList.add(normalClass);
          }
          if (cls === 'print:hidden') {
            el.classList.add('hidden');
          }
        });
      });
    }
  });

  const imgData = canvas.toDataURL('image/jpeg', 1.0);
  
  // Create PDF
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let imgWidth = pdfWidth;
  let imgHeight = (canvas.height * pdfWidth) / canvas.width;
  
  let x = 0;
  let y = 0;
  
  // Scale down if it exceeds page height
  if (imgHeight > pageHeight) {
    imgHeight = pageHeight;
    imgWidth = (canvas.width * pageHeight) / canvas.height;
    x = (pdfWidth - imgWidth) / 2; // Center horizontally
  }
  
  pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
  
  return pdf.output('blob');
}

export async function exportAllToZip(
  coachContainerId: string, 
  roomContainerId: string, 
  periodName: string
) {
  const zip = new JSZip();
  const folder = zip.folder(`Plannings_${periodName}`);
  if (!folder) return;

  const processContainer = async (containerId: string, prefix: string) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // The container has children, each representing one page (e.g., one coach or one room)
    const elements = container.children;
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as HTMLElement;
      // Extract the name from the title
      const titleEl = el.querySelector('th');
      let name = `${prefix}_${i + 1}`;
      if (titleEl && titleEl.textContent) {
        const text = titleEl.textContent;
        if (text.includes('Coach :')) {
          name = text.split('Coach :')[1].split('(')[0].trim();
        } else if (text.includes('Salle :')) {
          name = text.split('Salle :')[1].split('(')[0].trim();
        }
      }

      // Briefly display it block so html2canvas can capture it
      const originalDisplay = el.style.display;
      el.style.display = 'block';
      
      const blob = await createPdfFromElement(el);
      folder.file(`${prefix}_${name}.pdf`, blob);
      
      el.style.display = originalDisplay;
    }
  };

  // We need to temporarily show the hidden containers so they have layout
  const coachContainer = document.getElementById(coachContainerId);
  const roomContainer = document.getElementById(roomContainerId);
  
  if (coachContainer) coachContainer.classList.remove('hidden');
  if (roomContainer) roomContainer.classList.remove('hidden');

  await processContainer(coachContainerId, 'Coach');
  await processContainer(roomContainerId, 'Salle');

  if (coachContainer) coachContainer.classList.add('hidden');
  if (roomContainer) roomContainer.classList.add('hidden');

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `Plannings_${periodName}.zip`);
}
