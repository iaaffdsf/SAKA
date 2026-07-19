import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type FC,
} from 'react';

// ─── App context ──────────────────────────────────────────────────────────────

interface AppContextValue {
  /** Whether the sidebar / navigation drawer is open (mobile). */
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AppContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar: () => setIsSidebarOpen((prev) => !prev),
        closeSidebar: () => setIsSidebarOpen(false),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within <AppProvider>');
  return ctx;
}
