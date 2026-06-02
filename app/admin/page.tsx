"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminDashboard } from "@/components/AdminDashboard";
import { useI18n } from "@/components/I18nProvider";
import { uiText } from "@/lib/i18n";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const { lang } = useI18n();

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => setAuthed(res.ok))
      .catch(() => setAuthed(false));
  }, []);

  return (
    <>
      <Header showAdminLink={false} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-medium text-brand-600 hover:underline"
        >
          {uiText("backToSite", lang)}
        </Link>

        {authed === null ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          </div>
        ) : authed ? (
          <AdminDashboard onLogout={() => setAuthed(false)} />
        ) : (
          <AdminLogin onSuccess={() => setAuthed(true)} />
        )}
      </main>
    </>
  );
}
