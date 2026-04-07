'use client'

export default function InvoicePrintButton({ iframeId }: { iframeId: string }) {
  function handlePrint() {
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null
    iframe?.contentWindow?.print()
  }

  return (
    <button
      onClick={handlePrint}
      className="bg-ocean-500 hover:bg-ocean-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
    >
      Print / Save PDF
    </button>
  )
}
