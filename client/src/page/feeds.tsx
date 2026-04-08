import { useContext, useEffect, useRef, useState } from "react"
import { Helmet } from 'react-helmet'
import { Link, useSearch } from "wouter"
import { FeedCard } from "../components/feed_card"
import { Waiting } from "../components/loading"
import { client } from "../app/runtime"
import { ProfileContext } from "../state/profile"

import { useSiteConfig } from "../hooks/useSiteConfig";
import { siteName } from "../utils/constants"
import { tryInt } from "../utils/int"
import { useTranslation } from "react-i18next";
import { EmptyState, PageIntro, PageShell, SurfaceCard } from "../components/public-ui";

type FeedsData = {
    size: number,
    data: any[],
    hasNext: boolean
}

type FeedType = 'draft' | 'unlisted' | 'normal'

type FeedsMap = {
    [key in FeedType]: FeedsData
}

export function FeedsPage() {
    const { t } = useTranslation()
    const siteConfig = useSiteConfig();
    const query = new URLSearchParams(useSearch());
    const profile = useContext(ProfileContext);
    const [listState, _setListState] = useState<FeedType>(query.get("type") as FeedType || 'normal')
    const [status, setStatus] = useState<'loading' | 'idle'>('idle')
    const [feeds, setFeeds] = useState<FeedsMap>({
        draft: { size: 0, data: [], hasNext: false },
        unlisted: { size: 0, data: [], hasNext: false },
        normal: { size: 0, data: [], hasNext: false }
    })
    const page = tryInt(1, query.get("page"))
    const limit = tryInt(siteConfig.pageSize, query.get("limit"))
    const feedListClass = siteConfig.feedLayout === "masonry" ? "columns-1 gap-5 ani-show md:columns-2" : "flex flex-col ani-show";
    const ref = useRef("")
    function fetchFeeds(type: FeedType) {
        client.feed.list({
            page: page,
            limit: limit,
            type: type
        }).then(({ data }) => {
            if (data) {
                setFeeds({
                    ...feeds,
                    [type]: data
                })
                setStatus('idle')
            }
        })
    }
    useEffect(() => {
        const key = `${query.get("page")} ${query.get("type")} ${limit}`
        if (ref.current == key) return
        const type = query.get("type") as FeedType || 'normal'
        if (type !== listState) {
            _setListState(type)
        }
        setStatus('loading')
        fetchFeeds(type)
        ref.current = key
    }, [limit, query.get("page"), query.get("type")])
    return (
        <>
            <Helmet>
                <title>{`${t('article.title')} - ${siteConfig.name}`}</title>
                <meta property="og:site_name" content={siteName} />
                <meta property="og:title" content={t('article.title')} />
                <meta property="og:image" content={siteConfig.avatar} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={document.URL} />
            </Helmet>
            <Waiting for={feeds.draft.size + feeds.normal.size + feeds.unlisted.size > 0 || status === 'idle'}>
                <PageShell>
                    <div className="mx-auto w-full max-w-5xl space-y-6">
                        <PageIntro
                            eyebrow={t('article.title')}
                            title={listState === 'draft' ? t('draft_bin') : listState === 'normal' ? t('article.title') : t('unlisted')}
                            description={t('article.total$count', { count: feeds[listState]?.size })}
                            action={profile?.permission ? (
                                <div className="flex flex-row gap-2 rounded-full border border-black/10 bg-w p-1 dark:border-white/10">
                                    <Link href={listState === 'draft' ? '/?type=normal' : '/?type=draft'} className={`rounded-full px-3 py-1.5 text-sm transition-colors ${listState === 'draft' ? "bg-theme text-white" : "t-secondary hover:bg-black/5 dark:hover:bg-white/10"}`}>
                                        {t('draft_bin')}
                                    </Link>
                                    <Link href={listState === 'unlisted' ? '/?type=normal' : '/?type=unlisted'} className={`rounded-full px-3 py-1.5 text-sm transition-colors ${listState === 'unlisted' ? "bg-theme text-white" : "t-secondary hover:bg-black/5 dark:hover:bg-white/10"}`}>
                                        {t('unlisted')}
                                    </Link>
                                </div>
                            ) : undefined}
                        />
                        <Waiting for={status === 'idle'}>
                            <SurfaceCard className="p-5 sm:p-6">
                                {feeds[listState].data.length ? (
                                    <div className={feedListClass}>
                                        {feeds[listState].data.map(({ id, ...feed }: any) => (
                                            <FeedCard key={id} id={id} {...feed} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title={t("article.empty_title")}
                                        description={t("article.empty_description")}
                                    />
                                )}
                                <div className="mt-6 flex flex-row items-center ani-show">
                                    {page > 1 &&
                                        <Link href={`/?type=${listState}&page=${(page - 1)}`}
                                            className={`text-sm font-normal rounded-full px-4 py-2 text-white bg-theme`}>
                                            {t('previous')}
                                        </Link>
                                    }
                                    <div className="flex-1" />
                                    {feeds[listState]?.hasNext &&
                                        <Link href={`/?type=${listState}&page=${(page + 1)}`}
                                            className={`text-sm font-normal rounded-full px-4 py-2 text-white bg-theme`}>
                                            {t('next')}
                                        </Link>
                                    }
                                </div>
                            </SurfaceCard>
                        </Waiting>
                    </div>
                </PageShell>
            </Waiting>
        </>
    )
}
