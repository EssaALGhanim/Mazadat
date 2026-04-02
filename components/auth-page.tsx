"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, Store, TrendingUp } from "lucide-react";

function GeometricPattern() {
  return (
    <>
      <svg
        className="absolute inset-0 h-full w-full opacity-15"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="islamic-pattern"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* 8-pointed star pattern inspired by Islamic geometry */}
            <polygon
              points="40,5 45,20 60,20 48,30 53,45 40,35 27,45 32,30 20,20 35,20"
              fill="#2A9D8F"
              opacity="0.6"
            />
            <polygon
              points="40,75 45,60 60,60 48,50 53,35 40,45 27,35 32,50 20,60 35,60"
              fill="#2A9D8F"
              opacity="0.4"
            />
            <circle cx="40" cy="40" r="3" fill="#2A9D8F" opacity="0.5" />
            <circle cx="0" cy="0" r="2" fill="#2A9D8F" opacity="0.3" />
            <circle cx="80" cy="0" r="2" fill="#2A9D8F" opacity="0.3" />
            <circle cx="0" cy="80" r="2" fill="#2A9D8F" opacity="0.3" />
            <circle cx="80" cy="80" r="2" fill="#2A9D8F" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
      </svg>
      {/* Upward arrow watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <TrendingUp strokeWidth={1} className="w-[120%] h-[120%] text-[#2A9D8F] -rotate-12 translate-x-12 translate-y-12" />
      </div>
    </>
  );
}

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email" className="text-[#1A2E2C]">
          البريد الإلكتروني
        </Label>
        <Input
          id="login-email"
          type="email"
          placeholder="example@email.com"
          dir="ltr"
          className="h-11 rounded-lg border-[#C5E0DC] bg-white text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="login-password" className="text-[#1A2E2C]">
          كلمة المرور
        </Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            dir="ltr"
            className="h-11 rounded-lg border-[#C5E0DC] bg-white pe-11 text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6B9E99] transition-colors hover:text-[#1A2E2C]"
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            className="border-[#C5E0DC] data-[state=checked]:border-[#2A9D8F] data-[state=checked]:bg-[#2A9D8F]"
          />
          <Label
            htmlFor="remember"
            className="cursor-pointer text-sm font-normal text-[#6B9E99]"
          >
            تذكرني
          </Label>
        </div>
        <a
          href="#"
          className="text-sm text-[#2A9D8F] underline-offset-4 transition-colors hover:text-[#3DBFB0] hover:underline"
        >
          نسيت كلمة المرور؟
        </a>
      </div>

      <Button
        type="submit"
        className="mt-2 h-12 rounded-lg bg-[#2A9D8F] text-lg font-semibold text-white shadow-md transition-all hover:bg-[#1A7A6E] hover:shadow-lg"
      >
        تسجيل الدخول
      </Button>
    </form>
  );
}

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="register-name" className="text-[#1A2E2C]">
          الاسم الكامل
        </Label>
        <Input
          id="register-name"
          type="text"
          placeholder="محمد أحمد"
          className="h-11 rounded-lg border-[#C5E0DC] bg-white text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-email" className="text-[#1A2E2C]">
          البريد الإلكتروني
        </Label>
        <Input
          id="register-email"
          type="email"
          placeholder="example@email.com"
          dir="ltr"
          className="h-11 rounded-lg border-[#C5E0DC] bg-white text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-password" className="text-[#1A2E2C]">
          كلمة المرور
        </Label>
        <div className="relative">
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            dir="ltr"
            className="h-11 rounded-lg border-[#C5E0DC] bg-white pe-11 text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6B9E99] transition-colors hover:text-[#1A2E2C]"
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-confirm-password" className="text-[#1A2E2C]">
          تأكيد كلمة المرور
        </Label>
        <div className="relative">
          <Input
            id="register-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            dir="ltr"
            className="h-11 rounded-lg border-[#C5E0DC] bg-white pe-11 text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6B9E99] transition-colors hover:text-[#1A2E2C]"
            aria-label={
              showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Role Selector */}
      <div className="flex flex-col gap-3">
        <Label className="text-[#1A2E2C]">نوع الحساب</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
              role === "buyer"
                ? "border-[#2A9D8F] bg-[#EAF7F5] text-[#2A9D8F] shadow-sm"
                : "border-[#C5E0DC] bg-white text-[#6B9E99] hover:border-[#3DBFB0] hover:bg-[#F4FAFA]"
            }`}
          >
            <User
              className={`h-8 w-8 ${role === "buyer" ? "text-[#2A9D8F]" : "text-[#6B9E99]"}`}
            />
            <span className="font-semibold">مشتري</span>
            <span className="text-xs opacity-70">تصفح وشارك في المزادات</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("seller")}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
              role === "seller"
                ? "border-[#2A9D8F] bg-[#EAF7F5] text-[#2A9D8F] shadow-sm"
                : "border-[#C5E0DC] bg-white text-[#6B9E99] hover:border-[#3DBFB0] hover:bg-[#F4FAFA]"
            }`}
          >
            <Store
              className={`h-8 w-8 ${role === "seller" ? "text-[#2A9D8F]" : "text-[#6B9E99]"}`}
            />
            <span className="font-semibold">بائع</span>
            <span className="text-xs opacity-70">أنشئ مزاداتك الخاصة</span>
          </button>
        </div>
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start gap-2">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
          className="mt-0.5 border-[#C5E0DC] data-[state=checked]:border-[#2A9D8F] data-[state=checked]:bg-[#2A9D8F]"
        />
        <Label
          htmlFor="terms"
          className="cursor-pointer text-sm font-normal leading-relaxed text-[#6B9E99]"
        >
          أوافق على{" "}
          <a
            href="#"
            className="text-[#2A9D8F] underline underline-offset-4 transition-colors hover:text-[#3DBFB0]"
          >
            الشروط والأحكام
          </a>{" "}
          و{" "}
          <a
            href="#"
            className="text-[#2A9D8F] underline underline-offset-4 transition-colors hover:text-[#3DBFB0]"
          >
            سياسة الخصوصية
          </a>
        </Label>
      </div>

      <Button
        type="submit"
        disabled={!termsAccepted}
        className="mt-2 h-12 rounded-lg bg-[#2A9D8F] text-lg font-semibold text-white shadow-md transition-all hover:bg-[#1A7A6E] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
      >
        إنشاء حساب جديد
      </Button>
    </form>
  );
}

export default function AuthPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Decorative Panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-[#1A7A6E] lg:flex lg:flex-col lg:items-center lg:justify-center">
        <GeometricPattern />

        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center text-white">
          {/* Logo/Brand */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-4">
              <span className="text-6xl font-bold text-white tracking-tight pb-1">مزادات</span>
              <TrendingUp strokeWidth={3} className="h-14 w-14 text-white" />
            </div>
            <p className="text-2xl font-medium opacity-90 mt-2">Mazadat</p>
          </div>

          {/* Tagline */}
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-3xl font-bold">بيع. اشترِ. ثق.</p>
            <p className="text-lg opacity-80">Sell. Buy. Trust.</p>
          </div>

          {/* Description */}
          <p className="mt-6 max-w-md text-lg leading-relaxed opacity-90">
            منصة المزادات الموثوقة في المملكة العربية السعودية. انضم إلى آلاف
            المستخدمين الذين يثقون بنا.
          </p>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-32 -start-32 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -top-20 -end-20 h-40 w-40 rounded-full bg-white/5" />
      </div>

      {/* Right Form Panel */}
      <div className="relative flex w-full flex-col items-center justify-center bg-[#F4FAFA] px-6 py-12 lg:w-1/2 lg:px-16">
        
        {/* Teal-on-transparent logo: top-right of the left form panel */}
        <div className="absolute top-8 start-8 hidden lg:flex items-center gap-2 w-[120px]">
          <span className="text-2xl font-bold text-[#2A9D8F]">مزادات</span>
          <TrendingUp strokeWidth={3} className="h-6 w-6 text-[#2A9D8F]" />
        </div>

        {/* Mobile Logo */}
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <div className="flex items-center justify-center gap-2 w-[140px] h-[56px] rounded-xl bg-[#2A9D8F] text-white shadow-md">
            <span className="text-2xl font-bold pb-1 pt-0.5">مزادات</span>
            <TrendingUp strokeWidth={2.5} className="h-6 w-6" />
          </div>
        </div>

        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="mb-8 grid h-12 w-full grid-cols-2 rounded-xl bg-white border border-[#C5E0DC] p-1">
              <TabsTrigger
                value="login"
                className="rounded-lg text-base font-semibold text-[#6B9E99] transition-all data-[state=active]:bg-[#2A9D8F] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                تسجيل الدخول
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-lg text-base font-semibold text-[#6B9E99] transition-all data-[state=active]:bg-[#2A9D8F] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                حساب جديد
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#1A2E2C]">
                  مرحباً بعودتك
                </h2>
                <p className="mt-1 text-[#6B9E99]">
                  سجل دخولك للمتابعة إلى حسابك
                </p>
              </div>
              <LoginForm />
            </TabsContent>

            <TabsContent value="register" className="mt-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#1A2E2C]">
                  إنشاء حساب جديد
                </h2>
                <p className="mt-1 text-[#6B9E99]">
                  انضم إلينا وابدأ رحلتك في عالم المزادات
                </p>
              </div>
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
