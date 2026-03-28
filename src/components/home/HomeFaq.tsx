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
    <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">FAQ</h2>
        <p className="text-gray-500 text-center mb-10 text-sm">
          Quick answers about our tours and how we work.
        </p>
        <div className="space-y-3">
          {FAQ_ITEMS.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-xl border border-gray-200 bg-white px-5 py-1 shadow-sm open:shadow-md open:border-ocean-200 transition-shadow"
            >
              <summary className="cursor-pointer list-none py-4 font-semibold text-gray-800 flex items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <span>{q}</span>
                <span
                  className="text-ocean-500 text-xl leading-none shrink-0 group-open:rotate-180 transition-transform"
                  aria-hidden
                >
                  ▼
                </span>
              </summary>
              <div className="text-gray-600 text-sm leading-relaxed pb-4 pt-3 border-t border-gray-100">
                {a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
