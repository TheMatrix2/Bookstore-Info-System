import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClientLayout from "./apps/client/layouts/ClientLayout";
import AdminLayout from "./apps/admin/layouts/AdminLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/*"       element={<ClientLayout />} />
      </Routes>
    </BrowserRouter>
  );
}