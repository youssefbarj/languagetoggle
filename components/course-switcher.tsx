"use client"

import { useState, useEffect, useRef } from "react"
import { Globe, X } from "lucide-react"

export function CourseSwitcher() {
  const [language, setLanguage] = useState<"en" | "fr">("fr")
  const [isLoading, setIsLoading] = useState<{ en: boolean; fr: boolean }>({ en: false, fr: true })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showResumePrompt, setShowResumePrompt] = useState(false)
  const [pendingLanguage, setPendingLanguage] = useState<"en" | "fr" | null>(null)
  const [iframesLoaded, setIframesLoaded] = useState<{ en: boolean; fr: boolean }>({ en: false, fr: false })

  const englishIframeRef = useRef<HTMLIFrameElement>(null)
  const frenchIframeRef = useRef<HTMLIFrameElement>(null)

  const courseUrls = {
    en: "https://coassemble.com/learn/I1S3EA",
    fr: "https://coassemble.com/learn/YP477O"
  }

  // Auto-detect system language on mount
  useEffect(() => {
    const systemLanguage = navigator.language || (navigator as any).userLanguage

    // Detect if system prefers French
    if (systemLanguage.toLowerCase().includes('fr')) {
      setLanguage("fr")
    } else {
      setLanguage("en") // Default to English for all other languages
    }
  }, [])

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsDropdownOpen(false)
    }, 200)
    setCloseTimeout(timeout)
  }

  const handleMouseEnter = () => {
    if (closeTimeout) clearTimeout(closeTimeout)
    setIsDropdownOpen(true)
  }

  const handleLanguageChange = (newLanguage: "en" | "fr") => {
    if (newLanguage === language) return

    // Show resume prompt before changing language
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

  const handleIframeLoad = (lang: "en" | "fr") => {
    setIsLoading(prev => ({ ...prev, [lang]: false }))
    setIframesLoaded(prev => ({ ...prev, [lang]: true }))
  }

  const handleIframeLoadStart = (lang: "en" | "fr") => {
    setIsLoading(prev => ({ ...prev, [lang]: true }))
  }

  // Preload the other language iframe after the current one loads
  useEffect(() => {
    if (iframesLoaded[language] && !iframesLoaded[language === "en" ? "fr" : "en"]) {
      const timer = setTimeout(() => {
        // Trigger loading of the other iframe
        setIsLoading(prev => ({ ...prev, [language === "en" ? "fr" : "en"]: true }))
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [iframesLoaded, language])

  const currentLoading = isLoading[language] && !iframesLoaded[language]

  return (
    <div className="relative w-full h-full bg-background">
      {/* Loading Screen */}
      {currentLoading && (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center">
          <img
            src="/loading-circle.png"
            alt="Loading..."
            className="w-24 h-24 animate-spin"
            style={{ animationDuration: '1s' }}
          />
          <span className="mt-6 text-xl font-medium text-foreground">Loading...</span>
        </div>
      )}

      {/* Resume Progress Prompt */}
      {showResumePrompt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe size={24} className="text-primary" />
                <h3 className="text-lg font-semibold">
                  {language === "fr" ? "Changer de langue" : "Change Language"}
                </h3>
              </div>
              <button
                onClick={cancelLanguageChange}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-muted-foreground mb-6">
              {language === "fr"
                ? `Voulez-vous passer au cours ${pendingLanguage === "en" ? "anglais" : "français"}?
                 Votre progression dans la langue actuelle sera enregistrée et vous pourrez la reprendre plus tard.`
                : `Switch to ${pendingLanguage === "en" ? "English" : "French"} course?
                 Your progress in the current language will be saved and you can resume it later.`
              }
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelLanguageChange}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
              >
                {language === "fr" ? "Annuler" : "Cancel"}
              </button>
              <button
                onClick={confirmLanguageChange}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                {language === "fr" ? "Continuer" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* English Course Iframe */}
      <iframe
        ref={englishIframeRef}
        src={courseUrls.en}
        className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300 ${
          language === "en" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
        }`}
        title="Course - English"
        allowFullScreen
        onLoad={() => handleIframeLoad("en")}
        onLoadStart={() => handleIframeLoadStart("en")}
      />

      {/* French Course Iframe */}
      <iframe
        ref={frenchIframeRef}
        src={courseUrls.fr}
        className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300 ${
          language === "fr" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
        }`}
        title="Course - Français"
        allowFullScreen
        onLoad={() => handleIframeLoad("fr")}
        onLoadStart={() => handleIframeLoadStart("fr")}
      />

      {/* Language Switcher */}
      <div className="fixed top-6 right-6 z-50" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <button className="p-2 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Globe size={28} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-0 rounded-lg shadow-lg bg-card border border-border overflow-hidden">
            <button
              onClick={() => handleLanguageChange("en")}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                language === "en" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange("fr")}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                language === "fr" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
            >
              Français
            </button>
          </div>
        )}
      </div>
    </div>
  )
}