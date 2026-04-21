import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { User, Save, Home, Pencil, X } from 'lucide-react';
import { getCurrentUserProfile, updateSellerProfile, updateBuyerProfile } from '@/services/userService';
import TopNavigationBar from '../components/TopNavigationBar';

export default function EditProfilePage() {
    const { t, i18n } = useTranslation('common');
    const navigate = useNavigate();
    const isAr = i18n.language === 'ar';

    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
    const [originalFormData, setOriginalFormData] = useState({ username: '', email: '', phoneNumber: '' });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            setPageLoading(true);
            try {
                const profile = await getCurrentUserProfile();
                setUser(profile);
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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (payload.email && !emailRegex.test(payload.email)) newErrors.email = t('profileInvalidEmail') || 'Invalid email format';

        const phoneRegex = /^\+9665\d{8}$/;
        if (payload.phoneNumber && !phoneRegex.test(payload.phoneNumber)) {
            newErrors.phoneNumber = t('profileInvalidPhone') || 'Phone number must be +9665XXXXXXXX';
        }

        if (payload.password && !formData.confirmPassword) newErrors.confirmPassword = t('requiredField');
        if (payload.password && formData.confirmPassword && payload.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('profilePasswordMismatch') || 'Passwords do not match';
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,32}$/;
        if (payload.password && !passwordRegex.test(payload.password)) {
            newErrors.password = t('profileWeakPassword') || 'Password must be 8-32 chars with uppercase, lowercase, number, and symbol';
        }

        return newErrors;
    };

    const handleEdit = () => {
        setIsEditMode(true);
        setSuccess(false);
        setErrors({});
        setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    };

    const handleCancel = () => {
        setIsEditMode(false);
        setErrors({});
        setFormData({ ...originalFormData, password: '', confirmPassword: '' });
    };

    const handleSave = async () => {
        const payload = getChangedPayload();
        if (Object.keys(payload).length === 0) {
            setIsEditMode(false);
            return;
        }

        const newErrors = validate(payload);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            if (user?.role === 'SELLER') {
                await updateSellerProfile(payload);
            } else {
                await updateBuyerProfile(payload);
            }

            const updatedBase = {
                username: payload.username ?? originalFormData.username,
                email: payload.email ?? originalFormData.email,
                phoneNumber: payload.phoneNumber ?? originalFormData.phoneNumber,
            };
            setOriginalFormData(updatedBase);
            setFormData({ ...updatedBase, password: '', confirmPassword: '' });
            setUser((prev) => ({ ...(prev || {}), ...updatedBase }));

            // Keep auth token and role; update visible identity fields for UI.
            try {
                const stored = localStorage.getItem('user');
                const parsed = stored ? JSON.parse(stored) : {};
                localStorage.setItem('user', JSON.stringify({
                    ...parsed,
                    username: updatedBase.username,
                    email: updatedBase.email,
                    phoneNumber: updatedBase.phoneNumber,
                }));
            } catch {
                // Non-blocking local cache update.
            }

            setSuccess(true);
            setIsEditMode(false);
        } catch (err) {
            setErrors({ general: err?.message || t('profileUpdateFailed') });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (fieldError) =>
        `w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none transition-shadow ${isEditMode ? 'bg-white' : 'bg-gray-100 text-gray-600 cursor-not-allowed'} ${fieldError ? 'border-[#E05252]' : 'border-[#C5E0DC]'}`;

    if (pageLoading) {
        return (
            <div className="min-h-screen bg-[#F4FAFA] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#C5E0DC] border-t-[#2A9D8F] rounded-full animate-spin" />
            </div>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/auth';
    };

    const isSeller = user?.role === 'SELLER';
    const isBuyer = user?.role === 'BUYER';

    return (
        <div className="min-h-screen bg-[#F4FAFA] flex flex-col">
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
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#EAF7F5] flex items-center justify-center">
                                <User className="w-6 h-6 text-[#2A9D8F]" />
                            </div>
                            <h1 className="text-2xl font-bold text-[#1A2E2C]">{t('editProfile')}</h1>
                        </div>

                        {!isEditMode ? (
                            <button onClick={handleEdit} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EAF7F5] text-[#2A9D8F] font-semibold hover:bg-[#DFF0ED]">
                                <Pencil className="w-4 h-4" />
                                {t('edit') || 'Edit'}
                            </button>
                        ) : (
                            <button onClick={handleCancel} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200">
                                <X className="w-4 h-4" />
                                {t('cancel') || 'Cancel'}
                            </button>
                        )}
                    </div>

                    {success && (
                        <div className="mb-6 bg-[#EAF7F5] border border-[#2A9D8F] text-[#2A9D8F] rounded-lg px-4 py-3 font-semibold text-sm">
                            {t('profileUpdated')}
                        </div>
                    )}

                    {errors.general && (
                        <div className="mb-6 bg-red-50 border border-[#E05252] text-[#E05252] rounded-lg px-4 py-3 font-semibold text-sm">
                            {errors.general}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block mb-2 font-semibold text-[#1A2E2C] text-sm rtl:text-right ltr:text-left">{t('username')} *</label>
                            <input name="username" value={formData.username} onChange={handleChange} readOnly={!isEditMode} className={inputClass(errors.username)} />
                            {errors.username && <p className="text-[#E05252] text-sm mt-1">{errors.username}</p>}
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-[#1A2E2C] text-sm rtl:text-right ltr:text-left">{t('email')} *</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} readOnly={!isEditMode} className={inputClass(errors.email)} dir="ltr" />
                            {errors.email && <p className="text-[#E05252] text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-[#1A2E2C] text-sm rtl:text-right ltr:text-left">{t('phoneNumber') || 'Phone Number'} *</label>
                            <input name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} readOnly={!isEditMode} className={inputClass(errors.phoneNumber)} dir="ltr" placeholder="+9665XXXXXXXX" />
                            {errors.phoneNumber && <p className="text-[#E05252] text-sm mt-1">{errors.phoneNumber}</p>}
                        </div>

                        {!isEditMode ? (
                            <div>
                                <label className="block mb-2 font-semibold text-[#1A2E2C] text-sm rtl:text-right ltr:text-left">{t('password')}</label>
                                <input value="********" readOnly className={inputClass(false)} />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block mb-2 font-semibold text-[#1A2E2C] text-sm rtl:text-right ltr:text-left">{t('newPassword')} *</label>
                                    <input name="password" type="password" value={formData.password} onChange={handleChange} className={inputClass(errors.password)} dir="ltr" />
                                    {errors.password && <p className="text-[#E05252] text-sm mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold text-[#1A2E2C] text-sm rtl:text-right ltr:text-left">{t('confirmPassword') || 'Confirm Password'} *</label>
                                    <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className={inputClass(errors.confirmPassword)} dir="ltr" />
                                    {errors.confirmPassword && <p className="text-[#E05252] text-sm mt-1">{errors.confirmPassword}</p>}
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