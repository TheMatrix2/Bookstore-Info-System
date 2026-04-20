import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ClientLayout from "./apps/client/layouts/clientLayout";
import AdminLayout from "./apps/admin/layouts/adminLayout";
import AdminLoginPage from "./apps/admin/pages/loginPage";
import AdminProfilePage from "./apps/admin/pages/profilePage";
import HomePage from "./apps/client/pages/homePage";
import ClientProfilePage from "./apps/client/pages/profilePage";
import { useAuthStore } from "./shared/authStore";
import PublishersPage from "./apps/client/pages/publishersPage";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { token, role } = useAuthStore();
  const allowed = ["admin", "manager", "delivery", "support"];
  if (!token || !role || !allowed.includes(role)) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin login — without layout */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin panel — with sidebar layout, protected */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        {/* Client routes */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ClientProfilePage />} />
          <Route path="publishers" element={<PublishersPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}