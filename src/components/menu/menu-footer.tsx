import { Instagram, Phone } from "lucide-react";
import { strings } from "@/lib/fa/strings";
import {
  VENUE_INSTAGRAM_HANDLE,
  VENUE_PHONES,
  venueInstagramHref,
  venuePhoneHref,
  venuePhoneLabel,
} from "@/lib/venue-contact";

const linkClass =
  "inline-flex items-center gap-2 text-card-title text-foreground transition-colors duration-fast hover:text-primary";

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
      <nav className="flex flex-col items-center gap-3" aria-label={strings.public.contactNav}>
        <a
          className={linkClass}
          href={venueInstagramHref()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={strings.public.instagram}
        >
          <Instagram className="h-4 w-4 text-primary" aria-hidden="true" />
          <span dir="ltr">@{VENUE_INSTAGRAM_HANDLE}</span>
        </a>
        {VENUE_PHONES.map((phone) => (
          <a
            key={phone.e164}
            className={linkClass}
            href={venuePhoneHref(phone)}
            aria-label={`${strings.public.phone} ${venuePhoneLabel(phone)}`}
          >
            <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
            <span dir="ltr">{venuePhoneLabel(phone)}</span>
          </a>
        ))}
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
