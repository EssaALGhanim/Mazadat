import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Check, Eye, EyeOff, Mail, ShieldCheck, Store, TrendingUp, User, X } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { login } from '@/services/authService';
import { getSellerAuctionHouse } from '@/services/auctionHouseService';
import { sendOtp, startRegistrationOtp, verifyOtp } from '@/services/notificationService';
import { toast } from 'sonner';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function GeometricPattern() {
  return (
    <>
      <svg className="absolute inset-0 h-full w-full opacity-15" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="islamic-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <polygon points="40,5 45,20 60,20 48,30 53,45 40,35 27,45 32,30 20,20 35,20" fill="#2A9D8F" opacity="0.6" />
            <polygon points="40,75 45,60 60,60 48,50 53,35 40,45 27,35 32,50 20,60 35,60" fill="#2A9D8F" opacity="0.4" />
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

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[#E05252]">
      <X className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

function CheckItem({ met, label }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs transition-colors ${met ? 'text-[#2A9D8F]' : 'text-[#9CA3AF]'}`}>
      {met
        ? <Check className="h-3.5 w-3.5 shrink-0" />
        : <X className="h-3.5 w-3.5 shrink-0" />}
      <span>{label}</span>
    </div>
  );
}

function mapLoginError(err, t) {
  const msg = (err?.message || '').toLowerCase();
  // Only map genuinely wrong-credential signals — do NOT use broad terms like
  // 'invalid' or 'not found' which can also match OTP / other unrelated errors.
  if (
    msg.includes('bad credentials') ||
    msg === 'invalid credentials' ||
    msg.includes('authentication failed') ||
    (msg.includes('unauthorized') && !msg.includes('otp'))
  ) {
    return t('wrongCredentials');
  }
  return err?.message || t('loginFailed');
}

function mapRegisterError(err, t) {
  const raw = err?.message || '';
  const msg = raw.toLowerCase();

  if (msg.includes('username already exists') || (msg.includes('username') && msg.includes('exists'))) {
    return t('usernameAlreadyExists');
  }
  if (msg.includes('email already exists') || (msg.includes('email') && msg.includes('exists'))) {
    return t('emailAlreadyExists');
  }
  if (
    msg.includes('phone number already exists') ||
    msg.includes('phone already exists') ||
    (msg.includes('phone') && msg.includes('exists'))
  ) {
    return t('phoneAlreadyExists');
  }

  if (msg.includes('username') && (msg.includes('invalid') || msg.includes('format'))) {
    return t('usernameInvalidChars');
  }
  if (msg.includes('email') && (msg.includes('invalid') || msg.includes('format'))) {
    return t('emailInvalid');
  }
  if (msg.includes('phone') && (msg.includes('invalid') || msg.includes('format') || msg.includes('+966'))) {
    return t('invalidSaudiPhone');
  }
  if (msg.includes('password') && (msg.includes('weak') || msg.includes('invalid'))) {
    return t('passwordWeak');
  }

  if (msg.includes('size must be between') || msg.includes('length') || msg.includes('must be between')) {
    if (msg.includes('username')) return t('usernameLengthInvalid');
    if (msg.includes('phone')) return t('phoneLengthInvalid');
  }

  if (
    msg.includes('validation') ||
    msg.includes('not valid') ||
    msg.includes('constraint') ||
    msg.includes('must not be blank') ||
    msg.includes('cannot be blank')
  ) {
    return t('registerValidationFailed');
  }

  return raw || t('registerFailed');
}

// ─── OTP Modal ────────────────────────────────────────────────────────────────

function OtpModal({ maskedEmail, identifier, onVerified, onCancel, isAr }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const digits = code.split('');
    digits[idx] = val.slice(-1);
    const next = digits.join('').padEnd(6, '').slice(0, 6);
    setCode(next.trimEnd());
    setError(null);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length < 6) { setError(isAr ? 'أدخل الرمز المكون من 6 أرقام' : 'Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      await verifyOtp(identifier, code);
      onVerified();
    } catch (err) {
      setError(err.message || (isAr ? 'رمز غير صحيح' : 'Invalid code'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await sendOtp(identifier);
      toast.success(isAr ? 'تم إعادة إرسال الرمز' : 'Code resent to your email');
      setCode('');
      setError(null);
    } catch (err) {
      toast.error(err.message || (isAr ? 'فشل إعادة الإرسال' : 'Failed to resend'));
    } finally {
      setResending(false);
    }
  };

  const codeArr = Array.from({ length: 6 }, (_, i) => code[i] || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#EAF7F5]">
          <ShieldCheck className="w-7 h-7 text-[#2A9D8F]" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-[#1A2E2C]">{isAr ? 'التحقق من البريد الإلكتروني' : 'Email Verification'}</h3>
          <p className="mt-1 text-sm text-[#6B9E99] flex items-center justify-center gap-1">
            <Mail className="w-4 h-4" />
            {isAr ? `تم إرسال رمز التحقق إلى ${maskedEmail}` : `Code sent to ${maskedEmail}`}
          </p>
        </div>
        {error && (
          <div className="w-full bg-red-50 border border-[#E05252] text-[#E05252] rounded-lg px-3 py-2 text-sm text-center font-semibold">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5 w-full">
          <div className="flex gap-2 sm:gap-3 justify-center" dir="ltr">
            {codeArr.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-12 sm:w-14 text-center text-lg sm:text-xl font-bold border-2 rounded-lg outline-none transition-all text-[#1A2E2C] border-[#C5E0DC] focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/30 bg-white"
                style={{ height: '48px' }}
              />
            ))}
          </div>
          <Button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full h-11 rounded-lg bg-[#2A9D8F] text-base font-semibold text-white hover:bg-[#1A7A6E] disabled:opacity-50"
          >
            {loading ? '...' : (isAr ? 'تحقق' : 'Verify')}
          </Button>
        </form>
        <div className="flex items-center gap-3 text-sm text-[#6B9E99]">
          <span>{isAr ? 'لم تستلم الرمز؟' : "Didn't receive it?"}</span>
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-[#2A9D8F] font-semibold hover:underline disabled:opacity-50"
          >
            {resending ? '...' : (isAr ? 'إعادة إرسال' : 'Resend')}
          </button>
        </div>
        <button onClick={onCancel} className="text-xs text-[#6B9E99] hover:text-[#1A2E2C] transition-colors">
          {isAr ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}

// ─── Seller bootstrap ─────────────────────────────────────────────────────────

async function handleSellerNoAuctionHouseNotice() {
  try {
    await getSellerAuctionHouse();
    localStorage.removeItem('sellerNoAuctionHouseNotice');
  } catch (err) {
    if ((err?.message || '').toLowerCase().includes('not part of any auction house')) {
      localStorage.setItem('sellerNoAuctionHouseNotice', '1');
      toast.error('You are not part of any Auction House yet / أنت غير منضم إلى أي صالة مزاد حالياً');
      return;
    }
    throw err;
  }
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const { t, i18n } = useTranslation('auth');
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [pendingUser, setPendingUser] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.username) errs.username = t('fieldRequired');
    if (!formData.password) errs.password = t('fieldRequired');
    if (Object.keys(errs).length) { setFieldErrors((prev) => ({ ...prev, ...errs })); return; }

    setLoading(true);
    // Step 1: verify credentials
    let user;
    try {
      user = await login(formData.username, formData.password);
    } catch (err) {
      setError(mapLoginError(err, t));
      setLoading(false);
      return;
    }
    setPendingUser(user);

    // continue with normal OTP flow

    // Step 2: send OTP — credentials are correct; show a softer error if OTP delivery fails
    try {
      const res = await sendOtp(formData.username);
      setMaskedEmail(res?.data?.maskedEmail || '');
      setOtpStep(true);
    } catch (err) {
      // Login succeeded — don't mislead with "wrong credentials"
      setError(err?.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = async () => {
    setOtpStep(false);
    try {
      if (pendingUser?.role === 'SELLER') { await handleSellerNoAuctionHouseNotice(); navigate('/seller-dashboard'); }
      else { navigate('/'); }
    } catch { navigate('/'); }
  };

   const handleOtpCancel = () => { setOtpStep(false); setPendingUser(null); localStorage.removeItem('user'); };

   

    return (
     <>
       {otpStep && <OtpModal maskedEmail={maskedEmail} identifier={formData.username} onVerified={handleOtpVerified} onCancel={handleOtpCancel} isAr={isAr} />}
       <form className="flex flex-col gap-5" onSubmit={handleSubmit} dir={isAr ? 'rtl' : 'ltr'}>
        {/* development quick-login removed */}

         {error && (
           <div className="flex items-start gap-2 rounded-lg border border-[#E05252] bg-red-50 px-4 py-3 text-sm font-semibold text-[#E05252]">
             <X className="mt-0.5 h-4 w-4 shrink-0" />
             {error}
           </div>
         )}

         <div className="flex flex-col gap-1">
          <Label htmlFor="login-username" className="text-start text-[#1A2E2C]">{t('username')}</Label>
          <Input
            id="login-username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder={t('namePlaceholder')}
            className={`h-11 rounded-lg border-[#C5E0DC] bg-white text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30 text-start ${fieldErrors.username ? 'border-[#E05252]' : ''}`}
          />
          <FieldError message={fieldErrors.username} />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="login-password" className="text-start text-[#1A2E2C]">{t('password')}</Label>
          <div className="relative">
            <Input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              dir={isAr ? 'rtl' : 'ltr'}
              className={`h-11 rounded-lg border-[#C5E0DC] bg-white pe-11 text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30 ${fieldErrors.password ? 'border-[#E05252]' : ''}`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6B9E99] transition-colors hover:text-[#1A2E2C]"
              aria-label={showPassword ? t('hidePassword') : t('showPassword')}>
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <FieldError message={fieldErrors.password} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" checked={rememberMe} onCheckedChange={setRememberMe}
              className="border-[#C5E0DC] data-[state=checked]:border-[#2A9D8F] data-[state=checked]:bg-[#2A9D8F]" />
            <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-[#6B9E99]">{t('rememberMe')}</Label>
          </div>
          <a href="#" className="text-sm text-[#2A9D8F] underline-offset-4 hover:underline">{t('forgotPassword')}</a>
        </div>

        <Button type="submit" disabled={loading}
          className="mt-2 h-12 rounded-lg bg-[#2A9D8F] text-lg font-semibold text-white shadow-md hover:bg-[#1A7A6E] disabled:opacity-50">
          {loading ? '...' : t('login')}
        </Button>
      </form>
    </>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────

function RegisterForm() {
  const { t, i18n } = useTranslation('auth');
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('buyer');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [localPhone, setLocalPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ username: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [otpStep, setOtpStep] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [pendingUser, setPendingUser] = useState(null);

  // ── Password checks ─────────────────────────────────────────────────────────
  const passwordChecks = useMemo(() => ({
    length:   formData.password.length >= 8,
    maxLen:   formData.password.length <= 32 && formData.password.length > 0,
    upper:    /[A-Z]/.test(formData.password),
    lower:    /[a-z]/.test(formData.password),
    number:   /\d/.test(formData.password),
    special:  /[^A-Za-z0-9]/.test(formData.password),
  }), [formData.password]);

  const passwordValid = Object.values(passwordChecks).every(Boolean);

  // ── Field validators ────────────────────────────────────────────────────────
  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value) return t('fieldRequired');
        if (value.length < 3) return t('usernameTooShort');
        if (value.length > 50) return t('usernameTooLong');
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return t('usernameInvalidChars');
        return '';
      case 'email':
        if (!value) return t('fieldRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('emailInvalid');
        return '';
      case 'phone':
        if (!value) return t('fieldRequired');
        if (!/^\d+$/.test(value)) return t('phoneDigitsOnly');
        if (!value.startsWith('5')) return t('phoneStartsWith5');
        if (value.length !== 9) return t('phoneTooShort');
        return '';
      case 'confirmPassword':
        if (!value) return t('fieldRequired');
        if (value !== formData.password) return t('passwordMismatch');
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitError(null);
    if (name === 'password') setPasswordTouched(true);
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    // Re-validate confirm password live when password changes
    if (name === 'password' && formData.confirmPassword) {
      const err = value !== formData.confirmPassword ? t('passwordMismatch') : '';
      setFieldErrors((prev) => ({ ...prev, confirmPassword: err }));
    }
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
    setLocalPhone(digits);
    setSubmitError(null);
    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: '' }));
  };

  const handleBlur = (name, value) => {
    const err = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {
      username: validateField('username', formData.username),
      email:    validateField('email', formData.email),
      phone:    validateField('phone', localPhone),
      password: passwordValid ? '' : t('passwordWeak'),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
    };
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    if (!termsAccepted) { setSubmitError(t('acceptTerms')); return; }

    const fullPhone = '+966' + localPhone;
    setLoading(true);
    try {
      const response = await startRegistrationOtp({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phoneNumber: fullPhone,
        role: role === 'buyer' ? 'BUYER' : 'SELLER',
      });
      setMaskedEmail(response?.data?.maskedEmail || (formData.email.charAt(0) + '***' + formData.email.substring(formData.email.indexOf('@'))));
      setOtpStep(true);
    } catch (err) {
      setSubmitError(mapRegisterError(err, t));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = async () => {
    setOtpStep(false);
    try {
      const user = await login(formData.username, formData.password);
      setPendingUser(user);
      if (user?.role === 'SELLER') { await handleSellerNoAuctionHouseNotice(); navigate('/seller-dashboard'); }
      else { navigate('/'); }
    } catch { navigate('/'); }
  };

  const handleOtpCancel = () => { setOtpStep(false); setPendingUser(null); localStorage.removeItem('user'); };

  return (
    <>
      {otpStep && <OtpModal maskedEmail={maskedEmail} identifier={formData.email} onVerified={handleOtpVerified} onCancel={handleOtpCancel} isAr={isAr} />}
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} dir={isAr ? 'rtl' : 'ltr'}>
        {submitError && (
          <div className="flex items-start gap-2 rounded-lg border border-[#E05252] bg-red-50 px-4 py-3 text-sm font-semibold text-[#E05252]">
            <X className="mt-0.5 h-4 w-4 shrink-0" />
            {submitError}
          </div>
        )}

        {/* Username */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="reg-username" className="text-start text-[#1A2E2C]">{t('username')}</Label>
          <Input
            id="reg-username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            onBlur={(e) => handleBlur('username', e.target.value)}
            placeholder={t('namePlaceholder')}
            className={`h-11 rounded-lg border-[#C5E0DC] bg-white text-start text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30 ${fieldErrors.username ? 'border-[#E05252] focus-visible:border-[#E05252]' : ''}`}
          />
          <FieldError message={fieldErrors.username} />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="reg-email" className="text-start text-[#1A2E2C]">{t('email')}</Label>
          <Input
            id="reg-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={(e) => handleBlur('email', e.target.value)}
            placeholder={t('emailPlaceholder')}
            dir="ltr"
            className={`h-11 rounded-lg border-[#C5E0DC] bg-white text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30 ${fieldErrors.email ? 'border-[#E05252] focus-visible:border-[#E05252]' : ''}`}
          />
          <FieldError message={fieldErrors.email} />
        </div>

        {/* Phone with +966 prefix */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="reg-phone" className="text-start text-[#1A2E2C]">
            {t('phoneNumber')} <span className="text-[#E05252]">*</span>
          </Label>
          <div className="flex" dir="ltr">
            <div className={`flex items-center rounded-s-lg border border-e-0 border-[#C5E0DC] bg-[#F4FAFA] px-3 text-sm font-semibold text-[#1A2E2C] select-none ${fieldErrors.phone ? 'border-[#E05252]' : ''}`}>
              +966
            </div>
            <Input
              id="reg-phone"
              value={localPhone}
              onChange={handlePhoneChange}
              onBlur={() => handleBlur('phone', localPhone)}
              placeholder="5XXXXXXXX"
              inputMode="numeric"
              dir="ltr"
              maxLength={9}
              className={`h-11 rounded-s-none rounded-e-lg border-[#C5E0DC] bg-white text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30 ${fieldErrors.phone ? 'border-[#E05252] focus-visible:border-[#E05252]' : ''}`}
            />
          </div>
          <FieldError message={fieldErrors.phone} />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="reg-password" className="text-start text-[#1A2E2C]">{t('password')}</Label>
          <div className="relative">
            <Input
              id="reg-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              dir={isAr ? 'rtl' : 'ltr'}
              className={`h-11 rounded-lg border-[#C5E0DC] bg-white pe-11 text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30 ${fieldErrors.password ? 'border-[#E05252] focus-visible:border-[#E05252]' : ''}`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6B9E99] hover:text-[#1A2E2C]">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Live password strength checklist */}
          {passwordTouched && formData.password && (
            <div dir={isAr ? 'rtl' : 'ltr'} className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg border border-[#E4EFED] bg-[#F8FCFB] px-3 py-2.5">
              <CheckItem met={passwordChecks.length}  label={t('pwdMinLength')} />
              <CheckItem met={passwordChecks.maxLen}  label={t('pwdMaxLength')} />
              <CheckItem met={passwordChecks.upper}   label={t('pwdUppercase')} />
              <CheckItem met={passwordChecks.lower}   label={t('pwdLowercase')} />
              <CheckItem met={passwordChecks.number}  label={t('pwdNumber')} />
              <CheckItem met={passwordChecks.special} label={t('pwdSpecial')} />
            </div>
          )}
          <FieldError message={fieldErrors.password} />
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="reg-confirm" className="text-start text-[#1A2E2C]">{t('confirmPassword')}</Label>
          <div className="relative">
            <Input
              id="reg-confirm"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
              placeholder="••••••••"
              dir={isAr ? 'rtl' : 'ltr'}
              className={`h-11 rounded-lg border-[#C5E0DC] bg-white pe-11 text-[#1A2E2C] placeholder:text-[#6B9E99] focus-visible:border-[#2A9D8F] focus-visible:ring-[#2A9D8F]/30 ${fieldErrors.confirmPassword ? 'border-[#E05252] focus-visible:border-[#E05252]' : ''}`}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6B9E99] hover:text-[#1A2E2C]">
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <FieldError message={fieldErrors.confirmPassword} />
        </div>

        {/* Role Selector */}
        <div className="flex flex-col gap-3">
          <Label className="text-start text-[#1A2E2C]">{t('accountType')}</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'buyer', Icon: User },
              { key: 'seller', Icon: Store },
            ].map(({ key, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setRole(key)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  role === key
                    ? 'border-[#2A9D8F] bg-[#EAF7F5] text-[#2A9D8F] shadow-sm'
                    : 'border-[#C5E0DC] bg-white text-[#6B9E99] hover:border-[#3DBFB0] hover:bg-[#F4FAFA]'
                }`}
              >
                <Icon className={`h-8 w-8 ${role === key ? 'text-[#2A9D8F]' : 'text-[#6B9E99]'}`} />
                <span className="font-semibold">{t(key)}</span>
                <span className="text-xs opacity-70">{t(`${key}Desc`)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={setTermsAccepted}
            className="mt-0.5 border-[#C5E0DC] data-[state=checked]:border-[#2A9D8F] data-[state=checked]:bg-[#2A9D8F]"
          />
          <Label htmlFor="terms" className="cursor-pointer text-sm font-normal leading-relaxed text-[#6B9E99] text-start">
            {t('agreeTo')}{' '}
            <a href="/policies" className="text-[#2A9D8F] underline underline-offset-4 hover:text-[#3DBFB0]">{t('termsAndConditions')}</a>{' '}
            {t('and')}{' '}
            <a href="/policies" className="text-[#2A9D8F] underline underline-offset-4 hover:text-[#3DBFB0]">{t('privacyPolicy')}</a>
          </Label>
        </div>

        <Button
          type="submit"
          disabled={!termsAccepted || loading}
          className="mt-2 h-12 rounded-lg bg-[#2A9D8F] text-lg font-semibold text-white shadow-md hover:bg-[#1A7A6E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '...' : t('createAccount')}
        </Button>
      </form>
    </>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function AuthPage() {
  const { t, i18n } = useTranslation('auth');
  const { t: tCommon } = useTranslation('common');
  const isAr = i18n.language === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  return (
    <div className="flex min-h-screen">
      <LanguageSwitcher />

      <div className="relative hidden w-1/2 overflow-hidden bg-[#1A7A6E] lg:flex lg:flex-col lg:items-center lg:justify-center">
        <GeometricPattern />
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-4">
              <span className="text-6xl font-bold tracking-tight pb-1">{tCommon('brandName')}</span>
              <TrendingUp strokeWidth={3} className="h-14 w-14" />
            </div>
            <p className="text-2xl font-medium opacity-90 mt-2">{tCommon('brandSubtitle')}</p>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">{t('welcomeTitle')}</p>
          </div>
          <p className="mt-6 max-w-md text-lg leading-relaxed opacity-90">{t('welcomeSubtitle')}</p>
        </div>
        <div className="absolute -bottom-32 -start-32 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -top-20 -end-20 h-40 w-40 rounded-full bg-white/5" />
      </div>

      <div className="relative flex w-full flex-col items-center justify-center bg-[#F4FAFA] px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="absolute top-4 start-8 hidden lg:flex items-center gap-2">
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
            <TabsList className="mt-4 mb-8 grid h-12 w-full grid-cols-2 rounded-xl border border-[#C5E0DC] bg-white p-1">
              <TabsTrigger value="login"
                className="rounded-lg text-base font-semibold text-[#6B9E99] data-[state=active]:bg-[#2A9D8F] data-[state=active]:text-white data-[state=active]:shadow-sm">
                {t('login')}
              </TabsTrigger>
              <TabsTrigger value="register"
                className="rounded-lg text-base font-semibold text-[#6B9E99] data-[state=active]:bg-[#2A9D8F] data-[state=active]:text-white data-[state=active]:shadow-sm">
                {t('register')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <div className="mb-6 text-start" dir={dir}>
                <h2 className="text-2xl font-bold text-[#1A2E2C]">{t('welcomeBack')}</h2>
                <p className="mt-1 text-[#6B9E99]">{t('loginToContinue')}</p>
              </div>
              <LoginForm />
            </TabsContent>

            <TabsContent value="register" className="mt-0">
              <div className="mb-6 text-start" dir={dir}>
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
