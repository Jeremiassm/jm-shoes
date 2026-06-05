import AppRouter from "./router/AppRouter";
import { CatalogProvider } from "./context/CatalogProvider";

function App() {
  return (
    <CatalogProvider>
      <AppRouter />
    </CatalogProvider>
  );
}

export default App;