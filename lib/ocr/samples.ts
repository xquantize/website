export type OcrSample = {
  id: string;
  label: string;
  description: string;
  src: string;
};

export const OCR_SAMPLES: OcrSample[] = [
  {
    id: "cafe",
    label: "Printed slip",
    description: "Dense mono receipt-style text",
    src: "/work/receipt-ocr/sample-cafe.png",
  },
  {
    id: "invoice",
    label: "Invoice layout",
    description: "Sparse serif document",
    src: "/work/receipt-ocr/sample-invoice.png",
  },
  {
    id: "retail",
    label: "Store slip",
    description: "Multi-line item list",
    src: "/work/receipt-ocr/sample-retail.png",
  },
  {
    id: "cafe-skewed",
    label: "Skewed slip",
    description: "Slight rotation — deskew stress test",
    src: "/work/receipt-ocr/sample-cafe-skewed.png",
  },
  {
    id: "cafe-lowcontrast",
    label: "Low contrast",
    description: "Washed text on busy paper texture",
    src: "/work/receipt-ocr/sample-cafe-lowcontrast.png",
  },
  {
    id: "retail-lowres",
    label: "Low-res",
    description: "Small / pixelated capture",
    src: "/work/receipt-ocr/sample-retail-lowres.png",
  },
];
