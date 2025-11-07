"use client"

import { useState } from "react"
import { LanguageSelector } from "./language-selector"

type Language = "en" | "fr" | "ar"

interface VideoConfig {
  url: string
  title: string
}

const videos: Record<Language, VideoConfig> = {
  en: {
    url: "https://player.vimeo.com/video/1120345666?badge=0&autopause=0&player_id=0&app_id=58479",
    title: "Makeup Fundamentals | Step-by-Step Day Look Tutorial",
  },
  fr: {
    url: "https://player.vimeo.com/video/1115956913?badge=0&autopause=0&player_id=0&app_id=58479",
    title: "Fondamentaux du Maquillage | Tutoriel Look de Jour Étape par Étape",
  },
  ar: {
    url: "https://player.vimeo.com/video/1120345666?badge=0&autopause=0&player_id=0&app_id=58479",
    title: "أساسيات المكياج | درس تطبيق مكياج النهار خطوة بخطوة",
  },
}

export function VideoPlayer() {
  const [language, setLanguage] = useState<Language>("en")
  const currentVideo = videos[language]

  return (
    <div className="w-full max-w-5xl">
      <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border">
        {/* Header with Language Selector */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-muted/30">
          <h1 className="text-lg md:text-xl font-semibold text-foreground text-balance">{currentVideo.title}</h1>
          <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
        </div>

        {/* Video Container */}
        <div className="relative bg-black" style={{ padding: "56.25% 0 0 0" }}>
          <iframe
            key={language}
            src={currentVideo.url}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            title={currentVideo.title}
            className="w-full h-full"
          />
        </div>

        {/* Footer Info */}
        <div className="p-4 md:p-6 bg-muted/20">
          <p className="text-sm text-muted-foreground">
            {language === "en" && "Learn professional makeup techniques with our step-by-step tutorial."}
            {language === "fr" &&
              "Apprenez les techniques de maquillage professionnel avec notre tutoriel étape par étape."}
            {language === "ar" && "تعلم تقنيات المكياج الاحترافية من خلال البرنامج التعليمي خطوة بخطوة."}
          </p>
        </div>
      </div>

      {/* Vimeo Player Script */}
      <script src="https://player.vimeo.com/api/player.js" async />
    </div>
  )
}
