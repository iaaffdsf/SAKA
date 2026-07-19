import { Router, Route, Switch } from 'wouter';
import { AppProvider } from './contexts/AppContext.js';
import MainLayout from './components/layout/MainLayout.js';
import HomePage from './pages/HomePage.js';
import IDEPage from './pages/IDEPage.js';
import NotFoundPage from './pages/NotFoundPage.js';

// ─── Application root ─────────────────────────────────────────────────────────

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Switch>
          <Route path="/"    component={() => <MainLayout><HomePage /></MainLayout>} />
          <Route path="/ide" component={IDEPage} />
          <Route            component={() => <MainLayout><NotFoundPage /></MainLayout>} />
        </Switch>
      </Router>
    </AppProvider>
  );
}
