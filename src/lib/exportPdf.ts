export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert("Erreur : le tableau est introuvable.");
    return;
  }

  // We add a specific class to body to know which table to print
  document.body.setAttribute('data-print-target', elementId);
  
  // We MUST yield to the browser's rendering engine so it can apply CSS
  // (display: block, page breaks, etc.) BEFORE freezing the thread with print()
  setTimeout(() => {
    window.print();
    
    // Clean up after print dialog closes
    setTimeout(() => {
      document.body.removeAttribute('data-print-target');
    }, 1000);
  }, 150);
};
