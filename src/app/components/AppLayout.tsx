import { useNavigate, useLocation, Outlet } from "react-router";
import { clearAuth, getUsername, isAdmin, getRole } from "../lib/auth";
import {
  Sprout,
  Calendar,
  LogOut,
  Leaf,
  Plus,
  Menu,
  BookOpen,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { FloatingChat } from "./FloatingChat";
import { PlansProvider } from "../contexts/PlansContext";
import { VarietiesProvider } from "../contexts/VarietiesContext";

const navItems = [
  { path: "/app/plots", label: "แปลงนา", icon: Sprout, adminOnly: false },
  { path: "/app/calendar", label: "ปฏิทิน", icon: Calendar, adminOnly: false },
  { path: "/app/knowledge", label: "คลังความรู้", icon: BookOpen, adminOnly: false },
  { path: "/app/admin", label: "จัดการระบบ", icon: BookOpen, adminOnly: true },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  const handleCreatePlan = () => {
    navigate("/app/create-plan");
  };

  return (
    <VarietiesProvider>
      <PlansProvider>
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border hidden lg:flex flex-col">
        <div className="p-6 border-b border-border">
          <button
            onClick={() => navigate("/app/plots")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-xl">Rice Expert</h1>
          </button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems
              .filter((item) => !item.adminOnly || isAdmin())
              .map(({ path, label, icon: Icon }) => {
              const isActive = currentPath === path;
              return (
                <li key={path}>
                  <button
                    onClick={() => navigate(path)}
                    className={`w-full h-11 flex items-center gap-3 px-4 rounded-lg transition-colors ${
                      isActive ? "bg-primary text-white" : "text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <div className="px-2 py-2 rounded-lg bg-accent/50 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
              {getUsername()?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{getUsername() ?? "-"}</p>
              <p className="text-xs text-muted-foreground">{getRole() === "admin" ? "Admin" : "User"}</p>
            </div>
          </div>
          <Button
            onClick={handleCreatePlan}
            className="w-full justify-start rounded-lg bg-primary hover:bg-primary/90"
          >
            <Plus className="w-5 h-5 mr-3" />
            สร้างแผนใหม่
          </Button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-border flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-accent"
          aria-label="เปิดเมนู"
        >
          <Menu className="w-6 h-6" />
        </button>
        <button
          onClick={() => navigate("/app/plots")}
          className="flex items-center gap-2"
        >
          <Leaf className="w-6 h-6 text-primary" />
          <span className="font-semibold">Rice Expert</span>
        </button>
        <div className="w-10" />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden
        />
      )}
      <div
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white border-r shadow-xl transition-transform duration-200 flex flex-col ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 pt-14 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="font-semibold">Rice Expert</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems
              .filter((item) => !item.adminOnly || isAdmin())
              .map(({ path, label, icon: Icon }) => {
              const isActive = currentPath === path;
              return (
                <li key={path}>
                  <button
                    onClick={() => {
                      navigate(path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full h-11 flex items-center gap-3 px-4 rounded-lg transition-colors ${
                      isActive ? "bg-primary text-white" : "text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <div className="px-2 py-2 rounded-lg bg-accent/50 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
              {getUsername()?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{getUsername() ?? "-"}</p>
              <p className="text-xs text-muted-foreground">{getRole() === "admin" ? "Admin" : "User"}</p>
            </div>
          </div>
          <Button
            onClick={() => {
              navigate("/app/create-plan");
              setMobileMenuOpen(false);
            }}
            className="w-full justify-start rounded-lg bg-primary hover:bg-primary/90"
          >
            <Plus className="w-5 h-5 mr-3" />
            สร้างแผนใหม่
          </Button>
          <button
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-accent"
          >
            <LogOut className="w-5 h-5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <FloatingChat />
    </div>
      </PlansProvider>
    </VarietiesProvider>
  );
}
