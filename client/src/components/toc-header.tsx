import { useState } from "react";
import { ModalSurface } from "./public-ui";

export function TOCHeader({ TOC }: { TOC: () => JSX.Element }) {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div className="shrink-0 lg:hidden">
      <button
        onClick={() => setIsOpened(true)}
        className="flex h-10 w-10 flex-row items-center justify-center rounded-full"
        type="button"
      >
        <i className="ri-menu-2-line ri-lg text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 md:ri-sm md:t-secondary"></i>
      </button>
      <ModalSurface isOpen={isOpened} onRequestClose={() => setIsOpened(false)} maxWidth="40rem" className="p-0">
        <div className="relative w-[80vw] overflow-clip t-primary sm:w-[60vw] lg:w-[40vw]">
          <TOC />
        </div>
      </ModalSurface>
    </div>
  );
}
