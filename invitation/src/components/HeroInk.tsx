import { useEffect, useRef } from "react";
import { t } from "../lib/typography";
/** A light SVG displacement study; a draft alternative to the reference's WebGL field. */
export function HeroInk() {
  const ref = useRef<HTMLDivElement>(null);
  const displacement = useRef<SVGFEDisplacementMapElement>(null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || matchMedia("(pointer: coarse)").matches) return;
    const root = ref.current!;
    let target = 0,
      value = 0,
      frame = 0,
      previous = 0;
    const tick = () => {
      value += (target - value) * 0.1;
      target *= 0.94;
      displacement.current?.setAttribute("scale", String(value));
      if (value > 0.05) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
        displacement.current?.setAttribute("scale", "0");
      }
    };
    const move = (e: PointerEvent) => {
      if (
        media.matches ||
        document.documentElement.classList.contains("motion-paused")
      )
        return;
      target = Math.min(16, Math.abs(e.clientX - previous) * 0.5 + 3);
      previous = e.clientX;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const leave = () => {
      target = 0;
    };
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
    };
  }, []);
  return (
    <div ref={ref} className="hero-ink">
      <svg className="filter-definitions" aria-hidden="true">
        <defs>
          <filter
            id="paper-ink-drift"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency=".012 .018"
              numOctaves="2"
              seed="8"
              result="grain"
            />
            <feDisplacementMap
              ref={displacement}
              in="SourceGraphic"
              in2="grain"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <img
        className="ink-art"
        src="art/celebration.webp"
        width="1400"
        height="933"
        alt={t("Лавандовый торт со свечами и букет цветов")}
      />
    </div>
  );
}
