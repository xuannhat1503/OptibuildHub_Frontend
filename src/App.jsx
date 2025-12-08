import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useState } from "react";

export default function App() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-bold text-xl md:text-2xl text-blue-700">
              OptiBuildHub
            </Link>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-4">
              <nav className="flex items-center space-x-1">
                {[...navLinks, ...adminLinks].map((link) => {
                  const isActive = location.pathname === link.to || 
                    (link.to !== "/" && location.pathname.startsWith(link.to));
                  
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-3 py-2 rounded-md font-medium transition-colors text-sm ${
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
                <div className="flex items-center gap-2">
                  <Link
                    to={`/profile/${user.id}`}
                    className="text-sm text-gray-700 hover:text-blue-600 font-medium transition truncate max-w-[150px]"
                  >
                    👤 {user.fullName || user.email}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 font-medium"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pb-3 border-t pt-3">
              <nav className="flex flex-col space-y-2">
                {[...navLinks, ...adminLinks].map((link) => {
                  const isActive = location.pathname === link.to || 
                    (link.to !== "/" && location.pathname.startsWith(link.to));
                  
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3 py-2 rounded-md font-medium transition-colors ${
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
                <div className="mt-3 pt-3 border-t space-y-2">
                  <Link
                    to={`/profile/${user.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                  >
                    👤 {user.fullName || user.email}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 font-medium"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-center text-gray-700 hover:bg-gray-100 rounded-md font-medium border"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-4 md:py-8">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 mt-8 md:mt-12">
        <div className="mx-auto max-w-7xl px-4 py-4 md:py-6 text-center text-gray-600 text-xs md:text-sm">
          © 2025 OptiBuildHub - Nền tảng xây dựng cấu hình PC
        </div>
      </footer>
    </div>
  );
}