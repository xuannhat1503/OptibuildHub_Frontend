import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { to: "/parts", label: "Linh kiện" },
    { to: "/compare", label: "So sánh" },
    { to: "/builder", label: "Xây dựng PC" },
    { to: "/forum", label: "Diễn đàn" },
  ];

  const adminLinks = user?.role === "ADMIN" 
    ? [{ to: "/admin", label: "Quản lý" }]
    : [];

  const handleLogout = () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-bold text-2xl text-blue-700">
              OptiBuildHub
            </Link>
            <div className="flex items-center gap-4">
              <nav className="flex items-center space-x-1">
                {[...navLinks, ...adminLinks].map((link) => {
                  const isActive = location.pathname === link.to || 
                    (link.to !== "/" && location.pathname.startsWith(link.to));
                  
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={`/profile/${user.id}`}
                    className="text-sm text-gray-700 hover:text-blue-600 font-medium transition"
                  >
                    👤 {user.fullName || user.email}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 font-medium"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-gray-600 text-sm">
          © 2025 OptiBuildHub - Nền tảng xây dựng cấu hình PC
        </div>
      </footer>
    </div>
  );
}