import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ClientLayout from "./apps/client/layouts/ClientLayout";
import AdminLayout from "./apps/admin/layouts/AdminLayout";
import BooksAdminPage from "./apps/admin/pages/BooksAdminPage";
import AuthorsAdminPage from "./apps/admin/pages/AuthorsAdminPage";
import PublishersAdminPage from "./apps/admin/pages/PublishersAdminPage";
import CategoriesAdminPage from "./apps/admin/pages/CategoriesAdminPage";
import UsersAdminPage from "./apps/admin/pages/UsersAdminPage";
import OrdersAdminPage from "./apps/admin/pages/OrdersAdminPage";
import PublishersPage from "./apps/client/pages/PublishersPage";
import CartPage from "./apps/client/pages/CartPage";
import OrdersPage from "./apps/client/pages/OrdersPage";
import { useAuthStore } from "./shared/authStore";
import AdminLoginPage from "./apps/admin/pages/LoginAdminPage";
import AdminProfilePage from "./apps/admin/pages/ProfileAdminPage";
import ClientProfilePage from "./apps/client/pages/ProfilePage";
import AuthorsPage from "./apps/client/pages/AuthorsPage";
import BooksPage from "./apps/client/pages/BooksPage";
import HomePage from "./apps/client/pages/HomePage";

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

        {/* Admin panel */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminProfilePage />} />
          <Route path="books" element={<BooksAdminPage />} />
          <Route path="authors" element={<AuthorsAdminPage />} />
          <Route path="publishers" element={<PublishersAdminPage />} />
          <Route path="categories" element={<CategoriesAdminPage />} />
          <Route path="users" element={<UsersAdminPage />} />
          <Route path="orders" element={<OrdersAdminPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* Client routes */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="books" element={<BooksPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="profile" element={<ClientProfilePage />} />
          <Route path="publishers" element={<PublishersPage />} />
          <Route path="authors" element={<AuthorsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
