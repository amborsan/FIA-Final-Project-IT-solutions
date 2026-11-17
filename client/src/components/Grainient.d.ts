import type { CSSProperties, HTMLAttributes } from "react";

export interface GrainientProps extends HTMLAttributes<HTMLDivElement> {
  colors?: string[];
  type?: "linear" | "radial";
  angle?: number;
  bands?: number;
  speed?: number;
  flow?: number;
  scale?: number;
  softness?: number;
  silk?: number;
  grainAmount?: number;
  grainSize?: number;
  grainAnimated?: boolean;
  contrast?: number;
  saturation?: number;
  variation?: number;
  interactive?: boolean;
  stir?: number;
  clickSwirl?: boolean;
  intro?: boolean;
  lightMode?: boolean;
  dpr?: number;
  className?: string;
  style?: CSSProperties;
}

export default function Grainient(props: GrainientProps): React.JSX.Element;
