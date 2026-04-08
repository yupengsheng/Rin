import Lightbox, { type SlideImage } from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Download from "yet-another-react-lightbox/plugins/download";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

export function MarkdownLightbox({
  index,
  slides,
  onClose,
}: {
  index: number;
  slides: SlideImage[] | undefined;
  onClose: () => void;
}) {
  return (
    <Lightbox
      plugins={[Download, Zoom, Counter]}
      index={index}
      slides={slides}
      open={index >= 0}
      close={onClose}
    />
  );
}
