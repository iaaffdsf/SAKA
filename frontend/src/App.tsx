import { Router, Route, Switch } from 'wouter';
import { AppProvider } from './contexts/AppContext.js';
import HomePage from './pages/HomePage.js';
import IDEPage from './pages/IDEPage.js';
import NotFoundPage from './pages/NotFoundPage.js';

// ─── Application root ─────────────────────────────────────────────────────────

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Switch>
          <Route path="/"    component={HomePage} />
          <Route path="/ide" component={IDEPage} />
          <Route            component={NotFoundPage} />
        </Switch>
      </Router>
    </AppProvider>
  );
}
