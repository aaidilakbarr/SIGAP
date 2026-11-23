import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppProvider } from './context/AppContext.jsx';
import { Toaster } from '@/components/ui/sonner';
import App from './App.jsx';
import DocumentPreviewPage from './components/pages/DocumentPreviewPage.jsx';

const isDocumentPreviewRoute = window.location.pathname.replace(/\/+$/, '') === '/preview-dokumen';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isDocumentPreviewRoute ? (
      <DocumentPreviewPage />
    ) : (
      <AppProvider>
        <App />
        <Toaster />
      </AppProvider>
    )}
  </StrictMode>
);
