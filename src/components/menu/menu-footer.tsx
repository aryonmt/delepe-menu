import { Instagram, Phone } from "lucide-react";
import { strings } from "@/lib/fa/strings";
import {
  VENUE_INSTAGRAM_HANDLE,
  venueInstagramHref,
  venuePhoneHref,
  venuePhoneLabel,
} from "@/lib/venue-contact";

const linkClass =
  "inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-fast hover:text-primary";

export function MenuFooter() {
  return (
    <footer className="relative z-10 flex flex-col items-center gap-3 border-t border-line py-10 text-center">
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary/60" />
        <span className="flex gap-1">
          {[0, 1, 2].map((index) => (
            <span key={index} className="h-2 w-0.5 rotate-[18deg] rounded-full bg-primary/80" />
          ))}
        </span>
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary/60" />
      </div>
      <nav className="flex flex-col items-center gap-2" aria-label={strings.public.contactNav}>
        <a
          className={linkClass}
          href={venueInstagramHref()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={strings.public.instagram}
        >
          <Instagram className="h-3.5 w-3.5" aria-hidden="true" />
          <span dir="ltr">@{VENUE_INSTAGRAM_HANDLE}</span>
        </a>
        <a className={linkClass} href={venuePhoneHref()} aria-label={strings.public.phone}>
          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
          <span dir="ltr">{venuePhoneLabel()}</span>
        </a>
      </nav>
      <span className="font-display text-xs text-muted-foreground">{strings.public.footer}</span>
      <span
        dir="ltr"
        className="text-[10px] tracking-[0.18em] text-muted-foreground/45"
      >
        {strings.public.makerCredit}
      </span>
    </footer>
  );
}
