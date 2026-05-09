"use client"

import { useState, useEffect, useRef } from "react"
import { Globe, X } from "lucide-react"

type Language = "en" | "fr" | "ar"

interface LoadingState {
  en: boolean
  fr: boolean
  ar: boolean
}

interface LoadedState {
  en: boolean
  fr: boolean
  ar: boolean
}

export function CourseSwitcher() {
  const [language, setLanguage] = useState<Language>("fr")
  const [isLoading, setIsLoading] = useState<LoadingState>({ en: true, fr: true, ar: true })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showResumePrompt, setShowResumePrompt] = useState(false)
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null)
  const [iframesLoaded, setIframesLoaded] = useState<LoadedState>({ en: false, fr: false, ar: false })

  const englishIframeRef = useRef<HTMLIFrameElement>(null)
  const frenchIframeRef = useRef<HTMLIFrameElement>(null)
  const arabicIframeRef = useRef<HTMLIFrameElement>(null)

  const courseUrls: Record<Language, string> = {
    en: "https://coassemble.com/learn/U9DQN6",
    fr: "https://coassemble.com/learn/KB3D80",
    ar: "https://coassemble.com/learn/ARABIC_URL",
  }

  useEffect(() => {
    const systemLanguage = (navigator.language || (navigator as unknown as { userLanguage: string }).userLanguage).toLowerCase()
    if (systemLanguage.startsWith("fr")) {
      setLanguage("fr")
    } else if (systemLanguage.startsWith("ar")) {
      setLanguage("ar")
    } else {
      setLanguage("en")
    }
  }, [])

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
  }, [language])

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setIsDropdownOpen(false), 200)
    setCloseTimeout(timeout)
  }

  const handleMouseEnter = () => {
    if (closeTimeout) clearTimeout(closeTimeout)
    setIsDropdownOpen(true)
  }

  const handleLanguageChange = (newLanguage: Language) => {
    if (newLanguage === language) return
    setPendingLanguage(newLanguage)
    setShowResumePrompt(true)
    setIsDropdownOpen(false)
  }

  const confirmLanguageChange = () => {
    if (pendingLanguage) {
      setLanguage(pendingLanguage)
      setPendingLanguage(null)
      setShowResumePrompt(false)
    }
  }

  const cancelLanguageChange = () => {
    setPendingLanguage(null)
    setShowResumePrompt(false)
  }

  const handleIframeLoad = (lang: Language) => {
    setIsLoading(prev => ({ ...prev, [lang]: false }))
    setIframesLoaded(prev => ({ ...prev, [lang]: true }))
  }

  const currentLoading = isLoading[language] && !iframesLoaded[language]

  const t = {
    changeLanguage: { en: "Change Language", fr: "Changer de langue", ar: "تغيير اللغة" },
    switchPrompt: (pending: Language | null) => {
      const targets: Record<Language, Record<Language, string>> = {
        en: {
          en: "",
          fr: "Switch to French course? Your progress in the current language will be saved and you can resume it later.",
          ar: "Switch to Arabic course? Your progress in the current language will be saved and you can resume it later.",
        },
        fr: {
          en: "Passer au cours anglais ? Votre progression sera enregistrée et vous pourrez la reprendre plus tard.",
          fr: "",
          ar: "Passer au cours arabe ? Votre progression sera enregistrée et vous pourrez la reprendre plus tard.",
        },
        ar: {
          en: "التبديل إلى الدورة الإنجليزية؟ سيتم حفظ تقدمك ويمكنك مواصلته لاحقاً.",
          fr: "التبديل إلى الدورة الفرنسية؟ سيتم حفظ تقدمك ويمكنك مواصلته لاحقاً.",
          ar: "",
        },
      }
      return pending ? targets[language][pending] : ""
    },
    cancel: { en: "Cancel", fr: "Annuler", ar: "إلغاء" },
    continue: { en: "Continue", fr: "Continuer", ar: "متابعة" },
    loading: { en: "Loading...", fr: "Chargement...", ar: "...جاري التحميل" },
  }

  const langLabels: Record<Language, string> = {
    en: "English",
    fr: "Français",
    ar: "العربية",
  }

  return (
    <div className="relative w-full h-full bg-background">
      {currentLoading && (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center">
          <img src="/loading-circle.png" alt="Loading..." className="w-24 h-24 animate-spin" style={{ animationDuration: "1s" }} />
          <span className="mt-6 text-xl font-medium text-foreground">{t.loading[language]}</span>
        </div>
      )}

      {showResumePrompt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" dir={pendingLanguage === "ar" ? "rtl" : "ltr"}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe size={24} className="text-primary" />
                <h3 className="text-lg font-semibold">{t.changeLanguage[language]}</h3>
              </div>
              <button onClick={cancelLanguageChange} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-muted-foreground mb-6">{t.switchPrompt(pendingLanguage)}</p>
            <div className="flex gap-3">
              <button onClick={cancelLanguageChange} className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium">
                {t.cancel[language]}
              </button>
              <button onClick={confirmLanguageChange} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                {t.continue[language]}
              </button>
            </div>
          </div>
        </div>
      )}

      <iframe ref={englishIframeRef} src={courseUrls.en} className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300 ${language === "en" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`} title="Course - English" allowFullScreen onLoad={() => handleIframeLoad("en")} />
      <iframe ref={frenchIframeRef} src={courseUrls.fr} className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300 ${language === "fr" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`} title="Course - Français" allowFullScreen onLoad={() => handleIframeLoad("fr")} />
      <iframe ref={arabicIframeRef} src={courseUrls.ar} className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300 ${language === "ar" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`} title="Course - العربية" allowFullScreen onLoad={() => handleIframeLoad("ar")} />

      <div className="fixed top-6 right-6 z-50" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <button className="p-2 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Globe size={28} />
        </button>
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-0 rounded-lg shadow-lg bg-card border border-border overflow-hidden min-w-[130px]">
            {(["en", "fr", "ar"] as Language[]).map((lang) => (
              <button key={lang} onClick={() => handleLanguageChange(lang)} className={`block w-full px-4 py-2 text-sm transition-colors ${language === lang ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"} ${lang === "ar" ? "text-right" : "text-left"}`}>
                {langLabels[lang]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
