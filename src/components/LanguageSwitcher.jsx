import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common')

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(nextLang)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="absolute top-4 end-4 z-50 rounded-full border-[#2A9D8F] text-[#2A9D8F] bg-white hover:bg-[#2A9D8F] hover:text-white transition-all shadow-sm font-semibold rtl:font-sans ltr:font-sans px-4"
    >
      {t('switchLang')}
    </Button>
  )
}
