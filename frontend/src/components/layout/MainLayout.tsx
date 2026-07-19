import type { FC, ReactNode } from 'react';
import Header from './Header.js';
import Footer from './Footer.js';

// ─── Main layout ──────────────────────────────────────────────────────────────

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
    <Header />
    <main className="flex-1 pt-14">{children}</main>
    <Footer />
  </div>
);

export default MainLayout;
