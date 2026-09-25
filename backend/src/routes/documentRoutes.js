const express = require("express");
const multer = require("multer");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const { listDocuments, uploadDocument, deleteDocument } = require("../controllers/documentController");

// mergeParams lets this router read :workspaceId from the parent mount path
const router = express.Router({ mergeParams: true });

// Files are held in memory only long enough to extract text — never written to disk,
// so nothing sensitive lingers on the server's filesystem.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(requireAuth);
router.get("/", asyncHandler(listDocuments));
router.post("/", upload.single("file"), asyncHandler(uploadDocument));
router.delete("/:documentId", asyncHandler(deleteDocument));

module.exports = router;
