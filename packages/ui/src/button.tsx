import ReactLoading from "react-loading";

export function Button({
  title,
  onClick,
  secondary = false,
  disabled = false,
}: {
  title: string;
  secondary?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${disabled ? "opacity-50 cursor-not-allowed" : ""} ${secondary ? "bg-secondary t-primary bg-button border border-black/5 dark:border-white/10" : "bg-theme text-white active:bg-theme-active hover:bg-theme-hover shadow-[0_18px_40px_-22px_rgba(59,89,122,0.65)]"} text-nowrap rounded-[18px] px-4 py-2.5 h-min font-medium tracking-[-0.01em] transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0`}
    >
      {title}
    </button>
  );
}

export function ButtonWithLoading({
  title,
  onClick,
  loading,
  secondary = false,
}: {
  title: string;
  secondary?: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${secondary ? "bg-secondary t-primary bg-button border border-black/5 dark:border-white/10" : "bg-theme text-white active:bg-theme-active hover:bg-theme-hover shadow-[0_18px_40px_-22px_rgba(59,89,122,0.65)]"} text-nowrap rounded-[18px] px-4 py-2.5 h-min space-x-2 flex flex-row items-center font-medium tracking-[-0.01em] transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0`}
    >
      {loading && <ReactLoading width="1em" height="1em" type="spin" color="#FFF" />}
      <span>{title}</span>
    </button>
  );
}
