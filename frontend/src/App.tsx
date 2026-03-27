import { BrowserRouter, Routes, Route } from "react-router-dom";
import ToastProvider from "./shared/ToastProvider";
import ClientLayout from "./apps/client/layouts/ClientLayout";
import AdminLayout from "./apps/admin/layouts/AdminLayout";
import AdminLoginPage from "./apps/admin/pages/LoginPage";
import HomePage from "./apps/client/pages/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
          <Routes>
          <Route path="/admin/login"  element={<AdminLoginPage />} />
          <Route path="/admin/*"  element={<AdminLayout />} />

          <Route path="/" element={<ClientLayout />}>
            <Route index element={<HomePage />} />
            {/* Future routes: catalog, authors, etc. */}
            {/* <Route path="/catalog" element={<CatalogPage />} /> */}
          </Route>
          <Route path="/*" element={<ClientLayout />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}