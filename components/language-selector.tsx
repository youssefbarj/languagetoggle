"use client"

import { useState, useRef, useEffect } from "react"
import { Check, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"

type Language = "en" | "fr" | "ar"

interface LanguageOption {
  code: Language
  name: string
  flag: string
  nativeName: string
}

const languages: LanguageOption[] = [
  { code: "en", name: "English", flag: "🇺🇸", nativeName: "English" },
  { code: "fr", name: "French", flag: "🇫🇷", nativeName: "Français" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", nativeName: "العربية" },
]

interface LanguageSelectorProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = languages.find((lang) => lang.code === currentLanguage)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 bg-background hover:bg-accent"
      >
        <Languages className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLang?.flag}</span>
        <span className="hidden md:inline">{currentLang?.nativeName}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code)
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="flex-1 text-sm font-medium text-foreground">{lang.nativeName}</span>
              {currentLanguage === lang.code && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
