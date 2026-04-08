import { t } from "i18next";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ButtonWithLoading } from "../components/button";
import { Input } from "../components/input";
import { CenteredShell, FeedbackBanner, SurfaceCard } from "../components/public-ui";
import { client } from "../app/runtime";
import { setAuthToken } from "../utils/auth";
import { getLoginRedirectPath } from "../utils/auth-redirect";

export function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [authStatus, setAuthStatus] = useState<{ password: boolean }>({ password: false });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [, setLocation] = useLocation();

    // Fetch auth status on mount
    useEffect(() => {
        client.auth.status().then(({ data }) => {
            if (data) {
                setAuthStatus(data);
            }
        });
    }, []);

    const handleLogin = async () => {
        if (!username || !password) {
            setError(t('login.error.empty'));
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const { data, error: apiError } = await client.auth.login({ username, password });

            if (apiError) {
                setError(t('login.error.invalid'));
                setIsLoading(false);
                return;
            }

            if (data?.success) {
                // Save token to localStorage for cross-domain auth
                if (data.token) {
                    setAuthToken(data.token);
                }
                setLocation(getLoginRedirectPath(window.location.search));
                window.location.reload();
            } else {
                setError(t('login.error.failed'));
            }
        } catch (err) {
            setError(t('login.error.network'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CenteredShell className="my-6">
            <SurfaceCard className="w-full max-w-xl p-8 sm:p-10">
                <div className="flex flex-col gap-6">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-theme/75">{t('login.title')}</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] t-primary">{t('login.title')}</h1>
                        <p className="mt-2 text-sm leading-6 t-secondary">{t('login.required')}</p>
                    </div>

                    {error ? <FeedbackBanner tone="danger">{error}</FeedbackBanner> : null}

                    {authStatus.password && (
                        <div className="space-y-4">
                            <Input
                                value={username}
                                setValue={setUsername}
                                placeholder={t('login.username.placeholder')}
                                disabled={isLoading}
                                autofocus
                                className="rounded-2xl py-3"
                            />
                            <Input
                                value={password}
                                setValue={setPassword}
                                placeholder={t('login.password.placeholder')}
                                type="password"
                                onSubmit={handleLogin}
                                disabled={isLoading}
                                className="rounded-2xl py-3"
                            />
                            <div className="pt-2">
                                <ButtonWithLoading
                                    title={isLoading ? t("login.loading") : t("login.title")}
                                    onClick={handleLogin}
                                    loading={isLoading}
                                />
                            </div>
                        </div>
                    )}

                    {!authStatus.password ? (
                        <FeedbackBanner tone="danger">{t('login.no_methods')}</FeedbackBanner>
                    ) : null}
                </div>
            </SurfaceCard>
        </CenteredShell>
    );
}
