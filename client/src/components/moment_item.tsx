import { useTranslation } from "react-i18next";
import { Markdown } from "./markdown";
import { timeago } from "../utils/timeago";

interface Moment {
    id: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: number;
        username: string;
        avatar: string;
    };
}

export function MomentItem({ 
    moment, 
    onDelete,
    onEdit,
    canManage
}: { 
    moment: Moment, 
    onDelete: (id: number) => void,
    onEdit: (moment: Moment) => void,
    canManage: boolean
}) {
    const { t } = useTranslation()
    const { createdAt, updatedAt } = moment;
    
    return (
        <div className="rounded-[24px] border border-black/10 bg-w p-5 shadow-[0_20px_45px_-40px_rgba(15,23,42,0.5)] dark:border-white/10">
            <div className="flex justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <img 
                        src={moment.user.avatar} 
                        alt={moment.user.username} 
                        className="h-10 w-10 rounded-2xl object-cover"
                    />
                    <div>
                        <p className="font-semibold t-primary">
                            {moment.user.username}
                        </p>
                        <p className="space-x-2 t-secondary text-sm"> 
                            <span title={new Date(createdAt).toLocaleString()}> 
                                {createdAt === updatedAt ? timeago(createdAt) : t('feed_card.published$time', { time: timeago(createdAt) })} 
                            </span> 
                            {createdAt !== updatedAt && 
                                <span title={new Date(updatedAt).toLocaleString()}> 
                                    {t('feed_card.updated$time', { time: timeago(updatedAt) })} 
                                </span> 
                            } 
                        </p>
                    </div>
                </div>
                {canManage && (
                    <div>
                        <div className="flex gap-2">
                            <button
                                aria-label={t("edit")}
                                onClick={() => onEdit(moment)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.04] t-secondary transition-colors hover:bg-black/[0.08] hover:text-neutral-900 dark:bg-white/[0.05] dark:hover:bg-white/10 dark:hover:text-white"
                            >
                                <i className="ri-edit-2-line" />
                            </button>
                            <button
                                aria-label={t("delete.title")}
                                onClick={() => onDelete(moment.id)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.04] transition-colors hover:bg-rose-500/10 dark:bg-white/[0.05] dark:hover:bg-rose-500/10"
                            >
                                <i className="ri-delete-bin-7-line text-red-500" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-4 border-t border-black/5 pt-4 text-black dark:border-white/10 dark:text-white">
                <Markdown content={moment.content} />
            </div>
        </div>
    )
}
