// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import ToastProvider from "./shared/ToastProvider";
// import ClientLayout from "./apps/client/layouts/ClientLayout";
// import AdminLayout from "./apps/admin/layouts/AdminLayout";
// import AdminLoginPage from "./apps/admin/pages/LoginPage";
// import AdminProfilePage from "./apps/admin/pages/ProfilePage";
// import HomePage from "./apps/client/pages/HomePage";
// import ProfilePage from "./apps/client/pages/ProfilePage";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <ToastProvider>
//         <Routes>
//           {/* Admin — отдельная страница логина без лэйаута */}
//           <Route path="/admin/login" element={<AdminLoginPage />} />

//           {/* Admin — всё остальное внутри AdminLayout */}
//           <Route path="/admin" element={<AdminLayout />}>
//             <Route path="profile" element={<AdminProfilePage />} />
//             {/* будущие роуты: orders, books, users и т.д. */}
//           </Route>

//           {/* Client routes */}
//           <Route path="/" element={<ClientLayout />}>
//             <Route index element={<HomePage />} />
//             <Route path="profile" element={<ProfilePage />} />
//           </Route>

//           {/* Fallback */}
//           <Route path="*" element={<ClientLayout />} />
//         </Routes>
//       </ToastProvider>
//     </BrowserRouter>
//   );
// }