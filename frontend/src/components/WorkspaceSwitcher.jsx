import { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";

export default function WorkspaceSwitcher() {
  const { workspaces, activeWorkspaceId, setActiveWorkspaceId, createWorkspace } = useWorkspace();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    await createWorkspace(newName.trim());
    setNewName("");
    setCreating(false);
  }

  return (
    <div className="workspace-switcher">
      <select
        value={activeWorkspaceId || ""}
        onChange={(e) => setActiveWorkspaceId(e.target.value)}
      >
        {workspaces.map((w) => (
          <option key={w._id} value={w._id}>
            {w.name}
          </option>
        ))}
      </select>

      {creating ? (
        <form onSubmit={handleCreate} className="new-workspace-form">
          <input
            autoFocus
            placeholder="Workspace name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit">Add</button>
          <button type="button" onClick={() => setCreating(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button onClick={() => setCreating(true)}>+ New workspace</button>
      )}
    </div>
  );
}
