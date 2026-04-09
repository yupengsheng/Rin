import type { ReactNode } from "react";
import Modal from "react-modal";

export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-5xl px-4 py-10 md:px-6 lg:py-12 ${className}`.trim()}>{children}</div>;
}

export function CenteredShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-h-[60vh] w-full items-center justify-center px-4 py-12 md:px-6 ${className}`.trim()}>
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
      ? "border-rose-200/70 bg-[rgba(255,244,244,0.88)] shadow-[0_20px_50px_-40px_rgba(225,29,72,0.28)] dark:border-rose-900/50 dark:bg-rose-950/18"
      : tone === "success"
        ? "border-emerald-200/70 bg-[rgba(241,252,248,0.88)] shadow-[0_20px_50px_-40px_rgba(16,185,129,0.24)] dark:border-emerald-900/50 dark:bg-emerald-950/18"
        : tone === "subtle"
          ? "border-black/5 bg-[rgba(248,251,255,0.62)] shadow-[0_18px_44px_-38px_rgba(59,89,122,0.18)] dark:border-white/8 dark:bg-[rgba(30,41,59,0.46)]"
          : "border-black/8 bg-w shadow-[0_30px_80px_-56px_rgba(73,101,133,0.34)] dark:border-white/10 dark:shadow-[0_32px_90px_-58px_rgba(2,6,23,0.76)]";

  return <div className={`rounded-[32px] border backdrop-blur-xl ${toneClass} ${className}`.trim()}>{children}</div>;
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
  const showEyebrow = eyebrow && eyebrow.trim() !== title.trim();

  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`.trim()}>
      <div className="min-w-0">
        {showEyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-theme/70">{eyebrow}</p> : null}
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] t-primary sm:text-[2.75rem]">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-[15px] leading-7 t-secondary">{description}</p> : null}
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
      ? "border-rose-200/70 bg-[rgba(255,244,244,0.88)] text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
      : tone === "success"
        ? "border-emerald-200/70 bg-[rgba(241,252,248,0.88)] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
        : "border-black/10 bg-[rgba(248,251,255,0.82)] t-secondary dark:border-white/10 dark:bg-white/[0.04]";

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
      <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-[22px] bg-theme/10 text-theme shadow-[0_14px_30px_-22px_rgba(73,101,133,0.45)]">
        <i className="ri-sparkling-2-line text-lg" />
      </span>
      <p className="mt-5 text-base font-semibold tracking-[-0.01em] t-primary">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-7 t-secondary">{description}</p> : null}
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
    backgroundColor: "rgba(23, 37, 55, 0.32)",
    backdropFilter: "blur(18px)",
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
