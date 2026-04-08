import { useTranslation } from 'react-i18next'
import { Button } from '../components/button'
import { Helmet } from 'react-helmet'
import { useSiteConfig } from "../hooks/useSiteConfig";
import { CenteredShell, EmptyState } from '../components/public-ui';
import { siteName } from '../utils/constants'

export function ErrorPage({error}: {error?: string}) {
    const { t } = useTranslation()
    const siteConfig = useSiteConfig();
    return (
        <>
            <Helmet>
                <title>{`${t('error.title')} - ${siteConfig.name}`}</title>
                <meta property="og:site_name" content={siteName} />
                <meta property="og:title" content={t('error.title')} />
                <meta property="og:image" content={siteConfig.avatar} />
            </Helmet>
            <CenteredShell className="ani-show">
                <div className="w-full max-w-2xl">
                    <EmptyState
                        title={error || t('error.title')}
                        action={
                            <Button
                                title={t("index.back")}
                                onClick={() => (window.location.href = "/")}
                            />
                        }
                    />
                </div>
            </CenteredShell>
        </>
    );
}
