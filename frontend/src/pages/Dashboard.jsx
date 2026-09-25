import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import WorkspaceSwitcher from "../components/WorkspaceSwitcher";
import DocumentPanel from "../components/DocumentPanel";
import ChatWindow from "../components/ChatWindow";
import ToolLogPanel from "../components/ToolLogPanel";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { activeWorkspace, loading } = useWorkspace();
  const [toolLogRefresh, setToolLogRefresh] = useState(0);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Workspace RAG Assistant</h1>
        <div className="header-right">
          <span>{user?.email}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </header>

      <div className="dashboard-toolbar">
        <WorkspaceSwitcher />
      </div>

      {loading && <p className="empty-state">Loading workspaces...</p>}

      {!loading && !activeWorkspace && (
        <p className="empty-state">Create a workspace to get started.</p>
      )}

      {activeWorkspace && (
        <div className="dashboard-grid">
          <DocumentPanel />
          <ChatWindow onToolCall={() => setToolLogRefresh((n) => n + 1)} />
          <ToolLogPanel refreshSignal={toolLogRefresh} />
        </div>
      )}
    </div>
  );
}
