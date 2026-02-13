import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Leaf, LogIn, Eye, EyeOff } from "lucide-react";
import { setAuth, isAuthenticated, validateCredentials } from "../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const result = validateCredentials(username, password);
      if (result.ok) {
        setAuth(username, result.role);
        navigate("/dashboard", { replace: true });
      } else {
        setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (user: farmer/1234, admin: admin/admin123)");
        setLoading(false);
      }
    }, 500);
  };

  if (isAuthenticated()) return null;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image with overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1655903724829-37b3cd3d4ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHJpY2UlMjBmaWVsZCUyMHBhZGR5fGVufDF8fHx8MTc3MDk5MzIzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Rice field"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#059669]/80 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Leaf className="w-12 h-12" />
              <h1 className="text-4xl">Rice Expert</h1>
            </div>
            <p className="text-lg opacity-90">ระบบจัดการแปลงนาอัจฉริยะ</p>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-2xl text-primary">Rice Expert</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl mb-2">ยินดีต้อนรับ</h2>
            <p className="text-muted-foreground">เข้าสู่ระบบเพื่อจัดการแปลงนาของคุณ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">ชื่อผู้ใช้</Label>
              <Input
                id="username"
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                className="rounded-lg bg-input-background border-border"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="rounded-lg bg-input-background border-border pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="w-full rounded-lg h-12 bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn size={20} />
                  เข้าสู่ระบบ
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ยังไม่มีบัญชี?{" "}
            <a href="#" className="text-primary hover:underline">
              สมัครสมาชิก
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
