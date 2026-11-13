import { createRoot } from 'react-dom/client';
import { migrateLegacyStorageKeys } from './lib/storageMigration';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import './index.css';

migrateLegacyStorageKeys();

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </AuthProvider>
);
