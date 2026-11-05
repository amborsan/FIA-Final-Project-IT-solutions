import {
  BarChart3,
  Cable,
  Camera,
  Code2,
  Fingerprint,
  Headphones,
  Network,
  Phone,
  Server,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  network: Network,
  camera: Camera,
  headset: Headphones,
  code: Code2,
  shield: ShieldCheck,
  server: Server,
  fingerprint: Fingerprint,
  phone: Phone,
  cable: Cable,
  chart: BarChart3,
  wrench: Wrench,
};

export const serviceIconOptions = Object.keys(icons);

export function ServiceIcon({
  name,
  className = "h-6 w-6",
}: {
  name: string;
  className?: string;
}) {
  const Icon = icons[name] ?? Wrench;
  return <Icon className={className} strokeWidth={1.8} aria-hidden="true" />;
}
