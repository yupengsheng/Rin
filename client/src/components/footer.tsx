import { useContext, useEffect, useRef, useState } from 'react';
import Popup from 'reactjs-popup';
import { useLocation } from 'wouter';
import { ClientConfigContext } from '../state/config';
import { Helmet } from "react-helmet";
import { siteName } from '../utils/constants';
import { useTranslation } from "react-i18next";
import { buildLoginPath, HIDDEN_LOGIN_REDIRECT } from "../utils/auth-redirect";
import { SurfaceCard } from './public-ui';

type ThemeMode = 'light' | 'dark' | 'system';
function Footer() {
    const { t } = useTranslation()
    const [, setLocation] = useLocation()
    const [modeState, setModeState] = useState<ThemeMode>('system');
    const config = useContext(ClientConfigContext);
    const footerHtml = config.get<string>('footer');
    const footerHtmlRef = useRef<HTMLDivElement | null>(null);
    const mountedScriptNodesRef = useRef<HTMLScriptElement[]>([]);
    const loginEnabled = config.getBoolean('login.enabled');
    const [doubleClickTimes, setDoubleClickTimes] = useState(0);
    useEffect(() => {
        const mode = localStorage.getItem('theme') as ThemeMode || 'system';
        setModeState(mode);
        setMode(mode);
    }, [])

    useEffect(() => {
        const container = footerHtmlRef.current;
        if (!container) {
            return;
        }

        mountedScriptNodesRef.current.forEach((script) => script.remove());
        mountedScriptNodesRef.current = [];
        container.replaceChildren();

        if (!footerHtml) {
            return;
        }

        const template = document.createElement('template');
        template.innerHTML = footerHtml;

        const scripts = Array.from(template.content.querySelectorAll('script'));
        scripts.forEach((script) => script.remove());

        container.appendChild(template.content.cloneNode(true));

        scripts.forEach((script) => {
            const nextScript = document.createElement('script');

            Array.from(script.attributes).forEach((attribute) => {
                nextScript.setAttribute(attribute.name, attribute.value);
            });

            nextScript.textContent = script.textContent;
            container.appendChild(nextScript);
            mountedScriptNodesRef.current.push(nextScript);
        });

        return () => {
            mountedScriptNodesRef.current.forEach((script) => script.remove());
            mountedScriptNodesRef.current = [];
        };
    }, [footerHtml])

    const setMode = (mode: ThemeMode) => {
        setModeState(mode);
        localStorage.setItem('theme', mode);


        if (mode !== 'system' || (!('theme' in localStorage) && window.matchMedia(`(prefers-color-scheme: ${mode})`).matches)) {
            document.documentElement.setAttribute('data-color-mode', mode);
        } else {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            if (mediaQuery.matches) {
                document.documentElement.setAttribute('data-color-mode', 'dark');
            } else {
                document.documentElement.setAttribute('data-color-mode', 'light');
            }
        }
        window.dispatchEvent(new Event("colorSchemeChange"));
    };

    return (
        <footer>
            <Helmet>
                <link rel="alternate" type="application/rss+xml" title={siteName} href="/rss.xml" />
                <link rel="alternate" type="application/atom+xml" title={siteName} href="/atom.xml" />
                <link rel="alternate" type="application/json" title={siteName} href="/rss.json" />
            </Helmet>
            <div className="mx-auto mb-8 mt-10 w-full max-w-5xl px-4 ani-show">
                <SurfaceCard className="p-5 sm:p-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center t-primary">
                        <div ref={footerHtmlRef} />
                        <p className='text-sm text-neutral-500 font-normal link-line'>
                            <span onDoubleClick={() => {
                                if(doubleClickTimes >= 2){ // actually need 3 times doubleClick
                                    setDoubleClickTimes(0)
                                    if(!loginEnabled) {
                                        setLocation(buildLoginPath(HIDDEN_LOGIN_REDIRECT))
                                    }
                                } else {
                                    setDoubleClickTimes(doubleClickTimes + 1)
                                }
                            }}>
                                © {new Date().getFullYear()} Powered by <a className='hover:underline' href="https://github.com/openRin/Rin" target="_blank">Rin</a>
                            </span>
                            {config.getBoolean('rss') && <>
                                <Spliter />
                                <Popup trigger={
                                    <button className="hover:underline" type="button">
                                        RSS
                                    </button>
                                }
                                    position="top center"
                                    arrow={false}
                                    closeOnDocumentClick>
                                    <div className="min-w-52 rounded-2xl border border-black/10 bg-w p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] dark:border-white/10">
                                        <p className='font-bold t-primary'>
                                            {t('footer.rss')}
                                        </p>
                                        <p className="mt-2 text-sm t-secondary link-line">
                                            <a href='/rss.xml'>
                                                RSS
                                            </a> <Spliter />
                                            <a href='/atom.xml'>
                                                Atom
                                            </a> <Spliter />
                                            <a href='/rss.json'>
                                                JSON
                                            </a>
                                        </p>
                                    </div>
                                </Popup>
                            </>}
                        </p>
                        <div className="inline-flex rounded-full border border-zinc-200 bg-black/[0.02] p-[3px] dark:border-zinc-700 dark:bg-white/[0.03]">
                            <ThemeButton mode='light' current={modeState} label="Toggle light mode" icon="ri-sun-line" onClick={setMode} />
                            <ThemeButton mode='system' current={modeState} label="Toggle system mode" icon="ri-computer-line" onClick={setMode} />
                            <ThemeButton mode='dark' current={modeState} label="Toggle dark mode" icon="ri-moon-line" onClick={setMode} />
                        </div>
                    </div>
                </SurfaceCard>
            </div>
        </footer>
    );
}

function Spliter() {
    return (<span className='px-1'>
        |
    </span>
    )
}

function ThemeButton({ current, mode, label, icon, onClick }: { current: ThemeMode, label: string, mode: ThemeMode, icon: string, onClick: (mode: ThemeMode) => void }) {
    return (<button aria-label={label} type="button" onClick={() => onClick(mode)}
        className={`rounded-inherit inline-flex h-[32px] w-[32px] items-center justify-center border-0 t-primary transition-colors ${current === mode ? "bg-w rounded-full shadow-xl shadow-light" : "hover:bg-black/5 dark:hover:bg-white/10"}`}>
        <i className={`${icon}`} />
    </button>)
}

export default Footer;
