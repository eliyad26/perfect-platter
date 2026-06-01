import Link from "next/link";

const businessName =
  process.env.NEXT_PUBLIC_BUSINESS_NAME || "Perfect Platter";

export function Header({ showAdminLink = true }: { showAdminLink?: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl shadow-md">
            🍇
          </span>
          <div>
            <h1 className="text-lg font-bold text-stone-900 sm:text-xl">
              {businessName}
            </h1>
            <p className="text-xs text-stone-500 sm:text-sm">
              Fresh fruit platters · מגשי פירות טריים
            </p>
          </div>
        </Link>
        {showAdminLink && (
          <Link
            href="/admin"
            className="text-sm font-medium text-stone-500 transition hover:text-brand-600"
          >
            ניהול
          </Link>
        )}
      </div>
    </header>
  );
}
