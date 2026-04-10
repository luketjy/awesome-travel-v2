const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Do you offer hotel pickup?',
    a: "Yes. If you're staying within the central area, we can arrange convenient hotel pickup and drop-off for your tour. Otherwise, we'll suggest an easy meeting point usually near Chinatown MRT.",
  },
  {
    q: 'Are tickets included?',
    a: 'Some tours include attraction tickets; others keep it flexible. See each tour for specifics.',
  },
  {
    q: 'What about dietary needs?',
    a: 'We can accommodate most preferences—vegetarian, no-pork, gluten-aware—just tell us during booking.',
  },
  {
    q: 'Do I need a visa for Singapore?',
    a: 'Requirements vary by nationality. Please check with the relevant embassy or consulate before traveling.',
  },
]

export default function HomeFaq() {
  return (
    <section className="py-20 px-4 bg-warm-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-ocean-500 text-sm font-semibold uppercase tracking-widest mb-2">Questions?</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Frequently Asked</h2>
          <p className="text-gray-500 text-lg">
            Quick answers about our tours and how we work.
          </p>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-2xl border border-gray-100 bg-white px-6 py-1 shadow-sm open:shadow-md open:border-ocean-200 transition-all"
            >
              <summary className="cursor-pointer list-none py-5 font-semibold text-gray-800 flex items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <span>{q}</span>
                <svg
                  width="20" height="20" viewBox="0 0 20 20" fill="none"
                  className="text-ocean-500 shrink-0 group-open:rotate-180 transition-transform duration-200"
                  aria-hidden="true"
                >
                  <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <div className="text-gray-600 text-sm leading-relaxed pb-5 pt-3 border-t border-gray-100">
                {a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
