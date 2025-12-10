"use client"

import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en"
    i18n.changeLanguage(newLang)
    // Update document direction for RTL/LTR
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr"
  }

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="sm"
      className="gap-2 flex items-center"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <span>{i18n.language === "en" ? "AR" : "EN"}</span>
    </Button>
  )
}
