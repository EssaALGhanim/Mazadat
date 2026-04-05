import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Save } from 'lucide-react';
import { updateSellerProfile, updateBuyerProfile } from '@/services/userService';

export default function EditProfilePage() {
    const { t } = useTranslation('common');
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        bankAccount: '',
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('user');
            const parsed = stored ? JSON.parse(stored) : null;
            setUser(parsed);
            if (parsed) {
                setFormData({
                    username: parsed.username || '',
                    email: parsed.email || '',
                    password: '',
                    bankAccount: parsed.bankAccount || '',
                });
            }
        } catch {
            setUser(null);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
        setSuccess(false);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = t('requiredField');
        if (!formData.email.trim()) newErrors.email = t('requiredField');
        return newErrors;
    };

    const handleSubmit = async () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const isSeller = user?.role === 'SELLER';
            const payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password || user?.password,
                ...(isSeller && { bankAccount: formData.bankAccount }),
            };

            if (isSeller) {
                await updateSellerProfile(user.id, payload);
            } else {
                await updateBuyerProfile(user.id, payload);
            }

            const updated = { ...user, username: formData.username, email: formData.email };
            localStorage.setItem('user', JSON.stringify(updated));
            setSuccess(true);
        } catch {
            setErrors({ general: t('profileUpdateFailed') });
        } finally {
            setLoading(false);
        }
    };

    const isSeller = user?.role === 'SELLER';

    return (
        <div className="min-h-screen bg-[#F4FAFA] flex items-center justify-center px-4 py-10">
            <div className="bg-white rounded-xl shadow-sm border border-[#C5E0DC] w-full max-w-lg p-8">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-full bg-[#EAF7F5] flex items-center justify-center">
                        <User className="w-6 h-6 text-[#2A9D8F]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#1A2E2C]">{t('editProfile')}</h1>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 bg-[#EAF7F5] border border-[#2A9D8F] text-[#2A9D8F] rounded-lg px-4 py-3 font-semibold text-sm">
                        {t('profileUpdated')}
                    </div>
                )}

                {/* General Error */}
                {errors.general && (
                    <div className="mb-6 bg-red-50 border border-[#E05252] text-[#E05252] rounded-lg px-4 py-3 font-semibold text-sm">
                        {errors.general}
                    </div>
                )}

                <div className="space-y-5">
                    {/* Username */}
                    <div>
                        <label className="block mb-2 font-semibold text-[#1A2E2C] text-sm">
                            {t('username')} <span className="text-[#E05252]">*</span>
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`w-full rounded-lg border bg-white px-4 py-3 focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none transition-shadow text-right ${
                                errors.username ? 'border-[#E05252]' : 'border-[#C5E0DC]'
                            }`}
                        />
                        {errors.username && (
                            <p className="text-[#E05252] text-sm mt-1">{errors.username}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block mb-2 font-semibold text-[#1A2E2C] text-sm">
                            {t('email')} <span className="text-[#E05252]">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full rounded-lg border bg-white px-4 py-3 focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none transition-shadow text-right ${
                                errors.email ? 'border-[#E05252]' : 'border-[#C5E0DC]'
                            }`}
                        />
                        {errors.email && (
                            <p className="text-[#E05252] text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block mb-2 font-semibold text-[#1A2E2C] text-sm">
                            {t('newPassword')}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-[#C5E0DC] bg-white px-4 py-3 focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none transition-shadow text-right placeholder-[#6B9E99]"
                        />
                    </div>

                    {/* Bank Account — Sellers only */}
                    {isSeller && (
                        <div>
                            <label className="block mb-2 font-semibold text-[#1A2E2C] text-sm">
                                {t('bankAccount')}
                            </label>
                            <input
                                type="text"
                                name="bankAccount"
                                value={formData.bankAccount}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-[#C5E0DC] bg-white px-4 py-3 focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none transition-shadow text-right"
                            />
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="mt-8 w-full bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    <Save className="w-5 h-5" />
                    {loading ? '...' : t('saveChanges')}
                </button>
            </div>
        </div>
    );
}