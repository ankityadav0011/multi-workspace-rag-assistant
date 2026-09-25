import { useState, useEffect, useCallback } from "react";
import api from "../api/axiosClient";
import { useWorkspace } from "../context/WorkspaceContext";

export default function ToolLogPanel({ refreshSignal }) {
  const { activeWorkspaceId } = useWorkspace();
  const [logs, setLogs] = useState([]);

  const loadLogs = useCallback(async () => {
    if (!activeWorkspaceId) return;
    const { data } = await api.get(`/workspaces/${activeWorkspaceId}/tool-logs`);
    setLogs(data.logs);
  }, [activeWorkspaceId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs, refreshSignal]);

  return (
    <div className="panel">
      <h2>Tool call log</h2>
      {logs.length === 0 ? (
        <p className="empty-state">No tool calls in this workspace yet.</p>
      ) : (
        <ul className="tool-log-list">
          {logs.map((log) => (
            <li key={log._id} className={`tool-log-item status-${log.status}`}>
              <div className="tool-log-top">
                <strong>{log.toolName}</strong>
                <span className={`badge badge-${log.status}`}>{log.status}</span>
              </div>
              <div className="tool-log-args">args: {JSON.stringify(log.args)}</div>
              {log.result && <div className="tool-log-result">result: {JSON.stringify(log.result)}</div>}
              {log.error && <div className="tool-log-error">error: {log.error}</div>}
              <div className="tool-log-time">{new Date(log.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
