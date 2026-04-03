import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Toaster } from 'sonner'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'

function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return (
    <BrowserRouter>
      <Toaster position="top-center" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
