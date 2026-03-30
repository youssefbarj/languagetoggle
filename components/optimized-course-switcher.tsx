"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Globe } from "lucide-react"

export function OptimizedCourseSwitcher() {
  const [language, setLanguage] = useState<"en" | "fr">("en")
  const [isLoading, setIsLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const preloadedRefs = useRef<Record<string, HTMLIFrameElement | null>>({})
  const swapTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const courseUrls = {
    en: "https://coassemble.com/learn/YP477O",
    fr: "https://coassemble.com/learn/I1S3EA"
  }

  // Create invisible iframes for preloading
  const preloadCourse = useCallback((lang: "en" | "fr") => {
    if (preloadedRefs.current[lang]) return

    const iframe = document.createElement('iframe')
    iframe.src = courseUrls[lang]
    iframe.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    `
    document.body.appendChild(iframe)
    preloadedRefs.current[lang] = iframe
  }, [courseUrls])

  // Preload other language after initial load
  useEffect(() => {
    const timeout = setTimeout(() => {
      const otherLanguage = language === "en" ? "fr" : "en"
      preloadCourse(otherLanguage)
    }, 3000)
    return () => clearTimeout(timeout)
  }, [language, preloadCourse])

  // Fast language switching using preloaded iframe swap
  const handleLanguageChange = useCallback((newLanguage: "en" | "fr") => {
    if (newLanguage === language) return

    setIsLoading(true)
    setIsDropdownOpen(false)

    // Try to use preloaded iframe for instant switch
    const preloadedIframe = preloadedRefs.current[newLanguage]
    const currentIframe = iframeRef.current

    if (preloadedIframe && currentIframe) {
      // Swap iframes instantly
      preloadedIframe.style.cssText = `
        position: relative;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 1;
        pointer-events: auto;
        border: none;
      `

      currentIframe.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
      `

      // Swap refs
      preloadedRefs.current[newLanguage] = currentIframe
      preloadedRefs.current[language === "en" ? "fr" : "en"] = preloadedIframe
      iframeRef.current = preloadedIframe

      setIsLoading(false)

      // Preload the old language for future use
      setTimeout(() => preloadCourse(language), 1000)
    } else {
      // Fallback to regular src change
      setLanguage(newLanguage)
      setTimeout(() => preloadCourse(newLanguage === "en" ? "fr" : "en"), 1000)
    }
  }, [language, preloadCourse])

  const handleMouseLeave = useCallback(() => {
    const timeout = setTimeout(() => setIsDropdownOpen(false), 200)
    setCloseTimeout(timeout)
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (closeTimeout) clearTimeout(closeTimeout)
    setIsDropdownOpen(true)
  }, [closeTimeout])

  return (
    <div className="relative w-full h-full bg-background">
      {/* Minimal loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-4 z-40 flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
          <div className="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full"></div>
          <span className="text-xs text-muted-foreground font-medium">Loading...</span>
        </div>
      )}

      {/* Main iframe */}
      <iframe
        ref={iframeRef}
        src={courseUrls[language]}
        className="w-full h-full border-0"
        title={`Course - ${language === "en" ? "English" : "Français"}`}
        allowFullScreen
        onLoad={() => setIsLoading(false)}
      />

      {/* Language switcher */}
      <div
        className="fixed top-6 right-6 z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200 hover:scale-105">
          <Globe size={24} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 rounded-lg shadow-xl bg-card/95 backdrop-blur-sm border border-border overflow-hidden min-w-[140px] animate-in fade-in slide-in-from-top-1 duration-150">
            <button
              onClick={() => handleLanguageChange("en")}
              className={`flex items-center gap-2 w-full text-left px-4 py-3 text-sm transition-colors ${
                language === "en"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted/80 text-foreground"
              }`}
            >
              <span className="text-base">🇺🇸</span>
              <span className="font-medium">English</span>
              {language === "en" && <span className="ml-auto text-xs">✓</span>}
            </button>
            <button
              onClick={() => handleLanguageChange("fr")}
              className={`flex items-center gap-2 w-full text-left px-4 py-3 text-sm transition-colors ${
                language === "fr"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted/80 text-foreground"
              }`}
            >
              <span className="text-base">🇫🇷</span>
              <span className="font-medium">Français</span>
              {language === "fr" && <span className="ml-auto text-xs">✓</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}