import type { ReactNode } from "react";
import Modal from "react-modal";

export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-5xl px-4 py-8 ${className}`.trim()}>{children}</div>;
}

export function CenteredShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-h-[60vh] w-full items-center justify-center px-4 py-10 ${className}`.trim()}>
      {children}
    </div>
  );
}

export function SurfaceCard({
  children,
  className = "",
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "subtle" | "danger" | "success";
}) {
  const toneClass =
    tone === "danger"
      ? "border-rose-200/80 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/20"
      : tone === "success"
        ? "border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/20"
        : tone === "subtle"
          ? "border-black/5 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]"
          : "border-black/10 bg-w shadow-[0_24px_70px_-52px_rgba(15,23,42,0.45)] dark:border-white/10";

  return <div className={`rounded-[28px] border ${toneClass} ${className}`.trim()}>{children}</div>;
}

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`.trim()}>
      <div className="min-w-0">
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-theme/75">{eyebrow}</p> : null}
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] t-primary sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 t-secondary">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function FeedbackBanner({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: "default" | "danger" | "success";
  className?: string;
}) {
  const toneClass =
    tone === "danger"
      ? "border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
      : tone === "success"
        ? "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
        : "border-black/10 bg-black/[0.03] t-secondary dark:border-white/10 dark:bg-white/[0.04]";

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClass} ${className}`.trim()}>{children}</div>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <SurfaceCard tone="subtle" className="px-6 py-10 text-center">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-theme/10 text-theme">
        <i className="ri-sparkling-2-line text-lg" />
      </span>
      <p className="mt-4 text-base font-medium t-primary">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 t-secondary">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </SurfaceCard>
  );
}

const modalStyles: Modal.Styles = {
  content: {
    inset: "0",
    padding: "1rem",
    border: "none",
    background: "transparent",
    overflow: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    backgroundColor: "rgba(15, 23, 42, 0.42)",
    backdropFilter: "blur(10px)",
    zIndex: 1000,
  },
};

export function ModalSurface({
  isOpen,
  onRequestClose,
  children,
  className = "",
  maxWidth = "40rem",
}: {
  isOpen: boolean;
  onRequestClose: () => void;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  const styles: Modal.Styles = {
    ...modalStyles,
    content: {
      ...modalStyles.content,
    },
  };

  return (
    <Modal isOpen={isOpen} shouldCloseOnOverlayClick shouldCloseOnEsc onRequestClose={onRequestClose} style={styles}>
      <SurfaceCard className={`w-[min(92vw,${maxWidth})] p-6 sm:p-7 ${className}`.trim()}>{children}</SurfaceCard>
    </Modal>
  );
}
