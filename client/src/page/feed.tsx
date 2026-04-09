import type { Comment as ApiComment, CreateCommentRequest, Feed } from "@rin/api";
import { useContext, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import Popup from "reactjs-popup";
import { Link, useLocation } from "wouter";
import { useAlert, useConfirm } from "../components/dialog";
import { HashTag } from "../components/hashtag";
import { Waiting } from "../components/loading";
import { Markdown } from "../components/markdown";
import { client } from "../app/runtime";
import { ClientConfigContext } from "../state/config";
import { ProfileContext } from "../state/profile";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { siteName } from "../utils/constants";
import { timeago } from "../utils/timeago";
import { Button } from "../components/button";
import { Tips } from "../components/tips";
import { AdjacentSection } from "../components/adjacent_feed.tsx";
import { stripImageUrlMetadata } from "../utils/image-upload";
import { renderMermaidNodes } from "../utils/mermaid-runtime";

function extractFirstMarkdownImageUrl(content: string) {
  const match = /!\[.*?\]\((\S+?)(?:\s+"[^"]*")?\)/.exec(content);
  if (!match) {
    return undefined;
  }

  return stripImageUrlMetadata(match[1]);
}

export function FeedPage({ id, TOC, clean }: { id: string, TOC: () => JSX.Element, clean: (id: string) => void }) {
  const { t } = useTranslation();
  const siteConfig = useSiteConfig();
  const profile = useContext(ProfileContext);
  const [feed, setFeed] = useState<Feed>();
  const [error, setError] = useState<string>();
  const [headImage, setHeadImage] = useState<string>();
  const ref = useRef("");
  const [, setLocation] = useLocation();
  const { showAlert, AlertUI } = useAlert();
  const { showConfirm, ConfirmUI } = useConfirm();
  const [top, setTop] = useState<number>(0);
  const config = useContext(ClientConfigContext);
  const counterEnabled = config.getBoolean('counter.enabled');
  function deleteFeed() {
    // Confirm
    showConfirm(
      t("article.delete.title"),
      t("article.delete.confirm"),
      () => {
        if (!feed) return;
        client.feed
          .delete(feed.id)
          .then(({ error }) => {
            if (error) {
              showAlert(error.value as string);
            } else {
              showAlert(t("delete.success"));
              setLocation("/");
            }
          });
      })
  }
  function topFeed() {
    const isUnTop = !(top > 0)
    const topNew = isUnTop ? 1 : 0;
    // Confirm
    showConfirm(
      isUnTop ? t("article.top.title") : t("article.untop.title"),
      isUnTop ? t("article.top.confirm") : t("article.untop.confirm"),
      () => {
        if (!feed) return;
        client.feed
          .setTop(feed.id, topNew)
          .then(({ error }) => {
            if (error) {
              showAlert(error.value as string);
            } else {
              showAlert(isUnTop ? t("article.top.success") : t("article.untop.success"));
              setTop(topNew);
            }
          });
      })
  }
  useEffect(() => {
    if (ref.current == id) return;
    setFeed(undefined);
    setError(undefined);
    setHeadImage(undefined);
    client.feed
      .get(id)
      .then(({ data, error }) => {
        if (error) {
          setError(error.value as string);
        } else if (data && typeof data !== "string") {
          setTimeout(() => {
            setFeed(data as any);
            setTop(data.top || 0);
            const headImageUrl = extractFirstMarkdownImageUrl(data.content);
            if (headImageUrl) {
              setHeadImage(headImageUrl);
            }
            clean(id);
          }, 0);
        }
      });
    ref.current = id;
  }, [id]);
  useEffect(() => {
    void renderMermaidNodes();
  }, [feed?.id, feed?.content]);

  return (
    <Waiting for={feed || error}>
      {feed && (
        <Helmet>
          <title>{`${feed.title ?? "Unnamed"} - ${siteConfig.name}`}</title>
          <meta property="og:site_name" content={siteName} />
          <meta property="og:title" content={feed.title ?? ""} />
          <meta property="og:image" content={headImage ?? siteConfig.avatar} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={document.URL} />
          <meta
            name="og:description"
            content={
              feed.content.length > 200
                ? feed.content.substring(0, 200)
                : feed.content
            }
          />
          <meta name="author" content={feed.user.username} />
          <meta
            name="keywords"
            content={feed.hashtags.map(({ name }) => name).join(", ")}
          />
          <meta
            name="description"
            content={
              feed.content.length > 200
                ? feed.content.substring(0, 200)
                : feed.content
            }
          />
        </Helmet>
      )}
      <div className="w-full ani-show">
        {error && (
          <>
            <div className="flex flex-col wauto rounded-2xl bg-w m-2 p-6 items-center justify-center space-y-2">
              <h1 className="text-xl font-bold t-primary">{error}</h1>
              {error === "Not found" && id === "about" && (
                <Tips value={t("about.notfound")} />
              )}
              <Button
                title={t("index.back")}
                onClick={() => (window.location.href = "/")}
              />
            </div>
          </>
        )}
        {feed && !error && (
          <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 px-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start xl:px-6">
            <main className="min-w-0">
              <article
                className="m-2 rounded-[36px] bg-w px-7 py-6 shadow-[0_34px_92px_-60px_rgba(73,101,133,0.34)]"
                aria-label={feed.title ?? "Unnamed"}
              >
                <div className="flex justify-between gap-6">
                  <div>
                    <div className="mt-1 mb-2 flex flex-wrap gap-2">
                      <p
                        className="text-slate-400 text-[12px] font-medium uppercase tracking-[0.16em]"
                        title={new Date(feed.createdAt).toLocaleString()}
                      >
                        {t("feed_card.published$time", {
                          time: timeago(feed.createdAt),
                        })}
                      </p>

                      {feed.createdAt !== feed.updatedAt && (
                        <p
                          className="text-slate-400 text-[12px] font-medium uppercase tracking-[0.16em]"
                          title={new Date(feed.updatedAt).toLocaleString()}
                        >
                          {t("feed_card.updated$time", {
                            time: timeago(feed.updatedAt),
                          })}
                        </p>
                      )}
                    </div>
                    {counterEnabled && <p className='text-[12px] text-slate-400 font-medium uppercase tracking-[0.16em] link-line'>
                      <span> {t("count.pv")} </span>
                      <span>
                        {feed.pv}
                      </span>
                      <span> |</span>
                      <span> {t("count.uv")} </span>
                      <span>
                        {feed.uv}
                      </span>
                    </p>}
                    <div className="flex flex-row items-center">
                      <h1 className="text-[2.55rem] font-semibold tracking-[-0.05em] t-primary break-all">
                        {feed.title}
                      </h1>
                      <div className="flex-1 w-0" />
                    </div>
                  </div>
                  <div className="pt-2">
                    {profile?.permission && (
                      <div className="flex gap-2">
                        <button
                          aria-label={top > 0 ? t("untop.title") : t("top.title")}
                          onClick={topFeed}
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
                            top > 0
                              ? "bg-theme text-white shadow-lg shadow-theme/20 hover:bg-theme-hover active:bg-theme-active"
                              : "bg-black/[0.04] t-secondary hover:bg-black/[0.08] hover:text-neutral-900 dark:bg-white/[0.05] dark:hover:bg-white/10 dark:hover:text-white"
                          }`}
                          type="button"
                        >
                          <i className="ri-skip-up-line" />
                        </button>
                        <Link
                          aria-label={t("edit")}
                          href={`/admin/writing/${feed.id}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.04] t-secondary transition-colors hover:bg-black/[0.08] hover:text-neutral-900 dark:bg-white/[0.05] dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <i className="ri-edit-2-line" />
                        </Link>
                        <button
                          aria-label={t("delete.title")}
                          onClick={deleteFeed}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.04] transition-colors hover:bg-rose-500/10 dark:bg-white/[0.05] dark:hover:bg-rose-500/10"
                          type="button"
                        >
                          <i className="ri-delete-bin-7-line text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 h-px bg-[linear-gradient(90deg,rgba(148,163,184,0.08),rgba(148,163,184,0.46),rgba(148,163,184,0.08))]" />
                <Markdown content={feed.content} />
                {feed.hashtags.length > 0 && (
                  <div className="mt-8 flex flex-row flex-wrap gap-x-2 gap-y-2">
                    {feed.hashtags.map(({ name }, index) => (
                      <HashTag key={index} name={name} />
                    ))}
                  </div>
                )}
              </article>
              <AdjacentSection id={id} setError={setError} />
              {feed && <Comments id={`${feed.id}`} />}
              <div className="h-16" />
            </main>
            <aside className="relative hidden xl:block">
              <div className="sticky top-[5.5rem]">
                <TOC />
              </div>
            </aside>
          </div>
        )}
      </div>
      <AlertUI />
      <ConfirmUI />
    </Waiting>
  );
}

function normalizeCommentError(error: string, t: ReturnType<typeof useTranslation>["t"]) {
  if (error === "Content is required") return t("comment.empty");
  if (error === "Author name is required") return t("comment.author_name_required");
  if (error === "Author email is required") return t("comment.author_email_required");
  if (error === "Parent comment not found") return t("comment.reply.not_found");
  if (error === "Parent comment does not belong to this feed") return t("comment.reply.invalid");
  return error;
}

function CommentInput({
  id,
  onRefresh,
  replyTarget,
  onCancelReply,
}: {
  id: string;
  onRefresh: () => void;
  replyTarget: ApiComment | null;
  onCancelReply: () => void;
}) {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorUrl, setAuthorUrl] = useState("");
  const [rememberInfo, setRememberInfo] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const storageKey = "rin_comment_author_info";
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmedContent = content.trim();
  const trimmedAuthorName = authorName.trim();
  const trimmedAuthorEmail = authorEmail.trim();
  const trimmedAuthorUrl = authorUrl.trim();
  const isFormComplete = Boolean(trimmedContent && trimmedAuthorName && trimmedAuthorEmail);
  const canSubmit = isFormComplete && !isSubmitting;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        authorName?: string;
        authorEmail?: string;
        authorUrl?: string;
      };
      setAuthorName(parsed.authorName || "");
      setAuthorEmail(parsed.authorEmail || "");
      setAuthorUrl(parsed.authorUrl || "");
      setRememberInfo(Boolean(parsed.authorName || parsed.authorEmail || parsed.authorUrl));
    } catch {}
  }, []);

  useEffect(() => {
    if (!replyTarget) return;
    requestAnimationFrame(() => {
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      textareaRef.current?.focus();
    });
  }, [replyTarget?.id]);

  function clearFeedback() {
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  }

  function submit() {
    if (isSubmitting) return;
    if (!trimmedContent) {
      setSuccessMessage("");
      setError(t("comment.empty"));
      textareaRef.current?.focus();
      return;
    }
    if (!trimmedAuthorName) {
      setSuccessMessage("");
      setError(t("comment.author_name_required"));
      return;
    }
    if (!trimmedAuthorEmail) {
      setSuccessMessage("");
      setError(t("comment.author_email_required"));
      return;
    }

    const payload: CreateCommentRequest = {
      content: trimmedContent,
      authorName: trimmedAuthorName,
      authorEmail: trimmedAuthorEmail,
      authorUrl: trimmedAuthorUrl || undefined,
      parentId: replyTarget?.id,
    };

    if (rememberInfo) {
      localStorage.setItem(storageKey, JSON.stringify({
        authorName: trimmedAuthorName,
        authorEmail: trimmedAuthorEmail,
        authorUrl: trimmedAuthorUrl,
      }));
    } else {
      localStorage.removeItem(storageKey);
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    client.comment.create(parseInt(id), payload).then(({ error }) => {
      if (error) {
        setSuccessMessage("");
        setError(normalizeCommentError(error.value as string, t));
      } else {
        setContent("");
        setError("");
        setSuccessMessage(t("comment.success"));
        onCancelReply();
        onRefresh();
        textareaRef.current?.focus();
      }
    }).finally(() => {
      setIsSubmitting(false);
    });
  }

  return (
    <div
      ref={containerRef}
      className="w-full rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(243,248,253,0.88))] p-6 t-primary shadow-[0_34px_94px_-60px_rgba(73,101,133,0.34)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.78),rgba(30,41,59,0.78))] dark:shadow-[0_34px_94px_-58px_rgba(2,6,23,0.84)]"
    >
      <div className="mb-7 flex items-center gap-4">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border border-theme/20 bg-theme/10 text-theme shadow-[0_16px_32px_-24px_rgba(73,101,133,0.4)]">
          <i className="ri-chat-3-line text-base" />
        </span>
        <div className="min-w-0">
          <label htmlFor="comment" className="text-[2rem] font-semibold tracking-[-0.045em]">{t("comment.form.title")}</label>
          <p className="mt-1 text-[14px] leading-6 t-secondary">{t("comment.form.desc")}</p>
        </div>
      </div>
      {successMessage ? (
        <div className="mb-5 rounded-[22px] border border-emerald-200/70 bg-[rgba(241,252,248,0.92)] px-4 py-3 text-sm text-emerald-700 shadow-[0_18px_40px_-30px_rgba(16,185,129,0.24)] dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200" aria-live="polite">
          {successMessage}
        </div>
      ) : null}
      {error ? (
        <div className="mb-5 rounded-[22px] border border-red-200/70 bg-[rgba(255,244,244,0.92)] px-4 py-3 text-sm text-red-700 shadow-[0_18px_40px_-30px_rgba(225,29,72,0.22)] dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200" aria-live="polite">
          {error}
        </div>
      ) : null}
      {replyTarget ? (
        <div className="mb-5 w-full rounded-[24px] border border-theme/20 bg-[linear-gradient(180deg,rgba(var(--theme-rgb),0.08),rgba(255,255,255,0.36))] px-4 py-3 shadow-[0_18px_38px_-30px_rgba(73,101,133,0.22)] dark:border-theme/25 dark:bg-theme/10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-[-0.01em] text-theme">
                {t("comment.reply.replying_to$name", { name: replyTarget.author.name })}
              </p>
              <p className="mt-1 truncate text-sm leading-6 t-secondary">{replyTarget.content}</p>
            </div>
            <button
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm t-secondary transition-colors hover:bg-black/5 hover:text-neutral-900 dark:hover:bg-white/10 dark:hover:text-white"
              onClick={onCancelReply}
              type="button"
            >
              <i className="ri-close-line" />
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <label htmlFor="comment" className="flex items-center gap-2 text-[13px] font-semibold t-primary">
          <span>{t("comment.form.content")}</span>
          <span className="rounded-full bg-theme/10 px-2 py-0.5 text-[10px] font-semibold text-theme">{t("comment.form.required_label")}</span>
        </label>
        <textarea
          ref={textareaRef}
          id="comment"
          placeholder={t("comment.form.content_placeholder")}
          className="h-44 w-full rounded-[24px] border border-black/8 bg-[rgba(255,255,255,0.86)] px-4 py-3 text-sm leading-7 t-primary outline-none transition-all placeholder:text-neutral-400 focus:border-theme/40 focus:ring-4 focus:ring-theme/10 dark:border-white/10 dark:bg-[rgba(15,23,42,0.62)] dark:placeholder:text-neutral-500"
          value={content}
          disabled={isSubmitting}
          required
          onChange={(e) => {
            clearFeedback();
            setContent(e.target.value);
          }}
        />
      </div>
      <div className="mt-5 grid w-full gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[13px] font-semibold t-primary">
            <span>{t("comment.form.author_name")}</span>
            <span className="rounded-full bg-theme/10 px-2 py-0.5 text-[10px] font-semibold text-theme">{t("comment.form.required_label")}</span>
          </label>
          <input
            className="rounded-[22px] border border-black/8 bg-[rgba(255,255,255,0.86)] px-4 py-3 text-sm t-primary outline-none transition-all placeholder:text-neutral-400 focus:border-theme/40 focus:ring-4 focus:ring-theme/10 dark:border-white/10 dark:bg-[rgba(15,23,42,0.62)] dark:placeholder:text-neutral-500"
            value={authorName}
            autoComplete="name"
            disabled={isSubmitting}
            required
            onChange={(e) => {
              clearFeedback();
              setAuthorName(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[13px] font-semibold t-primary">
            <span>{t("comment.form.author_email")}</span>
            <span className="rounded-full bg-theme/10 px-2 py-0.5 text-[10px] font-semibold text-theme">{t("comment.form.required_label")}</span>
          </label>
          <input
            className="rounded-[22px] border border-black/8 bg-[rgba(255,255,255,0.86)] px-4 py-3 text-sm t-primary outline-none transition-all placeholder:text-neutral-400 focus:border-theme/40 focus:ring-4 focus:ring-theme/10 dark:border-white/10 dark:bg-[rgba(15,23,42,0.62)] dark:placeholder:text-neutral-500"
            value={authorEmail}
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            required
            placeholder={t("comment.form.author_email_placeholder")}
            onChange={(e) => {
              clearFeedback();
              setAuthorEmail(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="flex items-center gap-2 text-[13px] font-semibold t-primary">
            <span>{t("comment.form.author_url")}</span>
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold t-secondary dark:bg-white/10">{t("comment.form.optional_label")}</span>
          </label>
          <input
            className="rounded-[22px] border border-black/8 bg-[rgba(255,255,255,0.86)] px-4 py-3 text-sm t-primary outline-none transition-all placeholder:text-neutral-400 focus:border-theme/40 focus:ring-4 focus:ring-theme/10 dark:border-white/10 dark:bg-[rgba(15,23,42,0.62)] dark:placeholder:text-neutral-500"
            value={authorUrl}
            type="url"
            autoComplete="url"
            disabled={isSubmitting}
            onChange={(e) => {
              clearFeedback();
              setAuthorUrl(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="mt-6 flex w-full flex-col gap-4 border-t border-black/5 pt-5 dark:border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={rememberInfo}
                disabled={isSubmitting}
                onChange={(e) => setRememberInfo(e.target.checked)}
              />
              {t("comment.form.remember_me")}
            </label>
          </div>
          <div className="flex items-center justify-end gap-3">
            {replyTarget ? (
              <button
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm t-secondary transition-colors hover:bg-black/5 hover:text-neutral-900 dark:hover:bg-white/10 dark:hover:text-white"
                onClick={onCancelReply}
                type="button"
              >
                <i className="ri-arrow-go-back-line" />
                {t("cancel")}
              </button>
            ) : null}
            <button
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                canSubmit
                  ? "bg-theme text-white shadow-lg shadow-theme/20 hover:bg-theme-hover active:bg-theme-active"
                  : "cursor-not-allowed bg-neutral-200 text-neutral-400 dark:bg-white/10 dark:text-neutral-500"
              }`}
              disabled={!canSubmit}
              onClick={submit}
              type="button"
            >
              <i className={`${isSubmitting ? "ri-loader-4-line animate-spin" : "ri-send-plane-2-line"}`} />
              <span>{t("comment.submit")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Comments({ id }: { id: string }) {
  const config = useContext(ClientConfigContext);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [replyTarget, setReplyTarget] = useState<ApiComment | null>(null);
  const [error, setError] = useState<string>();
  const ref = useRef("");
  const { t } = useTranslation();

  function loadComments() {
    client.comment.list(parseInt(id)).then(({ data, error }) => {
      if (error) {
        setError(error.value as string);
      } else if (data && Array.isArray(data)) {
        setError(undefined);
        setComments(data as ApiComment[]);
      }
    });
  }

  useEffect(() => {
    if (ref.current == id) return;
    loadComments();
    ref.current = id;
  }, [id]);

  const rootComments = comments.filter((comment) => comment.parentId == null);
  const totalComments = comments.length;

  return (
    <>
      {config.getBoolean('comment.enabled') &&
        <section className="m-2 mt-8 w-full rounded-[36px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(238,245,251,0.9))] p-3 shadow-[0_34px_96px_-66px_rgba(73,101,133,0.32)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.8),rgba(30,41,59,0.78))] sm:p-4">
          <div className="mb-5 flex items-center justify-between gap-3 rounded-[28px] border border-black/5 bg-[rgba(245,249,253,0.76)] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] dark:border-white/10 dark:bg-white/[0.03]">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-theme/75">{t("comment.title")}</p>
              <p className="mt-1 text-sm leading-6 t-secondary">{t("comment.list.count$count", { count: totalComments })}</p>
            </div>
            <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-theme/20 bg-theme/10 px-3 text-sm font-semibold text-theme shadow-[0_14px_30px_-24px_rgba(73,101,133,0.34)]">
              {totalComments}
            </span>
          </div>
          <CommentInput id={id} onRefresh={loadComments} replyTarget={replyTarget} onCancelReply={() => setReplyTarget(null)} />
          {error && (
            <div className="mt-4 flex w-full flex-col items-start justify-center rounded-2xl border border-red-200/70 bg-red-50/80 p-6 text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
              <h1 className="text-xl font-bold">{error}</h1>
              <button className="mt-3 rounded-full bg-theme px-4 py-2 text-white" onClick={loadComments}>
                {t("reload")}
              </button>
            </div>
          )}
          {!error && (
            <div className="mt-5 w-full rounded-[28px] border border-black/5 bg-white/75 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-5">
              {rootComments.length > 0 ? (
                <div className="space-y-4">
                  {rootComments.map((comment) => (
                    <CommentThread
                      key={comment.id}
                      comment={comment}
                      replies={comments.filter((item) => item.parentId === comment.id)}
                      onRefresh={loadComments}
                      onReply={setReplyTarget}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-black/10 bg-gradient-to-b from-black/[0.015] to-transparent px-6 py-12 text-center dark:border-white/10 dark:from-white/[0.03] dark:to-transparent">
                  <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-theme/10 text-theme">
                    <i className="ri-chat-smile-3-line text-lg" />
                  </span>
                  <p className="mt-4 text-base font-medium t-primary">{t("comment.list.empty")}</p>
                </div>
              )}
            </div>
          )}
        </section>
      }
    </>
  );
}

function CommentThread({
  comment,
  replies,
  onRefresh,
  onReply,
}: {
  comment: ApiComment;
  replies: ApiComment[];
  onRefresh: () => void;
  onReply: (comment: ApiComment) => void;
}) {
  return (
    <div className="relative space-y-4 pl-4 before:absolute before:bottom-2 before:left-[7px] before:top-6 before:w-px before:bg-black/[0.08] dark:before:bg-white/10">
      <span className="absolute left-0 top-5 h-3.5 w-3.5 rounded-full border-2 border-white bg-theme shadow-[0_0_0_5px_rgba(111,143,179,0.12)] dark:border-dark" />
      <CommentItem comment={comment} onRefresh={onRefresh} onReply={onReply} />
      {replies.length > 0 ? (
        <div className="ml-3 space-y-3 border-l border-black/[0.08] pl-5 dark:border-white/10">
          {replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onRefresh={onRefresh} onReply={onReply} compact />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CommentItem({
  comment,
  onRefresh,
  onReply,
  compact = false,
}: {
  comment: ApiComment;
  onRefresh: () => void;
  onReply: (comment: ApiComment) => void;
  compact?: boolean;
}) {
  const { showConfirm, ConfirmUI } = useConfirm();
  const { showAlert, AlertUI } = useAlert();
  const { t } = useTranslation();
  const profile = useContext(ProfileContext);

  function deleteComment() {
    showConfirm(
      t("delete.comment.title"),
      t("delete.comment.confirm"),
      async () => {
        client.comment.delete(comment.id).then(({ error }) => {
          if (error) {
            showAlert(error.value as string);
          } else {
            showAlert(t("delete.success"), () => {
              onRefresh();
            });
          }
        });
      })
  }

  return (
    <div
      className={`rounded-[24px] border p-4 ${
        compact
          ? "border-black/5 bg-[rgba(241,246,251,0.72)] dark:border-white/10 dark:bg-white/[0.03]"
          : "border-black/8 bg-[rgba(255,255,255,0.82)] shadow-[0_24px_60px_-44px_rgba(73,101,133,0.24)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(15,23,42,0.58)]"
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          {comment.author.url ? (
            <a href={comment.author.url} target="_blank" rel="noreferrer" className="text-[15px] font-semibold tracking-[-0.01em] t-primary hover:text-theme hover:underline">
              {comment.author.name}
            </a>
          ) : (
            <span className="text-[15px] font-semibold tracking-[-0.01em] t-primary">{comment.author.name}</span>
          )}
          {comment.author.isAdmin ? (
            <span className="rounded-full bg-theme/10 px-2 py-0.5 text-xs font-medium text-theme">{t("admin.title")}</span>
          ) : null}
          <span className="hidden text-neutral-300 sm:inline">·</span>
          <span title={new Date(comment.createdAt).toLocaleString()} className="text-sm text-slate-400">
            {timeago(comment.createdAt)}
          </span>
        </div>
        {comment.replyTo ? (
          <blockquote className="rounded-[18px] border border-theme/20 bg-gradient-to-r from-theme/10 to-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-neutral-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-theme/20 dark:from-theme/10 dark:to-theme/5 dark:text-neutral-300">
            <p className="font-medium tracking-[-0.01em] t-primary">{t("comment.reply.quote$name", { name: comment.replyTo.authorName })}</p>
            <p className="mt-1 truncate leading-6">{comment.replyTo.contentPreview}</p>
          </blockquote>
        ) : null}
        <p className="break-words whitespace-pre-wrap text-[15px] leading-7 t-primary">{comment.content}</p>
        <div className="flex items-center justify-between gap-3 border-t border-black/5 pt-3 dark:border-white/10">
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm t-secondary transition-colors hover:bg-black/5 hover:text-neutral-900 dark:hover:bg-white/10 dark:hover:text-white"
              onClick={() => onReply(comment)}
              type="button"
            >
              <i className="ri-corner-down-left-line" />
              {t("comment.reply.button")}
            </button>
            {profile?.permission ? (
              <Popup
                arrow={false}
                trigger={
                  <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.04] t-secondary transition-colors hover:bg-black/[0.08] hover:text-neutral-900 dark:bg-white/[0.05] dark:hover:bg-white/10 dark:hover:text-white">
                    <i className="ri-more-fill"></i>
                  </button>
                }
                position="left center"
              >
                <div className="flex flex-row self-end mr-2">
                  <button type="button" onClick={deleteComment} aria-label={t("delete.comment.title")} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.04] t-secondary transition-colors hover:bg-black/[0.08] hover:text-neutral-900 dark:bg-white/[0.05] dark:hover:bg-white/10 dark:hover:text-white">
                    <i className="ri-delete-bin-2-line"></i>
                  </button>
                </div>
              </Popup>
            ) : null}
          </div>
        </div>
      </div>
      <ConfirmUI />
      <AlertUI />
    </div>
  );
}
