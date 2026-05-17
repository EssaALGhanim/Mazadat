import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Toaster } from 'sonner'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import SellerDashboard from './pages/SellerDashboard'
import SellerTeamPage from './pages/SellerTeamPage'
import AuctionHouseSettingsPage from './pages/AuctionHouseSettingsPage'
import EditProfilePage from './pages/EditProfilePage'
import PoliciesPage from './pages/PoliciesPage'
import AuctionDetailPage from './pages/AuctionDetailPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import { WatchlistProvider } from './contexts/WatchlistContext'
import { useTheme } from './contexts/ThemeContext'

function getDefaultRoute(currentUser) {
  if (currentUser?.role === 'SELLER') return '/seller-dashboard'
  if (currentUser?.role === 'ADMIN') return '/admin'
  return '/'
}

function App() {
  const { i18n } = useTranslation()
  const { theme } = useTheme()

  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return (
      <BrowserRouter>
        <WatchlistProvider>
          <Toaster position="top-center" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} theme={theme} />
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                {(currentUser) => {
                  if (currentUser?.role === 'SELLER') {
                    return <Navigate to="/seller-dashboard" replace />
                  }
                  if (currentUser?.role === 'ADMIN') {
                    return <Navigate to="/admin" replace />
                  }
                  return <HomePage />
                }}
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="ADMIN" redirectTo="/">
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/seller" element={
              <ProtectedRoute requiredRole="SELLER" redirectTo="/">
                <SellerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/seller-dashboard" element={
              <ProtectedRoute requiredRole="SELLER" redirectTo="/">
                <SellerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/seller/team" element={
              <ProtectedRoute requiredRole="SELLER" redirectTo="/">
                <SellerTeamPage />
              </ProtectedRoute>
            } />
            <Route path="/seller/settings" element={
              <ProtectedRoute requiredRole="SELLER" redirectTo="/">
                <AuctionHouseSettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/auction/:auctionId" element={
              <ProtectedRoute>
                {(currentUser) => <AuctionDetailPage currentUser={currentUser} />}
              </ProtectedRoute>
            } />
            <Route path="/auction" element={
              <ProtectedRoute>
                {(currentUser) => <Navigate to={getDefaultRoute(currentUser)} replace />}
              </ProtectedRoute>
            } />
            <Route path="/auction/*" element={
              <ProtectedRoute>
                {(currentUser) => <Navigate to={getDefaultRoute(currentUser)} replace />}
              </ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="*" element={
              <ProtectedRoute>
                {(currentUser) => <Navigate to={getDefaultRoute(currentUser)} replace />}
              </ProtectedRoute>
            } />
          </Routes>
        </WatchlistProvider>
      </BrowserRouter>
  )
}

export default App
