import { useEffect, useRef, useState } from "react"
import { Helmet } from 'react-helmet'
import { useTranslation } from "react-i18next"
import { Link, useSearch } from "wouter"
import { FeedCard } from "../components/feed_card"
import { Waiting } from "../components/loading"
import { client } from "../app/runtime"

import { useSiteConfig } from "../hooks/useSiteConfig";
import { siteName } from "../utils/constants"
import { tryInt } from "../utils/int"
import { EmptyState, PageIntro, PageShell, SurfaceCard } from "../components/public-ui"

type FeedsData = {
    size: number,
    data: any[],
    hasNext: boolean
}

export function SearchPage({ keyword }: { keyword: string }) {
    const { t } = useTranslation()
    const siteConfig = useSiteConfig();
    const query = new URLSearchParams(useSearch());
    const [status, setStatus] = useState<'loading' | 'idle'>('idle')
    const [feeds, setFeeds] = useState<FeedsData>()
    const page = tryInt(1, query.get("page"))
    const limit = tryInt(siteConfig.pageSize, query.get("limit"))
    const feedListClass = siteConfig.feedLayout === "masonry" ? "columns-1 gap-5 md:columns-2" : "flex flex-col";
    const ref = useRef("")
    function fetchFeeds() {
        if (!keyword) return
        client.search.search(keyword, {
            page,
            limit,
        }).then(({ data }) => {
            if (data) {
                setFeeds(data)
                setStatus('idle')
            }
        })
    }
    useEffect(() => {
        const key = `${page} ${limit} ${keyword}`
        if (ref.current == key) return
        setStatus('loading')
        fetchFeeds()
        ref.current = key
    }, [page, limit, keyword])
    const title = t('article.search.title$keyword', { keyword })
    return (
        <>
            <Helmet>
                <title>{`${title} - ${siteConfig.name}`}</title>
                <meta property="og:site_name" content={siteName} />
                <meta property="og:title" content={title} />
                <meta property="og:image" content={siteConfig.avatar} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={document.URL} />
            </Helmet>
            <Waiting for={status === 'idle'}>
                <PageShell>
                    <div className="mx-auto w-full max-w-5xl space-y-6">
                        <PageIntro
                            eyebrow={t('article.search.title')}
                            title={t('article.search.title')}
                            description={t('article.total$count', { count: feeds?.size })}
                        />
                        <Waiting for={status === 'idle'}>
                            <SurfaceCard className="p-5 sm:p-6">
                                {feeds?.data.length ? (
                                    <div className={feedListClass}>
                                        {feeds?.data.map(({ id, ...feed }: any) => (
                                            <FeedCard key={id} id={id} {...feed} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title={t("article.search.empty_title")}
                                        description={t("article.search.empty_description$keyword", { keyword })}
                                    />
                                )}
                                <div className="mt-6 flex flex-row items-center ani-show">
                                    {page > 1 &&
                                        <Link href={`?page=${(page - 1)}&limit=${limit}`}
                                            className={`text-sm font-normal rounded-full px-4 py-2 text-white bg-theme`}>
                                            {t('previous')}
                                        </Link>
                                    }
                                    <div className="flex-1" />
                                    {feeds?.hasNext &&
                                        <Link href={`?page=${(page + 1)}&limit=${limit}`}
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
