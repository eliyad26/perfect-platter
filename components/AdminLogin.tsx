"use client";

import { useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { uiText } from "@/lib/i18n";

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const { lang } = useI18n();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה");
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mx-auto max-w-md">
      <h2 className="text-xl font-bold text-stone-900">
        {uiText("adminLoginTitle", lang)}
      </h2>
      <p className="mt-2 text-sm text-stone-500">
        {uiText("adminLoginSubtitle", lang)}
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="password"
          className="input-field"
          placeholder={uiText("passwordPlaceholder", lang)}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? uiText("loggingIn", lang) : uiText("login", lang)}
        </button>
      </form>
    </div>
  );
}
