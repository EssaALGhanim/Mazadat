import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TopNavigationBar from '@/components/TopNavigationBar';
import SellerAnalyticsDashboard from '@/components/analytics/SellerAnalyticsDashboard';
import { getSellerAnalytics } from '@/services/sellerAnalyticsService';

export default function SellerAnalyticsPage() {
  const { i18n } = useTranslation('common');
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const parsed = stored ? JSON.parse(stored) : null;
      setCurrentUser(parsed);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSellerAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err?.message || (isAr ? 'فشل تحميل التحليلات' : 'Failed to load analytics'));
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role !== 'SELLER') return;

    fetchAnalytics();
    const interval = window.setInterval(fetchAnalytics, 30000);
    return () => window.clearInterval(interval);
  }, [currentUser?.role]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  if (currentUser?.role !== 'SELLER') {
    return (
      <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-slate-300 mb-4">{isAr ? 'هذه الصفحة خاصة بالبائعين فقط' : 'This page is for sellers only'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#2A9D8F] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1A7A6E] transition-colors"
          >
            {isAr ? 'العودة للرئيسية' : 'Go Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex flex-col">
      <TopNavigationBar
        currentUser={currentUser}
        isSeller={true}
        isBuyer={false}
        onCreateAuction={() => navigate('/seller-dashboard')}
        onLogout={handleLogout}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-[#1A2E2C] dark:text-slate-100">
                {isAr ? 'تحليلات المزادات' : 'Auction Analytics'}
              </h1>
              <p className="text-[#6B9E99] dark:text-slate-300 mt-1">
                {isAr ? 'تابع أداء مزاداتك والمشاهدات والتفاعل' : 'Track your auction performance, views, and engagement'}
              </p>
            </div>
            <button
              onClick={fetchAnalytics}
              className="bg-white dark:bg-slate-900 border border-[#C5E0DC] dark:border-slate-700 text-[#2A9D8F] px-4 py-2 rounded-lg font-semibold hover:bg-[#F4FAFA] dark:hover:bg-slate-800 transition-colors"
            >
              {isAr ? 'تحديث' : 'Refresh'}
            </button>
          </div>

          <SellerAnalyticsDashboard
            analytics={analytics}
            loading={loading}
            error={error}
            onRetry={fetchAnalytics}
            isAr={isAr}
          />
        </div>
      </div>
    </div>
  );
}
