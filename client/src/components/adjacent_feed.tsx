import type { AdjacentFeed, AdjacentFeedResponse } from "@rin/api";
import {useEffect, useState} from "react";
import { client } from "../app/runtime";
import {timeago} from "../utils/timeago.ts";
import {Link} from "wouter";
import {useTranslation} from "react-i18next";

export function AdjacentSection({id, setError}: { id: string, setError: (error: string) => void }) {
    const [adjacentFeeds, setAdjacentFeeds] = useState<AdjacentFeedResponse>();

    useEffect(() => {
        client.feed
            .adjacent(id)
            .then(({data, error}) => {
                if (error) {
                    setError(error.value as string);
                } else if (data && typeof data !== "string") {
                    setAdjacentFeeds(data);
                }
            });
    }, [id, setError]);
    return (
        <div className="m-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdjacentCard data={adjacentFeeds?.previousFeed} type="previous"/>
            <AdjacentCard data={adjacentFeeds?.nextFeed} type="next"/>
        </div>
    )
}

export function AdjacentCard({data, type}: { data: AdjacentFeed | null | undefined, type: "previous" | "next" }) {
    const direction = type === "previous" ? "text-start" : "text-end"
    const {t} = useTranslation()
    const label = type === "previous" ? t("previous") : t("next")
    if (!data) {
        return (<div className="w-full rounded-[28px] border border-black/8 bg-w p-6 shadow-[0_24px_64px_-44px_rgba(73,101,133,0.28)] backdrop-blur-xl dark:border-white/10 dark:shadow-[0_24px_64px_-40px_rgba(2,6,23,0.76)]">
            <p className={`w-full text-[11px] font-semibold uppercase tracking-[0.24em] text-theme/70 ${direction}`}>
                {label}
            </p>
            <h1 className={`mt-3 text-[1.45rem] font-semibold tracking-[-0.03em] t-primary text-pretty truncate ${direction}`}>
                {t('no_more')}
            </h1>
        </div>);
    }
    return (
        <Link href={`/feed/${data.id}`} target="_blank"
              className="w-full rounded-[28px] border border-black/8 bg-w p-6 shadow-[0_24px_64px_-44px_rgba(73,101,133,0.28)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_30px_74px_-44px_rgba(73,101,133,0.34)] dark:border-white/10 dark:shadow-[0_24px_64px_-40px_rgba(2,6,23,0.76)]">
            <p className={`w-full text-[11px] font-semibold uppercase tracking-[0.24em] text-theme/70 ${direction}`}>
                {label}
            </p>
            <h1 className={`mt-3 text-[1.45rem] font-semibold tracking-[-0.03em] t-primary text-pretty truncate ${direction}`}>
                {data.title}
            </h1>
            <p className={`mt-4 space-x-2 ${direction}`}>
                <span className="text-slate-400 text-sm" title={new Date(data.createdAt).toLocaleString()}>
                    {data.createdAt === data.updatedAt ? timeago(data.createdAt) : t('feed_card.published$time', {time: timeago(data.createdAt)})}
                </span>
                {data.createdAt !== data.updatedAt &&
                    <span className="text-slate-400 text-sm" title={new Date(data.updatedAt).toLocaleString()}>
                        {t('feed_card.updated$time', {time: timeago(data.updatedAt)})}
                    </span>
                }
            </p>
        </Link>
    )
}
