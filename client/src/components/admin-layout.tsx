import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { useSiteConfig } from "../hooks/useSiteConfig";

function AdminNavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  const [location] = useLocation();
  const active = location === href || location.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? "bg-theme text-white"
          : "t-primary hover:bg-neutral-100 dark:hover:bg-white/5"
      }`}
    >
      <i className={`${icon} text-base`} />
      <span>{label}</span>
    </Link>
  );
}

export function AdminLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const siteConfig = useSiteConfig();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(245,248,252,0.94),rgba(236,243,249,0.96))] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.94))]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6 lg:py-8">
        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-72 lg:self-start">
          <div className="rounded-[32px] border border-black/8 bg-w p-5 shadow-[0_26px_70px_-52px_rgba(73,101,133,0.34)] backdrop-blur-xl dark:border-white/10 dark:shadow-[0_28px_76px_-52px_rgba(2,6,23,0.78)]">
            <Link href="/" className="flex items-center gap-4 rounded-[22px] px-3 py-3 transition-colors hover:bg-[rgba(240,245,251,0.92)] dark:hover:bg-white/5">
              {siteConfig.avatar ? (
                <img src={siteConfig.avatar} alt="Avatar" className="h-12 w-12 rounded-[18px] border border-black/8 dark:border-white/10" />
              ) : null}
              <div className="min-w-0">
                <p className="truncate text-base font-semibold tracking-[-0.02em] t-primary">{siteConfig.name}</p>
                <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">{t("admin.back_to_site")}</p>
              </div>
            </Link>

            <div className="mt-6">
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                {t("admin.title")}
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <AdminNavItem href="/admin/writing" icon="ri-quill-pen-line" label={t("writing")} />
                <AdminNavItem href="/admin/friends" icon="ri-links-line" label={t("friends.title")} />
                <AdminNavItem href="/admin/settings" icon="ri-settings-3-line" label={t("settings.title")} />
                <AdminNavItem href="/admin/health" icon="ri-heart-pulse-line" label={t("health.title")} />
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-[34px] border border-black/8 bg-w p-6 shadow-[0_28px_80px_-56px_rgba(73,101,133,0.34)] backdrop-blur-xl dark:border-white/10 dark:shadow-[0_28px_80px_-54px_rgba(2,6,23,0.8)]">
            <div className="border-b border-black/5 pb-5 dark:border-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-theme/70">{t("admin.title")}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] t-primary">{title}</h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-neutral-500 dark:text-neutral-400">{description}</p>
            </div>
            <div className="mt-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
