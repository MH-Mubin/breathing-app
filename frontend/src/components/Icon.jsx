/**
 * Central icon registry.
 *
 * Every icon in the UI is a vector (lucide-react SVG) referenced by a
 * semantic name — no emoji characters anywhere in the markup, so glyphs
 * render identically on every device and font stack instead of falling back
 * to whatever the platform happens to ship.
 *
 * Usage: <Icon name="flame" className="w-6 h-6 text-primary" />
 */
import {
  AlarmClock,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Armchair,
  BarChart3,
  BatteryCharging,
  BedDouble,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  CloudMoon,
  Dna,
  Drama,
  Dumbbell,
  Eye,
  Feather,
  Flame,
  Flower2,
  Gem,
  GraduationCap,
  Hand,
  Heart,
  HeartPulse,
  Hourglass,
  Leaf,
  Lightbulb,
  Medal,
  Menu,
  Moon,
  MoonStar,
  PieChart,
  Rainbow,
  Scale,
  ShieldCheck,
  Smile,
  Sparkles,
  Sprout,
  Star,
  Stethoscope,
  Sun,
  Target,
  Timer,
  TreeDeciduous,
  TrendingUp,
  Trophy,
  UserRound,
  Waves,
  Wind,
  Wrench,
  X,
  Zap,
} from "lucide-react";

export const ICONS = {
  "alarm-clock": AlarmClock,
  "alert-triangle": AlertTriangle,
  "arrow-down": ArrowDown,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  armchair: Armchair,
  "bar-chart": BarChart3,
  "battery-charging": BatteryCharging,
  bed: BedDouble,
  "book-open": BookOpen,
  brain: Brain,
  calendar: CalendarDays,
  close: X,
  check: Check,
  "check-circle": CheckCircle2,
  clock: Clock,
  "cloud-moon": CloudMoon,
  dna: Dna,
  drama: Drama,
  dumbbell: Dumbbell,
  eye: Eye,
  feather: Feather,
  flame: Flame,
  gem: Gem,
  "graduation-cap": GraduationCap,
  hand: Hand,
  heart: Heart,
  "heart-pulse": HeartPulse,
  hourglass: Hourglass,
  leaf: Leaf,
  lightbulb: Lightbulb,
  medal: Medal,
  menu: Menu,
  moon: Moon,
  "moon-star": MoonStar,
  "pie-chart": PieChart,
  rainbow: Rainbow,
  scale: Scale,
  shield: ShieldCheck,
  smile: Smile,
  sparkles: Sparkles,
  sprout: Sprout,
  star: Star,
  stethoscope: Stethoscope,
  sun: Sun,
  target: Target,
  timer: Timer,
  tree: TreeDeciduous,
  "trending-up": TrendingUp,
  trophy: Trophy,
  user: UserRound,
  waves: Waves,
  wind: Wind,
  wrench: Wrench,
  zap: Zap,
  zen: Flower2,
};

/**
 * Achievements are persisted on the user document, so accounts created before
 * the switch to named icons still carry emoji. Map those onto the same set so
 * old records render as vectors too.
 */
const LEGACY_EMOJI = {
  "\u{1F331}": "sprout", // seedling
  "\u{1F33F}": "leaf", // herb
  "\u{1F333}": "tree", // deciduous tree
  "\u{1F3C6}": "trophy",
  "\u{2B50}": "star",
  "\u{1F9D8}": "zen", // person in lotus position
  "\u{1F525}": "flame",
  "\u{1F4AA}": "dumbbell", // flexed biceps
  "\u{1F3C5}": "medal",
  "\u{1F31F}": "sparkles", // glowing star
  "\u{23F0}": "alarm-clock",
  "\u{231B}": "hourglass",
  "\u{1F48E}": "gem",
  "\u{23F1}": "timer", // stopwatch
  "\u{1F3AF}": "target",
  "\u{1F4A1}": "lightbulb",
  "\u{1F4CA}": "bar-chart",
  "\u{1F4C8}": "trending-up",
  "\u{1F4C5}": "calendar",
  "\u{2728}": "sparkles",
};

/**
 * Accepts a registry name or a legacy emoji and returns the registry name,
 * or null when neither matches.
 */
export function resolveIconName(name) {
  if (typeof name !== "string" || name === "") return null;
  if (ICONS[name]) return name;

  // Strip variation selectors and take the first scalar of a ZWJ sequence
  // (e.g. the gendered forms of the lotus-position emoji) before lookup.
  const base = name.replace(/[\uFE0E\uFE0F]/g, "").split("\u200D")[0];
  return LEGACY_EMOJI[base] || null;
}

export default function Icon({
  name,
  className = "w-5 h-5",
  strokeWidth = 2,
  title,
  fallback = "trophy",
  ...rest
}) {
  const resolved = resolveIconName(name) || resolveIconName(fallback);
  const Glyph = resolved ? ICONS[resolved] : Trophy;

  return (
    <Glyph
      className={className}
      strokeWidth={strokeWidth}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
      {...rest}
    />
  );
}
