import { useState } from "react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Leaf } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - navigate to dashboard
    navigate("/dashboard");
  };

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
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg bg-input-background border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg bg-input-background border-border"
                required
              />
            </div>

            <Button type="submit" className="w-full rounded-lg h-12 bg-primary hover:bg-primary/90">
              เข้าสู่ระบบ
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
