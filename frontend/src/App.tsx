import { BrowserRouter, Routes, Route } from "react-router-dom";
import ToastProvider from "./shared/ToastProvider";
import ClientLayout from "./apps/client/layouts/ClientLayout";
import AdminLayout from "./apps/admin/layouts/AdminLayout";
import LoginPage from "./apps/client/pages/LoginPage";
import RegisterPage from "./apps/client/pages/RegisterPage";
import AdminLoginPage from "./apps/admin/pages/LoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
          <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/admin/login"  element={<AdminLoginPage />} />

          <Route path="/admin/*"  element={<AdminLayout />} />
          <Route path="/*"        element={<ClientLayout />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}