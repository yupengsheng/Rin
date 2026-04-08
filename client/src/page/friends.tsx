import i18next from "i18next";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Helmet } from 'react-helmet';
import { useTranslation } from "react-i18next";
import { SearchableSelect } from "@rin/ui";
import { Button } from "../components/button";
import { ShowAlertType, useAlert, useConfirm } from "../components/dialog";
import { Input } from "../components/input";
import { Waiting } from "../components/loading";
import { EmptyState, ModalSurface, PageIntro, PageShell, SurfaceCard } from "../components/public-ui";
import { client } from "../app/runtime";
import { ClientConfigContext } from "../state/config";
import { ProfileContext } from "../state/profile";

import { useSiteConfig } from "../hooks/useSiteConfig";
import { siteName } from "../utils/constants";


type FriendItem = {
    name: string;
    id: number;
    uid: number;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
    desc: string | null;
    url: string;
    accepted: number;
    health: string;
    sort_order?: number;
};

async function publish({ name, avatar, desc, url, showAlert }: { name: string, avatar: string, desc: string, url: string, showAlert: ShowAlertType }) {
    const t = i18next.t
    const { error } = await client.friend.create({
        avatar,
        name,
        desc,
        url
    })
    if (error) {
        showAlert(error.value as string)
    } else {
        showAlert(t('create.success'), () => {
            window.location.reload()
        })
    }
}

export function FriendsPage() {
    const { t } = useTranslation()
    const siteConfig = useSiteConfig();
    const config = useContext(ClientConfigContext)
    let [apply] = useState<FriendItem>()
    const [name, setName] = useState("")
    const [desc, setDesc] = useState("")
    const [avatar, setAvatar] = useState("")
    const [url, setUrl] = useState("")
    const profile = useContext(ProfileContext);
    const [friendsAvailable, setFriendsAvailable] = useState<FriendItem[]>([])
    const [waitList, setWaitList] = useState<FriendItem[]>([])
    const [refusedList, setRefusedList] = useState<FriendItem[]>([])
    const [friendsUnavailable, setFriendsUnavailable] = useState<FriendItem[]>([])
    const [status, setStatus] = useState<'idle' | 'loading'>('loading')
    const ref = useRef(false)
    const { showAlert, AlertUI } = useAlert()
    const totalFriends =
        friendsAvailable.length +
        friendsUnavailable.length +
        waitList.length +
        refusedList.length +
        (apply ? 1 : 0)
    useEffect(() => {
        if (ref.current) return
        client.friend.list().then(({ data }) => {
            if (data) {
                const friend_list = data.friend_list || []
                const friends_available = friend_list.filter(({ health, accepted }: any) => health.length === 0 && accepted === 1) || []
                setFriendsAvailable(friends_available as any)
                const friends_unavailable = friend_list.filter(({ health, accepted }: any) => health.length > 0 && accepted === 1) || []
                setFriendsUnavailable(friends_unavailable as any)
                const waitList = friend_list.filter(({ accepted }: any) => accepted === 0) || []
                setWaitList(waitList as any)
                const refuesdList = friend_list.filter(({ accepted }: any) => accepted === -1) || []
                setRefusedList(refuesdList as any)
            }
            setStatus('idle')
        })
        ref.current = true
    }, [])
    function publishButton() {
        publish({ name, desc, avatar, url, showAlert })
    }
    return (<>
        <Helmet>
            <title>{`${t('friends.title')} - ${siteConfig.name}`}</title>
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={t('friends.title')} />
            <meta property="og:image" content={siteConfig.avatar} />
            <meta property="og:type" content="article" />
            <meta property="og:url" content={document.URL} />
        </Helmet>
        <Waiting for={friendsAvailable.length !== 0 || friendsUnavailable.length !== 0 || status === "idle"}>
            <PageShell className="ani-show">
                <div className="mx-auto w-full max-w-5xl space-y-6 t-primary">
                    <PageIntro
                        eyebrow={t('friends.title')}
                        title={t('friends.title')}
                        description={t('article.total$count', { count: totalFriends })}
                    />

                    <FriendList title={t('friends.title')} friends={friendsAvailable} />
                    <FriendList title={t('friends.left')} friends={friendsUnavailable} />
                    <FriendList title={t('friends.review.waiting')} friends={waitList} />
                    <FriendList title={t('friends.review.rejected')} friends={refusedList} />
                    {profile?.permission !== true && apply !== undefined ? <FriendList title={t('friends.my_apply')} friends={apply ? [apply] : []} /> : null}

                    {totalFriends === 0 ? (
                        <EmptyState
                            title={t("friends.empty_title")}
                            description={t("friends.empty_description")}
                        />
                    ) : null}

                    {profile && (profile.permission || config.get("friend_apply_enable")) &&
                        <SurfaceCard className="p-6 sm:p-8">
                            <div className="max-w-2xl space-y-5">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-theme/75">
                                        {profile.permission ? t('friends.create') : t('friends.apply')}
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] t-primary">
                                        {profile.permission ? t('friends.create') : t('friends.apply')}
                                    </h2>
                                </div>
                                <div className="grid gap-3">
                                    <Input value={name} setValue={setName} placeholder={t('sitename')} variant="flat" className="rounded-2xl py-3" />
                                    <Input value={desc} setValue={setDesc} placeholder={t('description')} variant="flat" className="rounded-2xl py-3" />
                                    <Input value={avatar} setValue={setAvatar} placeholder={t('avatar.url')} variant="flat" className="rounded-2xl py-3" />
                                    <Input value={url} setValue={setUrl} placeholder={t('url')} variant="flat" className="rounded-2xl py-3" />
                                </div>
                                <div className='flex justify-end'>
                                    <Button onClick={publishButton} title={t('create.title')} />
                                </div>
                            </div>
                        </SurfaceCard>
                    }
                </div>
            </PageShell>
        </Waiting>
        <AlertUI />
    </>)
}

function FriendList({ title, friends }: { title: string, friends: FriendItem[] }) {
    if (!friends.length) return null;
    return (
        <SurfaceCard className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-[-0.02em] t-primary">{title}</h2>
                <span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-semibold t-secondary dark:bg-white/[0.06]">
                    {friends.length}
                </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {friends.map((friend) => (
                    <Friend key={friend.id} friend={friend} />
                ))}
            </div>
        </SurfaceCard>
    )
}

function Friend({ friend }: { friend: FriendItem }) {
    const { t } = useTranslation()
    const profile = useContext(ProfileContext)
    const [avatar, setAvatar] = useState(friend.avatar)
    const [name, setName] = useState(friend.name)
    const [desc, setDesc] = useState(friend.desc || "")
    const [url, setUrl] = useState(friend.url)
    const [status, setStatus] = useState(friend.accepted)
    const [sortOrder, setSortOrder] = useState(friend.sort_order || 0)
    const [modalIsOpen, setIsOpen] = useState(false);
    const { showConfirm, ConfirmUI } = useConfirm()
    const { showAlert, AlertUI } = useAlert()

    const deleteFriend = useCallback(() => {
        showConfirm(
            t('delete.title'),
            t('delete.confirm'),
            () => {
                client.friend.delete(friend.id).then(({ error }) => {
                    if (error) {
                        showAlert(error.value as string)
                    } else {
                        showAlert(t('delete.success'), () => {
                            window.location.reload()
                        })
                    }
                })
            })
    }, [friend.id])

    const updateFriend = useCallback(() => {
        client.friend.update(friend.id, {
            avatar,
            name,
            desc,
            url,
            accepted: status,
            sort_order: sortOrder
        }).then(({ error }) => {
            if (error) {
                showAlert(error.value as string)
            } else {
                showAlert(t('update.success'), () => {
                    window.location.reload()
                })
            }
        })
    }, [avatar, name, desc, url, status, sortOrder])

    const statusOption = [
        { value: -1, label: t('friends.review.rejected') },
        { value: 0, label: t('friends.review.waiting') },
        { value: 1, label: t('friends.review.accepted') }
    ]
    return (
        <>
            <a
                title={friend.name}
                href={friend.url}
                target="_blank"
                className="group relative flex w-full flex-col gap-4 rounded-[24px] border border-black/10 bg-w p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-40px_rgba(15,23,42,0.45)] dark:border-white/10"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 overflow-hidden rounded-2xl border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]">
                            <img className={`h-full w-full object-cover ${friend.health.length > 0 ? "grayscale" : ""}`} src={friend.avatar} alt={friend.name} />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-base font-semibold t-primary group-hover:text-theme">{friend.name}</p>
                            {friend.accepted !== 1 ? (
                                <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.18em] ${friend.accepted === 0 ? "t-secondary" : "text-theme"}`}>
                                    {statusOption[friend.accepted + 1].label}
                                </p>
                            ) : null}
                        </div>
                    </div>
                    {(profile?.permission || profile?.id === friend.uid) ? (
                        <button
                            onClick={(e) => { e.preventDefault(); setIsOpen(true) }}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.04] t-secondary transition-colors hover:bg-black/[0.08] hover:text-neutral-900 dark:bg-white/[0.05] dark:hover:bg-white/10 dark:hover:text-white"
                            type="button"
                        >
                            <i className="ri-settings-line"></i>
                        </button>
                    ) : null}
                </div>
                {friend.health.length == 0 ? (
                    <p className="line-clamp-3 text-sm leading-6 t-secondary">{friend.desc}</p>
                ) : (
                    <p className="text-sm leading-6 text-gray-500">{errorHumanize(friend.health)}</p>
                )}
            </a>

            <ModalSurface isOpen={modalIsOpen} onRequestClose={() => setIsOpen(false)} maxWidth="34rem">
                <div className="relative flex w-full flex-col items-center justify-start">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
                        <img className={"h-full w-full object-cover rounded-xl " + (friend.health.length > 0 ? "grayscale" : "")} src={friend.avatar} alt={friend.name} />
                    </div>
                    {profile?.permission &&
                        <div className="mt-5 flex w-full flex-col items-start">
                            <div className="flex w-full flex-row items-center justify-between">
                                <div className="flex flex-col">
                                    <p className="text-lg dark:text-white">
                                        {t('status')}
                                    </p>
                                </div>
                                <div className="flex flex-row items-center justify-center space-x-4">
                                    <SearchableSelect
                                        value={String(status)}
                                        onChange={(nextValue) => {
                                            const parsed = Number(nextValue)
                                            if (!Number.isNaN(parsed)) {
                                                setStatus(parsed)
                                            }
                                        }}
                                        options={statusOption.map((option) => ({
                                            label: option.label,
                                            value: String(option.value),
                                        }))}
                                        placeholder={t('status')}
                                        searchPlaceholder={t('status')}
                                    />
                                </div>
                            </div>
                            <div className="mt-3 flex w-full flex-row items-center justify-between gap-4">
                                <div className="flex flex-col">
                                    <p className="text-lg dark:text-white">
                                        {t('sort_order')}
                                    </p>
                                </div>
                                <div className="flex flex-row items-center justify-center space-x-4">
                                    <Input value={sortOrder.toString()} setValue={(val) => setSortOrder(parseInt(val) || 0)} placeholder={t('sort_order')} variant="flat" className="rounded-2xl" />
                                </div>
                            </div>
                        </div>
                    }
                    <div className="mt-5 grid w-full gap-3">
                        <Input value={name} setValue={setName} placeholder={t('sitename')} variant="flat" className="rounded-2xl py-3" />
                        <Input value={desc} setValue={setDesc} placeholder={t('description')} variant="flat" className="rounded-2xl py-3" />
                        <Input value={avatar} setValue={setAvatar} placeholder={t('avatar.url')} variant="flat" className="rounded-2xl py-3" />
                        <Input value={url} setValue={setUrl} placeholder={t('url')} variant="flat" className="rounded-2xl py-3" />
                    </div>
                    <div className='mt-5 flex w-full justify-end space-x-2'>
                        <Button secondary onClick={deleteFriend} title={t('delete.title')} />
                        <Button onClick={updateFriend} title={t('save')} />
                    </div>
                </div>
            </ModalSurface>
            <ConfirmUI />
            <AlertUI />
        </>
    )
}

function errorHumanize(error: string) {
    if (error === "certificate has expired" || error == "526") {
        return "证书已过期"
    } else if (error.includes("Unable to connect") || error == "521" || error == "522") {
        return "无法访问"
    }
    return error
}
