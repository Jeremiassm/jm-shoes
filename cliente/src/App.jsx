import AppRouter from "./router/AppRouter";
import { CatalogProvider } from "./context/CatalogProvider";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CatalogProvider>
            <AppRouter />
          </CatalogProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
