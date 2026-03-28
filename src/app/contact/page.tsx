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
      <main className="flex-1">
        <section className="py-16 px-4">
          <div className="max-w-lg mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Contact Us</h1>
            <p className="text-gray-500 text-center mb-10">
              We&apos;d love to hear from you. Reach out through any of the channels below.
            </p>

            <div className="space-y-4">
              {/* WhatsApp */}
              <a
                href="https://wa.me/6585484800"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm hover:border-green-400 hover:shadow-md transition-all group"
              >
                <span className="text-3xl">💬</span>
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">WhatsApp</p>
                  <p className="text-sm text-gray-500">+65 8548 4800</p>
                </div>
              </a>

              {/* Call */}
              <a
                href="tel:+6585484800"
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm hover:border-ocean-400 hover:shadow-md transition-all group"
              >
                <span className="text-3xl">📞</span>
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-ocean-600 transition-colors">Call</p>
                  <p className="text-sm text-gray-500">+65 8548 4800</p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:awesometraveltoursingapore@gmail.com"
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm hover:border-ocean-400 hover:shadow-md transition-all group"
              >
                <span className="text-3xl">✉️</span>
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-ocean-600 transition-colors">Email</p>
                  <p className="text-sm text-gray-500">awesometraveltoursingapore@gmail.com</p>
                </div>
              </a>

              {/* WeChat */}
              <button
                onClick={copyWechat}
                className="w-full flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm hover:border-green-400 hover:shadow-md transition-all group text-left"
              >
                <span className="text-3xl">💚</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">WeChat</p>
                  <p className="text-sm text-gray-500">{WECHAT_ID}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 transition-colors ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-green-50 group-hover:text-green-600'
                }`}>
                  {copied ? 'Copied!' : 'Copy ID'}
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
