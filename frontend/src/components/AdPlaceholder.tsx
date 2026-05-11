// Sticky ad/image slot rendered as the third column on the flight and stay
// search result pages. Placeholder copy + CTA today; swap the content out
// (or wire it to a CMS) when a real campaign exists.

export function AdPlaceholder() {
  return (
    <aside className="lg:sticky lg:top-4 lg:self-start">
      <div className="overflow-hidden rounded-[4px] border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {/* Illustration / image slot — gradient placeholder for now */}
        <div className="relative flex aspect-[5/4] w-full items-center justify-center bg-gradient-to-br from-orange-100 via-orange-50 to-white dark:from-orange-950/50 dark:via-neutral-900 dark:to-neutral-900">
          <div className="flex flex-col items-center gap-2 text-orange-600 dark:text-orange-300">
            <svg
              className="size-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="9" cy="11" r="1.5" />
              <path d="M3 17l5-5 4 4 3-3 6 6" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider">
              Image / Ad
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-2.5 p-5">
          <h3 className="text-base text-neutral-900 dark:text-neutral-100">
            The ultimate travel package
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              NXT.DEALS Guarantee
            </span>{' '}
            provides instant solutions to disruptions, continuous support, and
            automated travel services.
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            Discover more
          </button>
        </div>
      </div>
    </aside>
  )
}
