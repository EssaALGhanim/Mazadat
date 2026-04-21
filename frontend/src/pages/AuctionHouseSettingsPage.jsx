import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import TopNavigationBar from '../components/TopNavigationBar';
import { getSellerAuctionHouse, updateAuctionHouse } from '@/services/auctionHouseService';
import { getCurrentSellerProfile } from '@/services/userService';

export default function AuctionHouseSettingsPage() {
  const { i18n } = useTranslation('common');
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
    iban: '',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      setCurrentUser(stored ? JSON.parse(stored) : null);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const sellerProfile = await getCurrentSellerProfile();
        const sellerIsAdmin = Boolean(sellerProfile?.isAdmin);
        if (!sellerIsAdmin) {
          setError(isAr ? 'فقط مسؤولو صالة المزاد يمكنهم تعديل الإعدادات' : 'Only auction house admins can change settings');
          return;
        }

        const ah = await getSellerAuctionHouse();
        if (!ah) {
          setError(isAr ? 'لا توجد صالة مزاد مرتبطة بحسابك' : 'No Auction House is linked to your account');
          return;
        }
        setForm({
          name: ah.name || '',
          location: ah.location || '',
          description: ah.description || '',
          iban: ah.iban || '',
        });
      } catch (err) {
        setError(err.message || (isAr ? 'فشل تحميل الإعدادات' : 'Failed to load settings'));
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.role === 'SELLER') {
      load();
    }
  }, [currentUser, isAr]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateAuctionHouse(form);
      toast.success(isAr ? 'تم تحديث إعدادات صالة المزاد' : 'Auction House settings updated');
    } catch (err) {
      setError(err.message || (isAr ? 'فشل التحديث' : 'Update failed'));
    } finally {
      setSaving(false);
    }
  };

  if (currentUser?.role !== 'SELLER') return null;

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      <TopNavigationBar
        currentUser={currentUser}
        isSeller={true}
        isBuyer={false}
        onCreateAuction={() => navigate('/seller-dashboard')}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <button
            onClick={() => navigate('/seller-dashboard')}
            className="flex items-center gap-2 text-[#2A9D8F] hover:text-[#1A7A6E] font-semibold mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {isAr ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
          </button>

          <div className="bg-white border border-[#C5E0DC] rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-[#1A2E2C] mb-1">{isAr ? 'إعدادات صالة المزاد' : 'Auction House Settings'}</h1>
            <p className="text-sm text-[#6B9E99] mb-6">{isAr ? 'إدارة بيانات الصالة والحساب البنكي وملاحظات التشغيل' : 'Manage profile, payout IBAN, and operational notes'}</p>

            {loading ? (
              <p className="text-sm text-[#6B9E99]">{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder={isAr ? 'اسم الصالة' : 'Auction House Name'} className="w-full px-4 py-2 rounded-lg border border-[#C5E0DC]" />
                <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder={isAr ? 'الموقع' : 'Location'} className="w-full px-4 py-2 rounded-lg border border-[#C5E0DC]" />
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder={isAr ? 'الوصف' : 'Description'} rows={4} className="w-full px-4 py-2 rounded-lg border border-[#C5E0DC]" />
                <input value={form.iban} onChange={(e) => setForm((p) => ({ ...p, iban: e.target.value.toUpperCase() }))} placeholder="SAxxxxxxxxxxxxxxxxxxxxxx" className="w-full px-4 py-2 rounded-lg border border-[#C5E0DC]" />

                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2A9D8F] hover:bg-[#1A7A6E] text-white font-semibold disabled:opacity-60">
                  <Save className="w-4 h-4" />
                  {saving ? '...' : (isAr ? 'حفظ الإعدادات' : 'Save Settings')}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

