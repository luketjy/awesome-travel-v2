'use client'

import { useEffect, useState } from 'react'

export default function TranslateToggle() {
  const [lang, setLang] = useState<'en' | 'zh'>('en')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Poll until the Google Translate widget select is available
    const id = setInterval(() => {
      if (document.querySelector('.goog-te-combo')) {
        setReady(true)
        clearInterval(id)
      }
    }, 300)
    return () => clearInterval(id)
  }, [])

  function toggle() {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null
    if (!select) return
    const next = lang === 'en' ? 'zh-CN' : 'en'
    select.value = next
    select.dispatchEvent(new Event('change'))
    setLang(lang === 'en' ? 'zh' : 'en')
  }

  return (
    <>
      {/* Hidden Google Translate mount point */}
      <div id="google_translate_element" className="hidden" aria-hidden="true" />

      <button
        onClick={toggle}
        disabled={!ready}
        title={lang === 'en' ? 'Switch to Chinese' : 'Switch to English'}
        className={`text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
          ready
            ? 'border-ocean-300 text-ocean-600 hover:bg-ocean-50'
            : 'border-gray-200 text-gray-300 cursor-not-allowed'
        }`}
      >
        {lang === 'en' ? '中文' : 'EN'}
      </button>
    </>
  )
}
