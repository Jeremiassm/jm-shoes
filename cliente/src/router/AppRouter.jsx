import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Sneakers from "../pages/Sneakers";
import Contact from "../pages/Contact";
import HowToBuy from "../pages/HowToBuy";
import About from "../pages/About";
import NotFound from "../pages/NotFound";
import RequireAuth from "../components/RequireAuth";
import PageLoader from "../components/PageLoader";

const SneakerDetail = lazy(() => import("../pages/SneakersDetail"));
const Login = lazy(() => import("../pages/Login"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const ProductForm = lazy(() => import("../components/admin/ProductForm"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/zapatillas" element={<Sneakers />} />
          <Route
            path="/zapatilla/:id"
            element={<SneakerDetail />}
          />
          <Route path="/como-comprar" element={<HowToBuy />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          <Route
            path="/admin/login"
            element={<Login />}
          />
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
      </Suspense>
    </BrowserRouter>
  );
}
