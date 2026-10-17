import multer from "multer";

const MAX_PDF_SIZE = 15 * 1024 * 1024;

const uploadProjectPDF = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_PDF_SIZE - 1, // strictly less than 15 MB
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const isPDF =
      file.mimetype === "application/pdf" &&
      file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPDF) {
      return callback(new Error("Only PDF files are allowed."));
    }

    callback(null, true);
  },
});

export default uploadProjectPDF;