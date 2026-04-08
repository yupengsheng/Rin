import type { ReactNode } from "react";
import { Suspense, lazy, useContext, useEffect } from "react";
import type { DefaultParams, PathPattern } from "wouter";
import { Route, Switch, useLocation } from "wouter";
import { AdminLayout } from "../components/admin-layout";
import Footer from "../components/footer";
import { Header } from "../components/header";
import { Padding } from "../components/padding";
import { getHeaderLayoutDefinition } from "../components/site-header/layout-registry";
import { TOCHeader } from "../components/toc-header";
import { Waiting } from "../components/loading";
import useTableOfContents from "../hooks/useTableOfContents";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { ErrorPage } from "../page/error";
import { ProfileContext } from "../state/profile";
import { tryInt } from "../utils/int";
import { useTranslation } from "react-i18next";

const CallbackPage = lazy(() => import("../page/callback").then((module) => ({ default: module.CallbackPage })));
const CompatTasksPage = lazy(() => import("../page/compat-tasks").then((module) => ({ default: module.CompatTasksPage })));
const FeedPage = lazy(() => import("../page/feed").then((module) => ({ default: module.FeedPage })));
const FeedsPage = lazy(() => import("../page/feeds").then((module) => ({ default: module.FeedsPage })));
const FriendsPage = lazy(() => import("../page/friends").then((module) => ({ default: module.FriendsPage })));
const HealthPage = lazy(() => import("../page/health").then((module) => ({ default: module.HealthPage })));
const HashtagPage = lazy(() => import("../page/hashtag").then((module) => ({ default: module.HashtagPage })));
const HashtagsPage = lazy(() => import("../page/hashtags").then((module) => ({ default: module.HashtagsPage })));
const LoginPage = lazy(() => import("../page/login").then((module) => ({ default: module.LoginPage })));
const MomentsPage = lazy(() => import("../page/moments").then((module) => ({ default: module.MomentsPage })));
const QueueStatusPage = lazy(() => import("../page/queue-status").then((module) => ({ default: module.QueueStatusPage })));
const SearchPage = lazy(() => import("../page/search").then((module) => ({ default: module.SearchPage })));
const Settings = lazy(() => import("../page/settings").then((module) => ({ default: module.Settings })));
const TimelinePage = lazy(() => import("../page/timeline").then((module) => ({ default: module.TimelinePage })));
const WritingPage = lazy(() => import("../page/writing").then((module) => ({ default: module.WritingPage })));

export function AppRoutes() {
  const { t } = useTranslation();

  return (
    <Switch>
      <AppRoute path="/">
        <FeedsPage />
      </AppRoute>

      <AppRoute path="/timeline">
        <TimelinePage />
      </AppRoute>

      <AppRoute path="/moments">
        <MomentsPage />
      </AppRoute>

      <AppRoute path="/friends">
        <FriendsPage />
      </AppRoute>

      <AppRoute path="/hashtags">
        <HashtagsPage />
      </AppRoute>

      <AppRoute path="/hashtag/:name">
        {(params) => <HashtagPage name={params.name || ""} />}
      </AppRoute>

      <AppRoute path="/search/:keyword">
        {(params) => <SearchPage keyword={params.keyword || ""} />}
      </AppRoute>

      <AdminRoute path="/admin/settings" requirePermission title={t("settings.title")} description={t("admin.settings_description")}>
        <Settings />
      </AdminRoute>

      <AdminRoute path="/admin/health" requirePermission title={t("health.title")} description={t("admin.health_description")}>
        <HealthPage />
      </AdminRoute>

      <AdminRoute path="/admin/queue-status" requirePermission title={t("queue_status.title")} description={t("admin.queue_status_description")}>
        <QueueStatusPage />
      </AdminRoute>

      <AdminRoute path="/admin/compat-tasks" requirePermission title={t("compat_tasks.title")} description={t("admin.compat_tasks_description")}>
        <CompatTasksPage />
      </AdminRoute>

      <AdminRoute path="/admin/writing" requirePermission title={t("writing")} description={t("admin.writing_description")}>
        <WritingPage />
      </AdminRoute>

      <AdminRoute path="/admin/writing/:id" requirePermission title={t("writing")} description={t("admin.writing_description")}>
        {({ id }) => <WritingPage id={tryInt(0, id)} />}
      </AdminRoute>

      <AppRoute path="/callback">
        <CallbackPage />
      </AppRoute>

      <AppRoute path="/login">
        <LoginPage />
      </AppRoute>

      <AppRoute path="/profile">
        <SettingsRedirect />
      </AppRoute>

      <TocRoute path="/feed/:id">
        {(params, toc, cleanup) => <FeedPage id={params.id || ""} TOC={toc} clean={cleanup} />}
      </TocRoute>

      <TocRoute path="/:alias">
        {(params, toc, cleanup) => <FeedPage id={params.alias || ""} TOC={toc} clean={cleanup} />}
      </TocRoute>

      <AppRoute>
        <ErrorPage error={t("error.not_found")} />
      </AppRoute>
    </Switch>
  );
}

function SettingsRedirect() {
  const profile = useContext(ProfileContext);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (profile === undefined) {
      return;
    }

    setLocation(profile?.permission ? "/admin/settings" : "/login");
  }, [profile, setLocation]);

  return null;
}

function AppRoute({
  path,
  children,
  headerComponent,
  paddingClassName,
  requirePermission,
}: {
  path?: PathPattern;
  children: ReactNode | ((params: DefaultParams) => ReactNode);
  headerComponent?: ReactNode;
  paddingClassName?: string;
  requirePermission?: boolean;
}) {
  const profile = useContext(ProfileContext);
  const siteConfig = useSiteConfig();
  const { t } = useTranslation();

  const content =
    requirePermission && !profile?.permission ? <ErrorPage error={t("error.permission_denied")} /> : children;

  return (
    <Route path={path}>
      {(params) => {
        const resolvedContent = typeof content === "function" ? content(params) : content;
        const layoutDefinition = getHeaderLayoutDefinition(siteConfig.headerLayout);

        return layoutDefinition.renderRouteShell({
          header: <Header>{headerComponent}</Header>,
          content: (
            <Padding className={paddingClassName}>
              <Suspense fallback={<Waiting for={false} />}>{resolvedContent}</Suspense>
            </Padding>
          ),
          footer: <Footer />,
          paddingClassName,
        });
      }}
    </Route>
  );
}

function AdminRoute({
  path,
  children,
  requirePermission,
  title,
  description,
}: {
  path: PathPattern;
  children: ReactNode | ((params: DefaultParams) => ReactNode);
  requirePermission?: boolean;
  title: string;
  description: string;
}) {
  const profile = useContext(ProfileContext);
  const { t } = useTranslation();
  const content =
    requirePermission && !profile?.permission ? <ErrorPage error={t("error.permission_denied")} /> : children;

  return (
    <Route path={path}>
      {(params) => (
        <AdminLayout title={title} description={description}>
          <Suspense fallback={<Waiting for={false} />}>{typeof content === "function" ? content(params) : content}</Suspense>
        </AdminLayout>
      )}
    </Route>
  );
}

function TocRoute({
  path,
  children,
}: {
  path: PathPattern;
  children: (params: DefaultParams, toc: () => JSX.Element, cleanup: (id: string) => void) => ReactNode;
}) {
  const { TOC, cleanup } = useTableOfContents(".toc-content");

  return (
    <AppRoute path={path} headerComponent={TOCHeader({ TOC })} paddingClassName="mx-4">
      {(params) => children(params, TOC, cleanup)}
    </AppRoute>
  );
}
