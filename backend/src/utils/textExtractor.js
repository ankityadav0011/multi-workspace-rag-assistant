const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// Turns an uploaded file buffer into plain text, based on its mimetype/extension.
// Keeping this in one place means the rest of the pipeline never has to care
// what file type came in.
async function extractText(buffer, filename, mimeType) {
  const lower = filename.toLowerCase();

  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimeType === "text/plain" || lower.endsWith(".txt") || lower.endsWith(".md")) {
    return buffer.toString("utf-8");
  }

  const err = new Error(
    `Unsupported file type "${mimeType || lower}". Supported: .pdf, .docx, .txt, .md`
  );
  err.status = 400;
  throw err;
}

module.exports = { extractText };
