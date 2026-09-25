import { useState, useEffect, useCallback } from "react";
import api from "../api/axiosClient";
import { useWorkspace } from "../context/WorkspaceContext";

export default function DocumentPanel() {
  const { activeWorkspaceId } = useWorkspace();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const loadDocuments = useCallback(async () => {
    if (!activeWorkspaceId) return;
    const { data } = await api.get(`/workspaces/${activeWorkspaceId}/documents`);
    setDocuments(data.documents);
  }, [activeWorkspaceId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file || !activeWorkspaceId) return;

    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post(`/workspaces/${activeWorkspaceId}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(data.message || `"${file.name}" uploaded and processed.`);
      await loadDocuments();
    } catch (err) {
      setMessage(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = ""; // allow re-selecting the same file later
    }
  }

  async function handleDelete(documentId) {
    await api.delete(`/workspaces/${activeWorkspaceId}/documents/${documentId}`);
    await loadDocuments();
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Documents</h2>
        <label className="upload-button">
          {uploading ? "Uploading..." : "Upload document"}
          <input type="file" accept=".pdf,.docx,.txt,.md" onChange={handleFileChange} disabled={uploading} hidden />
        </label>
      </div>

      {message && <p className="panel-message">{message}</p>}

      {documents.length === 0 ? (
        <p className="empty-state">No documents in this workspace yet.</p>
      ) : (
        <ul className="document-list">
          {documents.map((doc) => (
            <li key={doc._id} className={`document-item status-${doc.status}`}>
              <div>
                <strong>{doc.filename}</strong>
                <span className="doc-meta">
                  {doc.status} · {doc.chunkCount} chunk{doc.chunkCount === 1 ? "" : "s"}
                </span>
              </div>
              <button className="link-button" onClick={() => handleDelete(doc._id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
