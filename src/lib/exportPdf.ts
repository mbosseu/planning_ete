export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert("Erreur : le tableau est introuvable.");
    return;
  }

  alert("Génération du PDF en cours... Veuillez patienter quelques secondes !");

  try {
    // Importation dynamique pour éviter de bloquer le chargement initial d'Astro
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const canvas = await html2canvas(element, {
      scale: 2, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
    
    alert("Le téléchargement est terminé !");
  } catch (error: any) {
    console.error('Error generating PDF', error);
    alert('Une erreur est survenue : ' + (error.message || ''));
  }
};
