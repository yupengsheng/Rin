import { useEffect, useRef, useState } from "react";
import Popup from "reactjs-popup";
import { useLocation } from "wouter";
import type { Profile } from "../../../state/profile";
import { LanguageSwitch, SearchButton, UserAvatar } from "./action-buttons";
import { NavBar } from "./nav-bar";

export function Menu({ profile }: { profile?: Profile | null }) {
  const [isOpen, setOpen] = useState(false);
  const [location] = useLocation();
  const previousOverflowRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (previousOverflowRef.current !== null) {
        document.body.style.overflow = previousOverflowRef.current;
        previousOverflowRef.current = null;
      }
      return;
    }

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflowRef.current ?? "";
      previousOverflowRef.current = null;
    };
  }, [isOpen]);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  function onClose() {
    setOpen(false);
  }

  return (
    <div className="visible md:hidden flex flex-row items-center">
      <Popup
        arrow={false}
        trigger={
        <div>
            <button onClick={() => setOpen(true)} className="flex h-10 w-10 flex-row items-center justify-center rounded-[16px] border border-black/8 bg-w text-neutral-500 shadow-[0_16px_36px_-26px_rgba(73,101,133,0.28)] backdrop-blur-xl transition-colors hover:text-neutral-900 dark:border-white/10 dark:text-neutral-400 dark:hover:text-neutral-100">
              <i className="ri-menu-line ri-lg" />
            </button>
          </div>
        }
        position="bottom right"
        open={isOpen}
        nested
        onClose={onClose}
        closeOnDocumentClick
        closeOnEscape
        overlayStyle={{ background: "rgba(0,0,0,0.3)" }}
      >
        <div className={`mt-4 flex w-[50vw] flex-col rounded-[28px] border border-black/8 bg-[rgba(255,255,255,0.92)] p-3 shadow-[0_24px_64px_-40px_rgba(73,101,133,0.34)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(15,23,42,0.88)] dark:shadow-[0_24px_64px_-36px_rgba(2,6,23,0.84)]`}>
          <div className="flex flex-row justify-end space-x-2">
            <SearchButton onClose={onClose} />
            <LanguageSwitch />
            <UserAvatar profile={profile} />
          </div>
          <NavBar menu={true} onClick={onClose} />
        </div>
      </Popup>
    </div>
  );
}
