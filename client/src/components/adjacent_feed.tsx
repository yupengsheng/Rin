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
        <div className="m-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        return (<div className="w-full rounded-[24px] border border-black/10 bg-w p-6 dark:border-white/10">
            <p className={`w-full text-[11px] font-semibold uppercase tracking-[0.24em] t-secondary ${direction}`}>
                {label}
            </p>
            <h1 className={`mt-3 text-xl font-semibold text-gray-700 dark:text-white text-pretty truncate ${direction}`}>
                {t('no_more')}
            </h1>
        </div>);
    }
    return (
        <Link href={`/feed/${data.id}`} target="_blank"
              className="w-full rounded-[24px] border border-black/10 bg-w p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-40px_rgba(15,23,42,0.35)] dark:border-white/10">
            <p className={`w-full text-[11px] font-semibold uppercase tracking-[0.24em] t-secondary ${direction}`}>
                {label}
            </p>
            <h1 className={`mt-3 text-xl font-semibold text-gray-700 dark:text-white text-pretty truncate ${direction}`}>
                {data.title}
            </h1>
            <p className={`mt-3 space-x-2 ${direction}`}>
                <span className="text-gray-400 text-sm" title={new Date(data.createdAt).toLocaleString()}>
                    {data.createdAt === data.updatedAt ? timeago(data.createdAt) : t('feed_card.published$time', {time: timeago(data.createdAt)})}
                </span>
                {data.createdAt !== data.updatedAt &&
                    <span className="text-gray-400 text-sm" title={new Date(data.updatedAt).toLocaleString()}>
                        {t('feed_card.updated$time', {time: timeago(data.updatedAt)})}
                    </span>
                }
            </p>
        </Link>
    )
}
