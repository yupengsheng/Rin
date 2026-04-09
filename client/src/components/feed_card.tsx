import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { timeago } from "../utils/timeago";
import { HashTag } from "./hashtag";
import { useEffect, useRef } from "react";
import { drawBlurhashToCanvas } from "../utils/blurhash";
import { parseImageUrlMetadata } from "../utils/image-upload";
import { useImageLoadState } from "../utils/use-image-load-state";
import { type FeedCardVariant, normalizeFeedCardVariant } from "./feed-card-options";
import { useSiteConfig } from "../hooks/useSiteConfig";

function FeedCardImage({ src, variant }: { src: string; variant: FeedCardVariant }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { src: cleanSrc, blurhash, width, height } = parseImageUrlMetadata(src);
    const { failed, imageRef, loaded, onError, onLoad } = useImageLoadState(cleanSrc);
    const aspectRatio = width && height ? `${width} / ${height}` : undefined;
    const imageFrameClass =
        variant === "editorial"
            ? "relative flex max-h-80 w-full flex-row items-center overflow-hidden rounded-[20px]"
            : "relative mb-2 flex max-h-80 w-full flex-row items-center overflow-hidden rounded-xl";

    useEffect(() => {
        if (!blurhash || !canvasRef.current) {
            return;
        }
        try {
            drawBlurhashToCanvas(canvasRef.current, blurhash);
        } catch (error) {
            console.error("Failed to render blurhash", error);
        }
    }, [blurhash]);

    return (
        <div
            className={imageFrameClass}
            style={{ aspectRatio }}
        >
            {blurhash && !loaded ? (
                <canvas
                    ref={canvasRef}
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full scale-110 object-cover blur-sm"
                />
            ) : null}
            <img
                ref={imageRef}
                src={cleanSrc}
                alt=""
                width={width}
                height={height}
                onLoad={onLoad}
                onError={onError}
                className={`absolute inset-0 h-full w-full object-cover object-center hover:scale-105 translation duration-300 ${blurhash && (!loaded || failed) ? "opacity-0" : "opacity-100"
                    }`}
            />
        </div>
    );
}

const FEED_CARD_STYLES: Record<
    FeedCardVariant,
    {
        card: string;
        imageWrap: string;
        meta: string;
        summary: string;
        title: string;
    }
> = {
    default: {
        card: "my-3 inline-block w-full break-inside-avoid rounded-[30px] border border-black/8 bg-w p-5 shadow-[0_28px_78px_-58px_rgba(73,101,133,0.34)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_34px_88px_-58px_rgba(73,101,133,0.4)] dark:border-white/10 dark:shadow-[0_28px_78px_-54px_rgba(2,6,23,0.82)]",
        imageWrap: "",
        meta: "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500/90 dark:text-slate-300/80",
        summary: "line-clamp-4 text-pretty overflow-hidden text-[15px] leading-7 text-slate-600 dark:text-slate-300",
        title: "text-[1.9rem] font-semibold tracking-[-0.035em] text-slate-900 dark:text-white text-pretty overflow-hidden",
    },
    editorial: {
        card: "my-3 inline-block w-full break-inside-avoid overflow-hidden rounded-[32px] border border-black/8 bg-w p-3 shadow-[0_30px_88px_-60px_rgba(73,101,133,0.34)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_36px_96px_-60px_rgba(73,101,133,0.4)] dark:border-white/10 dark:shadow-[0_30px_88px_-58px_rgba(2,6,23,0.84)]",
        imageWrap: "mb-3 overflow-hidden rounded-[24px] border border-black/5 dark:border-white/10",
        meta: "text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500/90 dark:text-slate-300/80",
        summary: "line-clamp-5 text-pretty text-[15px] leading-7 text-slate-600 dark:text-slate-300",
        title: "text-[1.9rem] font-semibold tracking-[-0.035em] text-slate-900 dark:text-white text-pretty overflow-hidden",
    },
};

export type FeedCardProps = {
    id: string;
    avatar?: string;
    draft?: number;
    listed?: number;
    top?: number;
    title: string;
    summary: string;
    hashtags: { id: number, name: string }[];
    createdAt: Date;
    updatedAt: Date;
    preview?: boolean;
    variant?: FeedCardVariant;
};

export function FeedCard({ id, title, avatar, draft, listed, top, summary, hashtags, createdAt, updatedAt, preview = false, variant }: FeedCardProps) {
    const { t } = useTranslation();
    const siteConfig = useSiteConfig();
    const activeVariant = normalizeFeedCardVariant(variant ?? siteConfig.feedCardVariant);
    const styles = FEED_CARD_STYLES[activeVariant];
    const body = (
        <div className={styles.card}>
            {avatar ? (
                <div className={styles.imageWrap}>
                    <FeedCardImage src={avatar} variant={activeVariant} />
                </div>
            ) : null}
            <div className={activeVariant === "editorial" ? "px-2 pb-2" : ""}>
                <h1 className={styles.title}>{title}</h1>
                <p className={`mt-3 space-x-2 ${styles.meta}`}>
                    <span title={new Date(createdAt).toLocaleString()}>
                        {createdAt === updatedAt ? timeago(createdAt) : t('feed_card.published$time', { time: timeago(createdAt) })}
                    </span>
                    {createdAt !== updatedAt &&
                        <span title={new Date(updatedAt).toLocaleString()}>
                            {t('feed_card.updated$time', { time: timeago(updatedAt) })}
                        </span>
                    }
                </p>
                <p className={`space-x-2 ${styles.meta} mt-2`}>
                    {draft === 1 && <span>{t("draft")}</span>}
                    {listed === 0 && <span>{t("unlisted")}</span>}
                    {top === 1 && <span className="text-theme">{t('article.top.title')}</span>}
                </p>
                <p className={`${styles.summary} ${activeVariant === "editorial" ? "mt-4 max-w-3xl" : "mt-4"}`}>{summary}</p>
                {hashtags.length > 0 &&
                    <div className={`flex flex-row flex-wrap justify-start gap-2 ${activeVariant === "editorial" ? "mt-4" : "mt-4"}`}>
                        {hashtags.map(({ name }, index) => (
                            <HashTag key={index} name={name} />
                        ))}
                    </div>
                }
            </div>
        </div>
    );

    return preview ? body : <Link href={`/feed/${id}`} target="_blank" className="block w-full">{body}</Link>;
}
