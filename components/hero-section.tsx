"use client"

import { useTranslation } from "react-i18next"

export function HeroSection() {
  const { t } = useTranslation()
  
  return (
    <section className="relative bg-gradient-to-br from-primary via-secondary to-accent py-20 px-4 text-white overflow-hidden">
      {/* Background accent elements */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-6xl mx-auto flex flex-col items-center text-center gap-8">
        {/* Logo/Brand */}
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
          <span className="text-sm font-semibold">CleanGo</span>
        </div>

        {/* Main heading */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-balance">{t("hero.title")}</h1>
          <p className="text-lg md:text-xl text-white/90 text-pretty">
            {t("hero.description")}
          </p>
        </div>

        {/* Benefits for business owners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 w-full">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-left">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-semibold text-lg mb-2">{t("hero.benefits.management.title")}</h3>
            <p className="text-sm text-white/80">{t("hero.benefits.management.description")}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-left">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-semibold text-lg mb-2">{t("hero.benefits.customers.title")}</h3>
            <p className="text-sm text-white/80">{t("hero.benefits.customers.description")}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-left">
            <div className="text-3xl mb-3">💹</div>
            <h3 className="font-semibold text-lg mb-2">{t("hero.benefits.revenue.title")}</h3>
            <p className="text-sm text-white/80">{t("hero.benefits.revenue.description")}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
