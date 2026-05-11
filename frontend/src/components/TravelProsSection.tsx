import Image from 'next/image'

const CARDS = [
  {
    title: 'Plan with AI',
    description: 'Get travel questions answered',
    image: '/images/plan-with-ai.svg',
    bg: 'from-amber-100 to-orange-200 dark:from-amber-900/40 dark:to-orange-900/40',
  },
  {
    title: 'Best Time to Travel',
    description: 'Know when to save',
    image: '/images/best-time.svg',
    bg: 'from-sky-100 to-blue-200 dark:from-sky-900/40 dark:to-blue-900/40',
  },
  {
    title: 'Explore',
    description: 'See destinations on your budget',
    image: '/images/explore.svg',
    bg: 'from-emerald-100 to-teal-200 dark:from-emerald-900/40 dark:to-teal-900/40',
  },
  {
    title: 'Trips',
    description: 'Keep all your plans in one place',
    image: '/images/trips.svg',
    bg: 'from-rose-100 to-pink-200 dark:from-rose-900/40 dark:to-pink-900/40',
  },
]

export function TravelProsSection() {
  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-100">
        For travel pros
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <article
            key={card.title}
            className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 transition-shadow hover:shadow-md dark:bg-neutral-900 dark:ring-neutral-800"
          >
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {card.title}
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {card.description}
              </p>
            </div>
            <div
              className={`flex h-40 items-center justify-center rounded-xl bg-gradient-to-br ${card.bg}`}
            >
              <Image
                src={card.image}
                alt=""
                width={240}
                height={160}
                className="h-full w-auto object-contain p-3"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
