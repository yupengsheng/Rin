import {useEffect, useRef, useState} from "react"
import {Helmet} from 'react-helmet'
import {Link} from "wouter"
import {Waiting} from "../components/loading"
import { client } from "../app/runtime"
import {useSiteConfig} from "../hooks/useSiteConfig";
import {siteName} from "../utils/constants"
import {useTranslation} from "react-i18next";
import { EmptyState, PageIntro, PageShell, SurfaceCard } from "../components/public-ui";

interface FeedItem {
    id: number;
    createdAt: Date;
    title: string | null;
}

export function TimelinePage() {
    const [feeds, setFeeds] = useState<Partial<Record<number, FeedItem[]>>>()
    const [length, setLength] = useState(0)
    const ref = useRef(false)
    const { t } = useTranslation()
    const siteConfig = useSiteConfig();
    function fetchFeeds() {
        client.feed.timeline()
        .then(({ data }) => {
            if (data) {
                const arr = Array.isArray(data) ? data : []
                setLength(arr.length)
                // 兼容的分组逻辑
                const groups = (Object.groupBy
                    ? Object.groupBy(arr, ({ createdAt }) => new Date(createdAt).getFullYear())
                    : arr.reduce<Record<number, any[]>>((acc, item) => {
                        const key = new Date(item.createdAt).getFullYear()
                        ;(acc[key] ||= []).push(item)
                        return acc
                    }, {})
                )

                setFeeds(groups as any)
            }
        })
        .catch(err => {
            console.error("fetchFeeds error:", err)
        })
    }

    useEffect(() => {
        if (ref.current) return
        fetchFeeds()
        ref.current = true
    }, [])
    return (
        <>
            <Helmet>
                <title>{`${t('timeline')} - ${siteConfig.name}`}</title>
                <meta property="og:site_name" content={siteName} />
                <meta property="og:title" content={t('timeline')} />
                <meta property="og:image" content={siteConfig.avatar} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={document.URL} />
            </Helmet>
            <Waiting for={feeds}>
                <PageShell className="ani-show">
                    <div className="mx-auto w-full max-w-4xl space-y-6">
                        <PageIntro
                            title={t('timeline')}
                            description={t('article.total$count', { count: length })}
                        />
                        <SurfaceCard className="p-5 sm:p-6">
                            {feeds && Object.keys(feeds).length > 0 ? (
                                Object.keys(feeds).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
                                    <div key={year} className="flex flex-col items-start py-3 first:pt-0 last:pb-0">
                                        <h1 className="flex flex-row items-center space-x-2">
                                            <span className="text-2xl font-bold t-primary ">
                                                {t('year$year', { year: year })}
                                            </span>
                                            <span className="text-sm t-secondary">
                                                {t('article.total_short$count', { count: feeds[+year]?.length })}
                                            </span>
                                        </h1>
                                        <div className="my-4 w-full">
                                            {feeds[+year]?.map(({ id, title, createdAt }) => (
                                                <FeedItem key={id} id={id.toString()} title={title || t('unlisted')}
                                                          createdAt={new Date(createdAt)}/>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState
                                    title={t("article.empty_title")}
                                    description={t("article.empty_description")}
                                />
                            )}
                        </SurfaceCard>
                    </div>
                </PageShell>
            </Waiting>
        </>
    )
}

export function FeedItem({ id, title, createdAt }: { id: string, title: string, createdAt: Date }) {
    const formatter = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: '2-digit' });
    return (
        <div className="flex flex-row pl-6">
            <div className="flex flex-row items-center">
                <div className="h-2.5 w-2.5 rounded-full bg-theme shadow-[0_0_0_4px_rgba(252,70,107,0.12)]"></div>
            </div>
            <div className="m-2 flex flex-1 flex-row items-center space-x-4 rounded-2xl border border-black/5 bg-black/[0.015] px-4 py-3 duration-300 dark:border-white/10 dark:bg-white/[0.03]">
                <span className="t-secondary text-sm" title={new Date(createdAt).toLocaleString()}>
                    {formatter.format(new Date(createdAt))}
                </span>
                <Link href={`/feed/${id}`} target="_blank" className="text-base t-primary hover:text-theme text-pretty overflow-hidden">
                    {title}
                </Link>
            </div>
        </div>
    )
}
