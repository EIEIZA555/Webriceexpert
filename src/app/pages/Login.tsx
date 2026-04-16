import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Leaf, LogIn, Eye, EyeOff, Bot, CalendarDays, BarChart2, BookOpen, ArrowLeft } from "lucide-react";
import { isAuthenticated, login, register } from "../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(location.pathname === "/register");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locationState = location.state as any;

  useEffect(() => {
    setIsRegister(location.pathname === "/register");
    setError("");
  }, [location.pathname]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/app/plots", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await register(username, password);
        setLoading(false);
        navigate("/login", { replace: true, state: { registered: true } });
      } else {
        await login(username, password);
        navigate("/app/plots", { replace: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้";
      setError(message);
      setLoading(false);
    }
  };

  if (isAuthenticated()) return null;

  return (
    <div className="min-h-screen flex">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
          <Leaf className="w-7 h-7" />
          <span className="text-lg font-semibold">Rice Expert</span>
        </button>

        <div className="text-white">
          <h2 className="text-3xl font-semibold mb-2">ระบบผู้เชี่ยวชาญการปลูกข้าว</h2>
          <p className="text-white/70 text-sm mb-10">เข้าสู่ระบบเพื่อใช้งานฟีเจอร์ครบถ้วน</p>
          <div className="space-y-4">
            {[
              { icon: Bot, label: "ถาม-ตอบด้วย AI", desc: "ถามเรื่องโรค ปุ๋ย การดูแลข้าวได้ทันที" },
              { icon: CalendarDays, label: "วางแผนการปลูก", desc: "สร้างแผนงานและปฏิทินดูแลแปลงนา" },
              { icon: BarChart2, label: "ติดตามแปลงนา", desc: "ดูความคืบหน้าและงานที่ต้องทำ" },
              { icon: BookOpen, label: "คลังความรู้", desc: "เอกสารวิชาการข้าวพร้อมอ้างอิง" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-white/60">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div />
      </div>

      {/* Right side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับหน้าหลัก
          </button>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-1">
              {isRegister ? "สมัครสมาชิก" : "ยินดีต้อนรับ"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRegister
                ? "สร้างบัญชีเพื่อบันทึกแผนและประวัติการใช้งาน"
                : "เข้าสู่ระบบเพื่อใช้งานระบบผู้เชี่ยวชาญการปลูกข้าว"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">ชื่อผู้ใช้</Label>
              <Input
                id="username"
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                className="rounded-lg"
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
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="rounded-lg pr-10"
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

            {locationState?.registered && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                สมัครสมาชิกเรียบร้อย กรุณาเข้าสู่ระบบ
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="w-full rounded-lg h-11 bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {isRegister ? "กำลังสมัครสมาชิก..." : "กำลังเข้าสู่ระบบ..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={18} />
                  {isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isRegister ? (
              <>
                มีบัญชีอยู่แล้ว?{" "}
                <button type="button" onClick={() => navigate("/login")} className="text-primary hover:underline">
                  เข้าสู่ระบบ
                </button>
              </>
            ) : (
              <>
                ยังไม่มีบัญชี?{" "}
                <button type="button" onClick={() => navigate("/register")} className="text-primary hover:underline">
                  สมัครสมาชิก
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
