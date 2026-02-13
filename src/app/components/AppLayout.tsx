import { useNavigate, useLocation, Outlet } from "react-router";
import { clearAuth, isAdmin } from "../lib/auth";
import {
  LayoutDashboard,
  Sprout,
  Calendar,
  Settings,
  LogOut,
  Leaf,
  Plus,
  Menu,
  BookOpen,
  ListTodo,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { FloatingChat } from "./FloatingChat";

const navItems = [
  { path: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard, adminOnly: false },
  { path: "/plots", label: "แปลงนา", icon: Sprout, adminOnly: false },
  { path: "/calendar", label: "ปฏิทิน", icon: Calendar, adminOnly: false },
  { path: "/todos", label: "บันทึกสิ่งที่ต้องทำ", icon: ListTodo, adminOnly: false },
  { path: "/settings", label: "ตั้งค่า", icon: Settings, adminOnly: false },
  { path: "/knowledge", label: "คลังข้อมูล PDF", icon: BookOpen, adminOnly: true },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const handleCreatePlan = () => {
    navigate("/create-plan");
  };

  return (
    <div className="min-h-screen bg-slate-50/80 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 shadow-sm hidden lg:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">Rice Expert</h1>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <ul className="space-y-1">
            {navItems
              .filter((item) => !item.adminOnly || isAdmin())
              .map(({ path, label, icon: Icon }) => {
              const isActive = currentPath === path;
              return (
                <li key={path}>
                  <button
                    onClick={() => navigate(path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
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

        <div className="p-4 border-t border-slate-100 space-y-2">
          <Button
            onClick={handleCreatePlan}
            className="w-full justify-start rounded-xl h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-medium"
          >
            <Plus className="w-5 h-5 mr-3" />
            สร้างแผนใหม่
          </Button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-accent"
          aria-label="เปิดเมนู"
        >
          <Menu className="w-6 h-6" />
        </button>
        <button
          onClick={() => navigate("/dashboard")}
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
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white border-r shadow-xl transition-transform duration-200 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 pt-14 border-b border-border">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="font-semibold">Rice Expert</span>
          </div>
        </div>
        <nav className="p-4">
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? "bg-emerald-600 text-white" : "text-slate-700 hover:bg-slate-100"
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
          <Button
            onClick={() => {
              navigate("/create-plan");
              setMobileMenuOpen(false);
            }}
            className="w-full justify-start rounded-xl h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            <Plus className="w-5 h-5 mr-3" />
            สร้างแผนใหม่
          </Button>
          <button
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium"
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

      {/* Floating Chatbot */}
      <FloatingChat />
    </div>
  );
}
