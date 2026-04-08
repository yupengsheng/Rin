import { t } from "i18next";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ButtonWithLoading } from "../components/button";
import { client } from "../app/runtime";
    import { ImageUploadInput } from "../components/image-upload-input";
import { Input } from "../components/input";
import { FeedbackBanner, PageIntro, PageShell, SurfaceCard } from "../components/public-ui";
import { ProfileContext } from "../state/profile";


export function ProfilePage() {
    const profile = useContext(ProfileContext);
    const [, setLocation] = useLocation();
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load current profile data and redirect to login if not authenticated
    useEffect(() => {
        if (profile === undefined) {
            // Still loading, wait
            return;
        }
        if (profile === null) {
            // Not authenticated, redirect to login
            setLocation('/login');
            return;
        }
        // Load current profile data
        setUsername(profile.name || '');
        setAvatar(profile.avatar || '');
    }, [profile, setLocation]);

    const handleSubmit = async () => {
        if (!username.trim()) {
            setError(t('profile.error.empty_username'));
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const { error: apiError } = await client.user.updateProfile({ 
                username: username.trim(),
                avatar: avatar || null
            });

            if (apiError) {
                setError(t('profile.error.update_failed'));
                setIsLoading(false);
                return;
            }

            setSuccess(t('profile.success'));
            // Refresh page to update profile context
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            setError(t('profile.error.network'));
        } finally {
            setIsLoading(false);
        }
    };

    if (profile === undefined) {
        return (
            <PageShell className="py-20">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme"></div>
                </div>
            </PageShell>
        );
    }

    if (profile === null) {
        return null;
    }

    return (
        <PageShell className="py-10">
            <div className="mx-auto max-w-3xl space-y-6">
                <PageIntro
                    eyebrow={t('profile.title')}
                    title={t('profile.title')}
                    description={t('profile.avatar_hint')}
                />
                <SurfaceCard className="p-8 sm:p-10">
                    <div className="space-y-6">
                        {error ? <FeedbackBanner tone="danger">{error}</FeedbackBanner> : null}
                        {success ? <FeedbackBanner tone="success">{success}</FeedbackBanner> : null}

                        <div className="flex flex-col items-start space-y-4">
                            <label className="text-sm font-medium t-secondary">{t('profile.avatar')}</label>
                            <div className="w-full max-w-xl">
                                <ImageUploadInput
                                    value={avatar}
                                    onChange={(value) => {
                                        setError('');
                                        setAvatar(value);
                                    }}
                                    onError={setError}
                                    disabled={isLoading}
                                    shape="circle"
                                    maxFileSize={2 * 1024 * 1024}
                                    placeholder={t('upload.image.url_placeholder')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium t-secondary">{t('profile.username')}</label>
                            <Input
                                value={username}
                                setValue={setUsername}
                                placeholder={t('profile.username_placeholder')}
                                disabled={isLoading}
                                className="rounded-2xl py-3"
                            />
                        </div>

                        <div className="pt-2">
                            <ButtonWithLoading
                                title={isLoading ? t('profile.saving') : t('profile.save')}
                                onClick={handleSubmit}
                                loading={isLoading}
                            />
                        </div>
                    </div>
                </SurfaceCard>
            </div>
        </PageShell>
    );
}
