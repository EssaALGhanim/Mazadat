import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, Pencil, Save, ShieldCheck, X, XCircle } from 'lucide-react';
import {
    confirmPhoneOtp,
    getCurrentUserProfile,
    sendPhoneVerifyOtp,
    updateBuyerProfile,
    updateSellerProfile,
} from '@/services/userService';
import TopNavigationBar from '../components/TopNavigationBar';

// ─── Phone OTP Modal ──────────────────────────────────────────────────────────

function PhoneOtpModal({ isAr, onVerified, onCancel }) {
    const { t } = useTranslation('common');
    const [digits, setDigits] = useState(['', '', '', '']);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const inputs = useRef([]);

    const code = digits.join('');

    const handleChange = (val, idx) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...digits];
        next[idx] = val.slice(-1);
        setDigits(next);
        setError(null);
        if (val && idx < 3) inputs.current[idx + 1]?.focus();
    };

    const handleKeyDown = (e, idx) => {
        if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
            inputs.current[idx - 1]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (code.length < 4) return;
        setLoading(true);
        try {
            await confirmPhoneOtp(code);
            onVerified();
        } catch {
            setError(t('phoneOtpFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError(null);
        try {
            await sendPhoneVerifyOtp();
        } catch {
            setError(t('phoneOtpSendFailed'));
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5"
                dir={isAr ? 'rtl' : 'ltr'}
            >
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#EAF7F5]">
                    <ShieldCheck className="w-7 h-7 text-[#2A9D8F]" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-[#1A2E2C]">{t('verifyPhone')}</h3>
                    <p className="mt-1 text-sm text-[#6B9E99]">{t('enterPhoneOtp')}</p>
                </div>

                {error && (
                    <div className="w-full rounded-lg border border-[#E05252] bg-red-50 px-3 py-2 text-center text-sm font-semibold text-[#E05252]">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5 w-full">
                    <div className="flex gap-2 justify-center" dir="ltr">
                        {digits.map((d, idx) => (
                            <input
                                key={idx}
                                ref={(el) => { inputs.current[idx] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={d}
                                onChange={(e) => handleChange(e.target.value, idx)}
                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                className="w-11 text-center text-xl font-bold border-2 rounded-lg outline-none transition-all text-[#1A2E2C] border-[#C5E0DC] focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/30 bg-white"
                                style={{ height: '52px' }}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.length < 4}
                        className="w-full h-11 rounded-lg bg-[#2A9D8F] text-base font-semibold text-white hover:bg-[#1A7A6E] disabled:opacity-50 transition-colors"
                    >
                        {loading ? '...' : t('confirmVerify')}
                    </button>
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

                <button
                    onClick={onCancel}
                    className="text-xs text-[#6B9E99] hover:text-[#1A2E2C] transition-colors"
                >
                    {t('cancel')}
                </button>
            </div>
        </div>
    );
}

// ─── Edit Profile Page ────────────────────────────────────────────────────────

export default function EditProfilePage() {
    const { t, i18n } = useTranslation('common');
    const navigate = useNavigate();
    const isAr = i18n.language === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';

    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
    const [originalFormData, setOriginalFormData] = useState({ username: '', email: '', phoneNumber: '' });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    // Phone verification state
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otpSending, setOtpSending] = useState(false);
    const [phoneMsg, setPhoneMsg] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            setPageLoading(true);
            try {
                const profile = await getCurrentUserProfile();
                setUser(profile);
                setPhoneVerified(!!profile?.phoneVerified);
                const base = {
                    username: profile?.username || '',
                    email: profile?.email || '',
                    phoneNumber: profile?.phoneNumber || '',
                };
                setOriginalFormData(base);
                setFormData({ ...base, password: '', confirmPassword: '' });
            } catch {
                setErrors({ general: t('profileUpdateFailed') });
            } finally {
                setPageLoading(false);
            }
        };
        loadProfile();
    }, [t]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
        setSuccess(false);
        // If phone number changed, clear verified status indicator
        if (name === 'phoneNumber') setPhoneMsg(null);
    };

    const getChangedPayload = () => {
        const payload = {};
        if (formData.username.trim() !== originalFormData.username) payload.username = formData.username.trim();
        if (formData.email.trim() !== originalFormData.email) payload.email = formData.email.trim();
        if (formData.phoneNumber.trim() !== originalFormData.phoneNumber) payload.phoneNumber = formData.phoneNumber.trim();
        if (formData.password) payload.password = formData.password;
        return payload;
    };

    const validate = (payload) => {
        const newErrors = {};
        if (payload.username !== undefined && !payload.username) newErrors.username = t('requiredField');
        if (payload.email !== undefined && !payload.email) newErrors.email = t('requiredField');
        if (payload.phoneNumber !== undefined && !payload.phoneNumber) newErrors.phoneNumber = t('requiredField');

        if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))
            newErrors.email = t('profileInvalidEmail');

        if (payload.phoneNumber && !/^\+9665\d{8}$/.test(payload.phoneNumber))
            newErrors.phoneNumber = t('profileInvalidPhone');

        if (payload.password && !formData.confirmPassword) newErrors.confirmPassword = t('requiredField');
        if (payload.password && formData.confirmPassword && payload.password !== formData.confirmPassword)
            newErrors.confirmPassword = t('profilePasswordMismatch');

        if (payload.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,32}$/.test(payload.password))
            newErrors.password = t('profileWeakPassword');

        return newErrors;
    };

    const handleEdit = () => { setIsEditMode(true); setSuccess(false); setErrors({}); setFormData((p) => ({ ...p, password: '', confirmPassword: '' })); };
    const handleCancel = () => { setIsEditMode(false); setErrors({}); setFormData({ ...originalFormData, password: '', confirmPassword: '' }); };

    const handleSave = async () => {
        const payload = getChangedPayload();
        if (Object.keys(payload).length === 0) { setIsEditMode(false); return; }

        const newErrors = validate(payload);
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setLoading(true);
        try {
            if (user?.role === 'SELLER') await updateSellerProfile(payload);
            else await updateBuyerProfile(payload);

            const updatedBase = {
                username: payload.username ?? originalFormData.username,
                email: payload.email ?? originalFormData.email,
                phoneNumber: payload.phoneNumber ?? originalFormData.phoneNumber,
            };
            setOriginalFormData(updatedBase);
            setFormData({ ...updatedBase, password: '', confirmPassword: '' });
            setUser((prev) => ({ ...(prev || {}), ...updatedBase }));

            // If phone number changed, unverify locally until re-verified
            if (payload.phoneNumber) setPhoneVerified(false);

            try {
                const stored = localStorage.getItem('user');
                const parsed = stored ? JSON.parse(stored) : {};
                localStorage.setItem('user', JSON.stringify({ ...parsed, ...updatedBase }));
            } catch { /* non-blocking */ }

            setSuccess(true);
            setIsEditMode(false);
        } catch (err) {
            setErrors({ general: err?.message || t('profileUpdateFailed') });
        } finally {
            setLoading(false);
        }
    };

    // ── Phone verification ────────────────────────────────────────────────────

    const handleVerifyPhone = async () => {
        setPhoneMsg(null);
        setOtpSending(true);
        try {
            await sendPhoneVerifyOtp();
            setPhoneMsg({ type: 'info', text: t('phoneOtpSent') });
            setOtpModalOpen(true);
        } catch (err) {
            setPhoneMsg({ type: 'error', text: err?.message || t('phoneOtpSendFailed') });
        } finally {
            setOtpSending(false);
        }
    };

    const handleOtpVerified = () => {
        setOtpModalOpen(false);
        setPhoneVerified(true);
        setPhoneMsg({ type: 'success', text: t('phoneOtpVerified') });
    };

    // ─────────────────────────────────────────────────────────────────────────

    const inputClass = (fieldError) =>
        `w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none transition-shadow text-start ${isEditMode ? 'bg-white' : 'bg-gray-100 text-gray-600 cursor-not-allowed'} ${fieldError ? 'border-[#E05252]' : 'border-[#C5E0DC]'}`;

    if (pageLoading) {
        return (
            <div className="min-h-screen bg-[#F4FAFA] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#C5E0DC] border-t-[#2A9D8F] rounded-full animate-spin" />
            </div>
        );
    }

    const handleLogout = () => { localStorage.removeItem('user'); window.location.href = '/auth'; };

    const isSeller = user?.role === 'SELLER';
    const isBuyer = user?.role === 'BUYER';

    return (
        <div className="min-h-screen bg-[#F4FAFA] flex flex-col" dir={dir}>
            {otpModalOpen && (
                <PhoneOtpModal
                    isAr={isAr}
                    onVerified={handleOtpVerified}
                    onCancel={() => setOtpModalOpen(false)}
                />
            )}

            <TopNavigationBar
                currentUser={user}
                isSeller={isSeller}
                isBuyer={isBuyer}
                onShowMyBids={() => navigate('/')}
                onCreateAuction={() => navigate('/seller-dashboard')}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex items-center justify-center px-4 py-10">
                <div className="bg-white rounded-xl shadow-sm border border-[#C5E0DC] w-full max-w-lg p-8">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#EAF7F5] flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-[#2A9D8F]" />
                            </div>
                            <h1 className="text-2xl font-bold text-[#1A2E2C]">{t('editProfile')}</h1>
                        </div>
                        {!isEditMode ? (
                            <button onClick={handleEdit} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EAF7F5] text-[#2A9D8F] font-semibold hover:bg-[#DFF0ED] transition-colors">
                                <Pencil className="w-4 h-4" />
                                {t('edit')}
                            </button>
                        ) : (
                            <button onClick={handleCancel} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                                <X className="w-4 h-4" />
                                {t('cancel')}
                            </button>
                        )}
                    </div>

                    {/* Success / general error */}
                    {success && (
                        <div className="mb-6 bg-[#EAF7F5] border border-[#2A9D8F] text-[#2A9D8F] rounded-lg px-4 py-3 font-semibold text-sm text-start">
                            {t('profileUpdated')}
                        </div>
                    )}
                    {errors.general && (
                        <div className="mb-6 bg-red-50 border border-[#E05252] text-[#E05252] rounded-lg px-4 py-3 font-semibold text-sm text-start">
                            {errors.general}
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block mb-2 font-semibold text-[#1A2E2C] text-sm text-start">{t('username')} *</label>
                            <input name="username" value={formData.username} onChange={handleChange} readOnly={!isEditMode} className={inputClass(errors.username)} />
                            {errors.username && <p className="text-[#E05252] text-sm mt-1 text-start">{errors.username}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block mb-2 font-semibold text-[#1A2E2C] text-sm text-start">{t('email')} *</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} readOnly={!isEditMode} className={inputClass(errors.email)} dir="ltr" />
                            {errors.email && <p className="text-[#E05252] text-sm mt-1 text-start">{errors.email}</p>}
                        </div>

                        {/* Phone Number + verification */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="font-semibold text-[#1A2E2C] text-sm">{t('phoneNumber')} *</label>
                                {phoneVerified ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF7F5] px-2.5 py-0.5 text-xs font-semibold text-[#2A9D8F]">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        {t('phoneVerified')}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                                        <XCircle className="w-3.5 h-3.5" />
                                        {t('phoneNotVerified')}
                                    </span>
                                )}
                            </div>

                            <input
                                name="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                readOnly={!isEditMode}
                                className={inputClass(errors.phoneNumber)}
                                dir="ltr"
                                placeholder="+9665XXXXXXXX"
                            />
                            {errors.phoneNumber && <p className="text-[#E05252] text-sm mt-1 text-start">{errors.phoneNumber}</p>}

                            {/* Verify button — visible only to buyers who haven't verified yet */}
                            {isBuyer && !phoneVerified && !isEditMode && (
                                <div className="mt-2">
                                    <p className="text-xs text-[#6B9E99] mb-2 text-start">{t('phoneNotVerifiedDesc')}</p>
                                    <button
                                        onClick={handleVerifyPhone}
                                        disabled={otpSending}
                                        className="inline-flex items-center gap-2 rounded-lg bg-[#2A9D8F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A7A6E] disabled:opacity-50 transition-colors"
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        {otpSending ? '...' : t('verifyPhone')}
                                    </button>
                                </div>
                            )}

                            {isBuyer && phoneVerified && (
                                <p className="mt-1 text-xs text-[#2A9D8F] text-start">{t('phoneVerifiedDesc')}</p>
                            )}

                            {/* Inline feedback for OTP send */}
                            {phoneMsg && (
                                <p className={`mt-2 text-xs font-medium text-start ${phoneMsg.type === 'error' ? 'text-[#E05252]' : phoneMsg.type === 'success' ? 'text-[#2A9D8F]' : 'text-[#6B9E99]'}`}>
                                    {phoneMsg.text}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        {!isEditMode ? (
                            <div>
                                <label className="block mb-2 font-semibold text-[#1A2E2C] text-sm text-start">{t('password')}</label>
                                <input value="••••••••" readOnly className={inputClass(false)} dir="ltr" />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block mb-2 font-semibold text-[#1A2E2C] text-sm text-start">{t('newPassword')}</label>
                                    <input name="password" type="password" value={formData.password} onChange={handleChange} className={inputClass(errors.password)} dir={isAr ? 'rtl' : 'ltr'} />
                                    {errors.password && <p className="text-[#E05252] text-sm mt-1 text-start">{errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block mb-2 font-semibold text-[#1A2E2C] text-sm text-start">{t('confirmPassword')}</label>
                                    <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className={inputClass(errors.confirmPassword)} dir={isAr ? 'rtl' : 'ltr'} />
                                    {errors.confirmPassword && <p className="text-[#E05252] text-sm mt-1 text-start">{errors.confirmPassword}</p>}
                                </div>
                            </>
                        )}
                    </div>

                    {isEditMode && (
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="mt-8 w-full bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? '...' : t('saveChanges')}
                        </button>
                    )}

                    <button
                        onClick={() => navigate(user?.role === 'SELLER' ? '/seller-dashboard' : '/')}
                        className="mt-4 w-full bg-[#F4FAFA] hover:bg-[#E2F1EF] text-[#2A9D8F] px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        {isAr ? 'العودة للرئيسية' : 'Return to Homepage'}
                    </button>
                </div>
            </div>
        </div>
    );
}
