import { useId, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { t } from "../lib/typography";

// Deform the source pixels in soft local regions; never duplicate flowers over the picture.
export function LivingArt({ celebration = false }: { celebration?: boolean }) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const width = celebration ? 1400 : 1120;
  const height = celebration ? 933 : 1344;
  const regions = celebration
    ? [
        [720, 115, 140],
        [990, 130, 150],
        [1240, 150, 150],
        [750, 270, 140],
        [1160, 315, 140],
      ]
    : [
        [470, 180, 150],
        [610, 120, 150],
        [845, 210, 150],
        [160, 330, 140],
        [480, 460, 130],
        [790, 600, 140],
        [1030, 350, 130],
      ];
  const mask = (points: number[][]) =>
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><radialGradient id="g"><stop stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient></defs>${points.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#g)"/>`).join("")}</svg>`,
    );
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const flowers = ref.current?.querySelector(".flower-displacement");
        const flames = ref.current?.querySelector(".flame-displacement");
        const motion = gsap.timeline({ repeat: -1, yoyo: true });
        if (flowers)
          motion.fromTo(
            flowers,
            { attr: { scale: -10 } },
            { attr: { scale: 12 }, duration: 3.8, ease: "sine.inOut" },
            0,
          );
        const flicker = flames
          ? gsap.fromTo(
              flames,
              { attr: { scale: -8 } },
              {
                attr: { scale: 10 },
                duration: 0.65,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
              },
            )
          : undefined;
        const observer = new IntersectionObserver(([entry]) => {
          motion.paused(!entry.isIntersecting);
          flicker?.paused(!entry.isIntersecting);
        });
        if (ref.current) observer.observe(ref.current);
        return () => {
          observer.disconnect();
          motion.kill();
          flicker?.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <svg
      ref={ref}
      className="ink-art living-art"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={t(
        celebration
          ? "Лавандовый торт со свечами и букет цветов"
          : "Букет жёлтых, голубых и лавандовых цветов в фиолетовой вазе",
      )}
    >
      <defs>
        <filter
          id={id}
          x="-2%"
          y="-2%"
          width="104%"
          height="104%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            baseFrequency="0.008 0.004"
            numOctaves="1"
            seed="7"
            result="noise"
          />
          <feImage
            href={mask(regions)}
            x="0"
            y="0"
            width={width}
            height={height}
            result="region"
          />
          <feComposite
            in="noise"
            in2="region"
            operator="in"
            result="localNoise"
          />
          <feFlood floodColor="#808080" result="neutral" />
          <feComposite
            in="localNoise"
            in2="neutral"
            operator="over"
            result="map"
          />
          <feDisplacementMap
            className="flower-displacement"
            in="SourceGraphic"
            in2="map"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
            result="flowers"
          />
          {celebration && (
            <>
              <feTurbulence
                baseFrequency="0.025 0.012"
                seed="3"
                result="fireNoise"
              />
              <feImage
                href={mask([
                  [300, 250, 48],
                  [357, 245, 48],
                  [416, 230, 48],
                  [462, 260, 48],
                  [508, 242, 48],
                  [558, 265, 48],
                ])}
                x="0"
                y="0"
                width={width}
                height={height}
                result="fireRegion"
              />
              <feComposite
                in="fireNoise"
                in2="fireRegion"
                operator="in"
                result="localFire"
              />
              <feComposite
                in="localFire"
                in2="neutral"
                operator="over"
                result="fireMap"
              />
              <feDisplacementMap
                className="flame-displacement"
                in="flowers"
                in2="fireMap"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </>
          )}
        </filter>
      </defs>
      <image
        href={`art/${celebration ? "celebration" : "bouquet"}.webp`}
        width={width}
        height={height}
        filter={`url(#${id})`}
      />
    </svg>
  );
}
