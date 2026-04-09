import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function FlatPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={joinClasses("rounded-[28px] border border-black/8 bg-w shadow-[0_24px_70px_-50px_rgba(73,101,133,0.35)] dark:border-white/10 dark:shadow-[0_24px_70px_-48px_rgba(2,6,23,0.72)]", className)}>
      {children}
    </div>
  );
}

export function FlatInset({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={joinClasses("rounded-[24px] border border-black/6 bg-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]", className)}>
      {children}
    </div>
  );
}

export function FlatTabButton({
  active = false,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
}) {
  return (
    <button
      {...props}
      className={joinClasses(
        "rounded-[18px] px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
        active ? "bg-w text-theme shadow-[0_16px_30px_-24px_rgba(73,101,133,0.4)]" : "text-neutral-500 dark:text-neutral-400 hover:bg-white/55 dark:hover:bg-white/5",
        className,
      )}
    />
  );
}

export function FlatActionButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={joinClasses("rounded-[18px] border border-black/6 bg-secondary px-4 py-2.5 font-medium transition-all duration-200 hover:-translate-y-[1px] dark:border-white/10", className)}
    />
  );
}

export function FlatMetaRow({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={joinClasses(
        "flex select-none flex-row items-center justify-between rounded-[24px] border border-black/6 bg-secondary px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
