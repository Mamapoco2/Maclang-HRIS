// utils/printStyles.js
export const printStyles = `
@media print {
  @page {
    size: Legal portrait;
    margin: 5mm;
  }

  body {
    margin: 0;
    background: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body * {
    visibility: hidden;
  }

  .print-container,
  .print-container * {
    visibility: visible;
  }

  .print-container {
    position: relative;
    width: 8.5in;
    margin: 0;
    padding: 0;
    background: white !important;
  }

  .overflow-x-auto {
    overflow: visible !important;
  }

  tr {
    page-break-inside: avoid;
  }

  table {
    page-break-inside: auto;
  }

  textarea,
  input {
    border: none !important;
    outline: none !important;
    resize: none !important;
    overflow: hidden !important;
    appearance: none !important;
    -webkit-appearance: none !important;
    background: transparent !important;
  }
}
`;
