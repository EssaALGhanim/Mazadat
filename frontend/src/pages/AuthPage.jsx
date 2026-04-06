import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, Store, TrendingUp } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { registerBuyer, registerSeller, login } from "@/services/authService";

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
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <TrendingUp strokeWidth={1} className="w-[120%] h-[120%] text-[#2A9D8F] -rotate-12 translate-x-12 translate-y-12" />
        </div>
      </>
  );
}

function LoginForm() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('BUYER');
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError(t('requiredFields'));
      return;
    }
    setLoading(true);
    try {
      await login(formData.username, formData.password, role);
      navigate('/');
    } catch {
      setError(t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && (
            <div className="bg-red-50 border border-[#E05252] text-[#E05252] rounded-lg px-4 py-3 text-sm font-semibold">
              {error}
            </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="login-username" className="text-[#1A2E2C] rtl:text-right ltr:text-left">
            {t('username')}
          </Label>
          <Input
              id="login-username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder={t('namePlaceholder')}
              className="h-11 rounded-lg border-[#C5E0DC] bg-white text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30 rtl:text-right ltr:text-left"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="login-password" className="text-[#1A2E2C] rtl:text-right ltr:text-left">
            {t('password')}
          </Label>
          <div className="relative">
            <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                dir="ltr"
                className="h-11 rounded-lg border-[#C5E0DC] bg-white pe-11 text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30 ltr:text-left rtl:text-right"
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6B9E99] transition-colors hover:text-[#1A2E2C]"
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked)}
                className="border-[#C5E0DC] data-[state=checked]:border-[#2A9D8F] data-[state=checked]:bg-[#2A9D8F]"
            />
            <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-[#6B9E99]">
              {t('rememberMe')}
            </Label>
          </div>
          <a href="#" className="text-sm text-[#2A9D8F] underline-offset-4 transition-colors hover:text-[#3DBFB0] hover:underline">
            {t('forgotPassword')}
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-[#1A2E2C] rtl:text-right ltr:text-left">{t('accountType')}</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
                type="button"
                onClick={() => setRole('BUYER')}
                className={`rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                    role === 'BUYER'
                        ? 'border-[#2A9D8F] bg-[#EAF7F5] text-[#2A9D8F]'
                        : 'border-[#C5E0DC] bg-white text-[#6B9E99] hover:bg-[#F4FAFA]'
                }`}
            >
              {t('buyer')}
            </button>
            <button
                type="button"
                onClick={() => setRole('SELLER')}
                className={`rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                    role === 'SELLER'
                        ? 'border-[#2A9D8F] bg-[#EAF7F5] text-[#2A9D8F]'
                        : 'border-[#C5E0DC] bg-white text-[#6B9E99] hover:bg-[#F4FAFA]'
                }`}
            >
              {t('seller')}
            </button>
          </div>
        </div>

        <Button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 rounded-lg bg-[#2A9D8F] text-lg font-semibold text-white shadow-md transition-all hover:bg-[#1A7A6E] hover:shadow-lg disabled:opacity-50"
        >
          {loading ? '...' : t('login')}
        </Button>
      </form>
  );
}

function RegisterForm() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('buyer');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bankAccount: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError(t('requiredFields'));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }
    if (!termsAccepted) {
      setError(t('acceptTerms'));
      return;
    }

    setLoading(true);
    try {
      if (role === 'buyer') {
        await registerBuyer({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
      } else {
        await registerSeller({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          bankAccount: formData.bankAccount,
        });
      }
      await login(formData.username, formData.password, role === 'buyer' ? 'BUYER' : 'SELLER');
      navigate('/');
    } catch {
      setError(t('registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && (
            <div className="bg-red-50 border border-[#E05252] text-[#E05252] rounded-lg px-4 py-3 text-sm font-semibold">
              {error}
            </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="register-name" className="text-[#1A2E2C] rtl:text-right ltr:text-left">
            {t('username')}
          </Label>
          <Input
              id="register-name"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder={t('namePlaceholder')}
              className="h-11 rounded-lg border-[#C5E0DC] bg-white text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30 rtl:text-right ltr:text-left"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="register-email" className="text-[#1A2E2C] rtl:text-right ltr:text-left">
            {t('email')}
          </Label>
          <Input
              id="register-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('emailPlaceholder')}
              dir="ltr"
              className="h-11 rounded-lg border-[#C5E0DC] bg-white text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30 rtl:text-right ltr:text-left"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="register-password" className="text-[#1A2E2C] rtl:text-right ltr:text-left">
            {t('password')}
          </Label>
          <div className="relative">
            <Input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                dir="ltr"
                className="h-11 rounded-lg border-[#C5E0DC] bg-white pe-11 text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30 ltr:text-left rtl:text-right"
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6B9E99] transition-colors hover:text-[#1A2E2C]"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="register-confirm-password" className="text-[#1A2E2C] rtl:text-right ltr:text-left">
            {t('confirmPassword')}
          </Label>
          <div className="relative">
            <Input
                id="register-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                dir="ltr"
                className="h-11 rounded-lg border-[#C5E0DC] bg-white pe-11 text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30 ltr:text-left rtl:text-right"
            />
            <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6B9E99] transition-colors hover:text-[#1A2E2C]"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Role Selector */}
        <div className="flex flex-col gap-3">
          <Label className="text-[#1A2E2C] rtl:text-right ltr:text-left">{t('accountType')}</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    role === 'buyer'
                        ? 'border-[#2A9D8F] bg-[#EAF7F5] text-[#2A9D8F] shadow-sm'
                        : 'border-[#C5E0DC] bg-white text-[#6B9E99] hover:border-[#3DBFB0] hover:bg-[#F4FAFA]'
                }`}
            >
              <User className={`h-8 w-8 ${role === 'buyer' ? 'text-[#2A9D8F]' : 'text-[#6B9E99]'}`} />
              <span className="font-semibold">{t('buyer')}</span>
              <span className="text-xs opacity-70">{t('buyerDesc')}</span>
            </button>
            <button
                type="button"
                onClick={() => setRole('seller')}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    role === 'seller'
                        ? 'border-[#2A9D8F] bg-[#EAF7F5] text-[#2A9D8F] shadow-sm'
                        : 'border-[#C5E0DC] bg-white text-[#6B9E99] hover:border-[#3DBFB0] hover:bg-[#F4FAFA]'
                }`}
            >
              <Store className={`h-8 w-8 ${role === 'seller' ? 'text-[#2A9D8F]' : 'text-[#6B9E99]'}`} />
              <span className="font-semibold">{t('seller')}</span>
              <span className="text-xs opacity-70">{t('sellerDesc')}</span>
            </button>
          </div>
        </div>

        {/* Bank Account — Sellers only */}
        {role === 'seller' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="bank-account" className="text-[#1A2E2C] rtl:text-right ltr:text-left">
                {t('bankAccount')}
              </Label>
              <Input
                  id="bank-account"
                  name="bankAccount"
                  type="text"
                  value={formData.bankAccount}
                  onChange={handleChange}
                  className="h-11 rounded-lg border-[#C5E0DC] bg-white text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30 rtl:text-right ltr:text-left"
              />
            </div>
        )}

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2">
          <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked)}
              className="mt-0.5 border-[#C5E0DC] data-[state=checked]:border-[#2A9D8F] data-[state=checked]:bg-[#2A9D8F]"
          />
          <Label htmlFor="terms" className="cursor-pointer text-sm font-normal leading-relaxed text-[#6B9E99] rtl:text-right ltr:text-left">
            {t('agreeTo')}{' '}
            <a href="/policies" className="text-[#2A9D8F] underline underline-offset-4 transition-colors hover:text-[#3DBFB0]">
              {t('termsAndConditions')}
            </a>{' '}
            {t('and')}{' '}
            <a href="/policies" className="text-[#2A9D8F] underline underline-offset-4 transition-colors hover:text-[#3DBFB0]">
              {t('privacyPolicy')}
            </a>
          </Label>
        </div>

        <Button
            type="submit"
            disabled={!termsAccepted || loading}
            className="mt-2 h-12 rounded-lg bg-[#2A9D8F] text-lg font-semibold text-white shadow-md transition-all hover:bg-[#1A7A6E] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '...' : t('createAccount')}
        </Button>
      </form>
  );
}

export default function AuthPage() {
  const { t } = useTranslation('auth');
  const { t: tCommon } = useTranslation('common');

  return (
      <div className="flex min-h-screen">
        <LanguageSwitcher />

        {/* Left Decorative Panel */}
        <div className="relative hidden w-1/2 overflow-hidden bg-[#1A7A6E] lg:flex lg:flex-col lg:items-center lg:justify-center">
          <GeometricPattern />
          <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center text-white">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-4">
                <span className="text-6xl font-bold text-white tracking-tight pb-1">{tCommon('brandName')}</span>
                <TrendingUp strokeWidth={3} className="h-14 w-14 text-white" />
              </div>
              <p className="text-2xl font-medium opacity-90 mt-2">{tCommon('brandSubtitle')}</p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-3xl font-bold">{t('welcomeTitle')}</p>
            </div>
            <p className="mt-6 max-w-md text-lg leading-relaxed opacity-90">
              {t('welcomeSubtitle')}
            </p>
          </div>
          <div className="absolute -bottom-32 -start-32 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -top-20 -end-20 h-40 w-40 rounded-full bg-white/5" />
        </div>

        {/* Right Form Panel */}
        <div className="relative flex w-full flex-col items-center justify-center bg-[#F4FAFA] px-6 py-12 lg:w-1/2 lg:px-16">
          <div className="absolute top-8 start-8 hidden lg:flex items-center gap-2 w-[120px]">
            <span className="text-2xl font-bold text-[#2A9D8F]">{tCommon('brandName')}</span>
            <TrendingUp strokeWidth={3} className="h-6 w-6 text-[#2A9D8F]" />
          </div>

          <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
            <div className="flex items-center justify-center gap-2 w-[140px] h-[56px] rounded-xl bg-[#2A9D8F] text-white shadow-md">
              <span className="text-2xl font-bold pb-1 pt-0.5">{tCommon('brandName')}</span>
              <TrendingUp strokeWidth={2.5} className="h-6 w-6" />
            </div>
          </div>

          <div className="w-full max-w-md mt-6 lg:mt-0">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="mb-8 grid h-12 w-full grid-cols-2 rounded-xl bg-white border border-[#C5E0DC] p-1">
                <TabsTrigger
                    value="login"
                    className="rounded-lg text-base font-semibold text-[#6B9E99] transition-all data-[state=active]:bg-[#2A9D8F] data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  {t('login')}
                </TabsTrigger>
                <TabsTrigger
                    value="register"
                    className="rounded-lg text-base font-semibold text-[#6B9E99] transition-all data-[state=active]:bg-[#2A9D8F] data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  {t('register')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <div className="mb-6 rtl:text-right ltr:text-left">
                  <h2 className="text-2xl font-bold text-[#1A2E2C]">{t('welcomeBack')}</h2>
                  <p className="mt-1 text-[#6B9E99]">{t('loginToContinue')}</p>
                </div>
                <LoginForm />
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <div className="mb-6 rtl:text-right ltr:text-left">
                  <h2 className="text-2xl font-bold text-[#1A2E2C]">{t('createAccountTitle')}</h2>
                  <p className="mt-1 text-[#6B9E99]">{t('joinUs')}</p>
                </div>
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
  );
}