export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert("Erreur : le tableau est introuvable.");
    return;
  }

  // We add a specific class to body to know which table to print
  document.body.setAttribute('data-print-target', elementId);
  
  // Trigger native print dialog which allows saving as PDF perfectly
  window.print();
  
  // Clean up
  setTimeout(() => {
    document.body.removeAttribute('data-print-target');
  }, 1000);
};
