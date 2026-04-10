'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useState } from 'react'

const WECHAT_ID = 'awesometravel'

export default function ContactPage() {
  const [copied, setCopied] = useState(false)

  function copyWechat() {
    navigator.clipboard.writeText(WECHAT_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-warm-50">
        {/* Hero banner */}
        <div className="bg-gradient-to-br from-ocean-800 via-ocean-700 to-teal-500 text-white py-16 sm:py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-sandy-300 blur-3xl" />
          </div>
          <div className="max-w-3xl mx-auto text-center relative">
            <p className="text-ocean-200 text-sm font-semibold uppercase tracking-widest mb-3">Get in Touch</p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">Contact Us</h1>
            <p className="text-ocean-100/80 text-lg max-w-lg mx-auto">
              We&apos;d love to hear from you. Reach out through any of the channels below.
            </p>
          </div>
        </div>

        <section className="px-4 -mt-8 pb-20">
          <div className="max-w-lg mx-auto">
            <div className="space-y-3">
              {/* WhatsApp */}
              <a
                href="https://wa.me/6585484800"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:border-green-300 transition-all group"
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 text-2xl group-hover:scale-110 transition-transform">💬</span>
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">WhatsApp</p>
                  <p className="text-sm text-gray-500">+65 8548 4800</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="ml-auto text-gray-300 group-hover:text-green-400 transition-colors" aria-hidden="true">
                  <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              {/* Call */}
              <a
                href="tel:+6585484800"
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:border-ocean-300 transition-all group"
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-ocean-50 text-2xl group-hover:scale-110 transition-transform">📞</span>
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-ocean-600 transition-colors">Call</p>
                  <p className="text-sm text-gray-500">+65 8548 4800</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="ml-auto text-gray-300 group-hover:text-ocean-400 transition-colors" aria-hidden="true">
                  <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              {/* Email */}
              <a
                href="mailto:awesometraveltoursingapore@gmail.com"
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:border-ocean-300 transition-all group"
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-ocean-50 text-2xl group-hover:scale-110 transition-transform">✉️</span>
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-ocean-600 transition-colors">Email</p>
                  <p className="text-sm text-gray-500">awesometraveltoursingapore@gmail.com</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="ml-auto text-gray-300 group-hover:text-ocean-400 transition-colors shrink-0" aria-hidden="true">
                  <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              {/* WeChat */}
              <button
                onClick={copyWechat}
                className="w-full flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:border-green-300 transition-all group text-left"
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 text-2xl group-hover:scale-110 transition-transform">💚</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">WeChat</p>
                  <p className="text-sm text-gray-500">{WECHAT_ID}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full shrink-0 transition-all ${
                  copied
                    ? 'bg-green-100 text-green-700 scale-105'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-green-50 group-hover:text-green-600'
                }`}>
                  {copied ? 'Copied!' : 'Copy ID'}
                </span>
              </button>
            </div>

            {/* Location info */}
            <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
              <p className="text-sm font-semibold text-gray-800 mb-1">Based in Singapore</p>
              <p className="text-sm text-gray-500">Tours available daily. Reach out anytime!</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
