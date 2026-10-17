import { useId } from "react";
import { cn } from "@/lib/utils";

// Mascot sketch; moves to src/components/ once the design is agreed.

export type TitiPose = "menyapa" | "senang" | "bingung";

const animations = `
@keyframes titi-wave { 0%, 60%, 100% { transform: rotate(0deg); } 15%, 45% { transform: rotate(-18deg); } 30% { transform: rotate(6deg); } }
@keyframes titi-jump { 0%, 100% { transform: translateY(0) scaleY(1); } 10% { transform: translateY(0) scaleY(.94); } 45% { transform: translateY(-14px) scaleY(1.03); } }
@keyframes titi-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.titi-wave { transform-box: fill-box; transform-origin: 50% 100%; animation: titi-wave 2.4s ease-in-out infinite; }
.titi-jump { transform-box: fill-box; transform-origin: 50% 100%; animation: titi-jump .9s cubic-bezier(.3,0,.3,1) infinite; }
.titi-float { animation: titi-float 1.8s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .titi-wave, .titi-jump, .titi-float { animation: none; } }
`;

const palette = {
  red: {
    body: "fill-(--merah)",
    shade: "fill-[color-mix(in_oklch,var(--merah),black_22%)]",
    cheek: "fill-[color-mix(in_oklch,var(--merah),white_55%)]",
  },
  white: {
    body: "fill-(--kertas)",
    shade: "fill-[color-mix(in_oklch,var(--kertas),var(--tinta)_14%)]",
    cheek: "fill-[color-mix(in_oklch,var(--merah),white_60%)]",
  },
};

const ink = "fill-(--tinta)";
const inkStroke = "stroke-(--tinta) [stroke-linecap:round] fill-none";
const strap = "fill-none [stroke-linecap:round]";

// Flat top edge and a slight taper read as a paper bag; rounded bottom keeps it soft.
const bag =
  "M33 48 H107 Q110 48 110.2 51 L114 126 Q114.8 142 98 142 H42 Q25.2 142 26 126 L29.8 51 Q30 48 33 48 Z";

function Arm({
  x,
  y,
  h,
  angle,
  cx,
  cy,
  className,
}: {
  x: number;
  y: number;
  h: number;
  angle: number;
  cx: number;
  cy: number;
  className: string;
}) {
  return (
    <rect
      x={x}
      y={y}
      width="15"
      height={h}
      rx="7.5"
      transform={`rotate(${angle} ${cx} ${cy})`}
      className={className}
    />
  );
}

export function Titi({
  pose,
  inverted = false,
  className,
}: {
  pose: TitiPose;
  /** White body for red surfaces. */
  inverted?: boolean;
  className?: string;
}) {
  const clipId = useId();
  const c = inverted ? palette.white : palette.red;
  const look = pose === "bingung" ? -2.5 : 0;

  return (
    <svg
      viewBox="0 0 140 160"
      className={cn("overflow-visible", className)}
      role="img"
      aria-label={`Titi, pose ${pose}`}
    >
      <style>{animations}</style>
      <clipPath id={clipId}>
        <path d={bag} />
      </clipPath>

      <g
        className={cn(pose === "senang" && "titi-jump", pose === "bingung" && "titi-float")}
        transform={pose === "bingung" ? "rotate(-5 70 100)" : undefined}
      >
        <ellipse cx="53" cy="145" rx="11" ry="6" className={c.shade} />
        <ellipse cx="87" cy="145" rx="11" ry="6" className={c.shade} />

        {pose === "menyapa" && (
          <>
            <Arm x={14} y={96} h={28} angle={28} cx={21} cy={100} className={c.shade} />
            <g className="titi-wave">
              <Arm x={110} y={64} h={32} angle={24} cx={117} cy={96} className={c.shade} />
            </g>
          </>
        )}
        {pose === "senang" && (
          <>
            <Arm x={12} y={64} h={32} angle={-28} cx={19} cy={96} className={c.shade} />
            <Arm x={113} y={64} h={32} angle={28} cx={120} cy={96} className={c.shade} />
          </>
        )}
        {pose === "bingung" && (
          <>
            <Arm x={14} y={98} h={28} angle={24} cx={21} cy={102} className={c.shade} />
            <Arm x={110} y={68} h={30} angle={-150} cx={117} cy={83} className={c.shade} />
          </>
        )}

        <path d={bag} className={c.body} />
        <g clipPath={`url(#${clipId})`}>
          <rect x="24" y="48" width="92" height="12" className={c.shade} />
        </g>

        <path
          d="M52 58 C52 26, 88 26, 88 58"
          strokeWidth="6.5"
          className={cn(strap, "stroke-(--rambu)")}
        />
        <circle cx="52" cy="58" r="3" className="fill-(--kertas)" />
        <circle cx="88" cy="58" r="3" className="fill-(--kertas)" />

        <ellipse cx="45" cy="116" rx="8" ry="5" className={c.cheek} />
        <ellipse cx="95" cy="116" rx="8" ry="5" className={c.cheek} />

        {pose === "senang" ? (
          <>
            <path d="M48 102 Q55 93 62 102" strokeWidth="5.5" className={inkStroke} />
            <path d="M78 102 Q85 93 92 102" strokeWidth="5.5" className={inkStroke} />
          </>
        ) : (
          [55, 85].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx + look} cy="100" rx="7" ry="9" className={ink} />
              <circle cx={cx + look + 2.5} cy="96.5" r="2.6" className="fill-white" />
            </g>
          ))
        )}

        {pose === "bingung" && (
          <>
            <path d="M47 86 Q53 82 59 85" strokeWidth="3.5" className={inkStroke} />
            <path d="M81 83 Q87 80 93 84" strokeWidth="3.5" className={inkStroke} />
          </>
        )}

        {pose === "menyapa" && (
          <path d="M62 117 Q70 124 78 117" strokeWidth="4.5" className={inkStroke} />
        )}
        {pose === "senang" && (
          <>
            <path d="M59 113 H81 Q81 130 70 130 Q59 130 59 113 Z" className={ink} />
            <ellipse cx="70" cy="126" rx="6" ry="3.5" className={c.cheek} />
          </>
        )}
        {pose === "bingung" && (
          <path
            d="M63 120 Q66.5 117 70 120 Q73.5 123 77 120"
            strokeWidth="3.5"
            className={inkStroke}
          />
        )}
      </g>

      {pose === "bingung" && (
        <text
          x="118"
          y="40"
          className="titi-float fill-(--tinta) font-heading text-[30px] font-extrabold"
          aria-hidden
        >
          ?
        </text>
      )}
    </svg>
  );
}
