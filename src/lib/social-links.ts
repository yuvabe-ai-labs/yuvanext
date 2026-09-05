import type { ComponentType, SVGProps } from "react";
import {
  Dribbble,
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import {
  BehanceIcon,
  PinterestIcon,
  ThreadIcon,
  TwitterIcon,
} from "@/components/ui/custom-icons";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface SocialProvider {
  label: string;
  icon: IconComponent;
}

/**
 * Providers a candidate can attach to their profile, keyed by the `platform`
 * value stored on `socialLinks`.
 *
 * The first eight mirror PLATFORM_OPTIONS in CandidateSocialLinksDialog — the
 * list the candidate actually picks from. The rest cover platforms that appear
 * in older free-text data so they still render with the right brand mark.
 *
 * Icons come from lucide-react wherever it ships the brand; Threads, X,
 * Behance and Pinterest are not in lucide, so those come from custom-icons.
 */
const SOCIAL_PROVIDERS: Record<string, SocialProvider> = {
  linkedin: { label: "LinkedIn", icon: Linkedin },
  github: { label: "GitHub", icon: Github },
  twitter: { label: "Twitter", icon: Twitter },
  instagram: { label: "Instagram", icon: Instagram },
  facebook: { label: "Facebook", icon: Facebook },
  x: { label: "X", icon: TwitterIcon },
  threads: { label: "Threads", icon: ThreadIcon },
  website: { label: "Website", icon: Globe },

  behance: { label: "Behance", icon: BehanceIcon },
  dribbble: { label: "Dribbble", icon: Dribbble },
  pinterest: { label: "Pinterest", icon: PinterestIcon },
  youtube: { label: "YouTube", icon: Youtube },
  portfolio: { label: "Portfolio", icon: Globe },
};

/** Anything unrecognised still gets a sensible mark rather than nothing. */
const FALLBACK_ICON: IconComponent = Globe;

/**
 * Resolves a stored link to its provider. `platform` is matched first; the URL
 * is only consulted as a fallback, since free-text entries often leave the
 * platform blank but carry the brand in the host name.
 */
const resolveProvider = (
  platform?: string | null,
  url?: string | null,
): SocialProvider | undefined => {
  const key = (platform ?? "").trim().toLowerCase();
  if (SOCIAL_PROVIDERS[key]) return SOCIAL_PROVIDERS[key];

  const haystack = `${platform ?? ""} ${url ?? ""}`.toLowerCase();
  const matched = Object.keys(SOCIAL_PROVIDERS).find((name) =>
    haystack.includes(name),
  );
  return matched ? SOCIAL_PROVIDERS[matched] : undefined;
};

export const getSocialIcon = (
  platform?: string | null,
  url?: string | null,
): IconComponent => resolveProvider(platform, url)?.icon ?? FALLBACK_ICON;

/** Display name for a link — falls back to the raw platform, capitalised. */
export const getSocialLabel = (
  platform?: string | null,
  url?: string | null,
): string => {
  const known = resolveProvider(platform, url);
  if (known) return known.label;

  const raw = (platform ?? "").trim();
  if (!raw) return "Link";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};
