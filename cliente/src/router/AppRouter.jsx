import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Sneakers from "../pages/Sneakers";
import SneakerDetail from "../pages/SneakersDetail";
import Contact from "../pages/Contact";
import HowToBuy from "../pages/HowToBuy";
import Login from "../pages/Login";
import AdminDashboard from "../pages/AdminDashboard";
import ProductForm from "../components/admin/ProductForm";
import NotFound from "../pages/NotFound";
import RequireAuth from "../components/RequireAuth";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/zapatillas" element={<Sneakers />} />
        <Route path="/zapatilla/:id" element={<SneakerDetail />} />
        <Route path="/como-comprar" element={<HowToBuy />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/nuevo"
          element={
            <RequireAuth>
              <ProductForm />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/editar/:id"
          element={
            <RequireAuth>
              <ProductForm isEdit={true} />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
