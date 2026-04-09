import { useLocation } from "wouter"

export function HashTag({ name }: { name: string }) {
    const [_, setLocation] = useLocation()
    return (
        <button onClick={(e) => { e.preventDefault(); setLocation(`/hashtag/${name}`) }}
            className="inline-flex items-center rounded-full border border-black/6 bg-[rgba(241,246,251,0.86)] px-3 py-1.5 text-sm t-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] transition-colors hover:border-theme/20 hover:bg-theme/10 hover:text-theme dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-theme/10" >
            <div className="flex gap-0.5">
                <div className="text-sm opacity-70 italic">#</div>
                <div className="text-sm opacity-90">
                    {name}
                </div>
            </div>
        </button >
    )
}
