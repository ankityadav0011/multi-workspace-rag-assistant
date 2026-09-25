import { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../api/axiosClient";
import { useAuth } from "./AuthContext";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState(() =>
    localStorage.getItem("activeWorkspaceId")
  );
  const [loading, setLoading] = useState(false);

  const setActiveWorkspaceId = (id) => {
    localStorage.setItem("activeWorkspaceId", id);
    setActiveWorkspaceIdState(id);
  };

  const refreshWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/workspaces");
      setWorkspaces(data.workspaces);
      // If nothing is active yet (or the remembered one no longer exists),
      // default to the first workspace so the dashboard always has something scoped.
      const stillExists = data.workspaces.some((w) => w._id === activeWorkspaceId);
      if (!stillExists && data.workspaces.length > 0) {
        setActiveWorkspaceId(data.workspaces[0]._id);
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspaceId]);

  const createWorkspace = useCallback(async (name) => {
    const { data } = await api.post("/workspaces", { name });
    setWorkspaces((prev) => [...prev, data.workspace]);
    setActiveWorkspaceId(data.workspace._id);
    return data.workspace;
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshWorkspaces();
    } else {
      setWorkspaces([]);
      setActiveWorkspaceIdState(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const activeWorkspace = workspaces.find((w) => w._id === activeWorkspaceId) || null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspaceId,
        activeWorkspace,
        setActiveWorkspaceId,
        createWorkspace,
        refreshWorkspaces,
        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
