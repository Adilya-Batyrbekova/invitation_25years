import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(ScrollTrigger, useGSAP);
export function usePageMotion(key: string) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = ref.current;
        if (!root) return;
        const scroller = root.classList.contains("supplementary-page")
          ? root
          : undefined;
        root.querySelectorAll<HTMLElement>(".handwriting").forEach((el) => {
          gsap.fromTo(
            el.querySelectorAll(".written-char"),
            { clipPath: "inset(0 100% 0 0)", opacity: 0.3 },
            {
              clipPath: "inset(-20% -30% -20% -30%)",
              opacity: 1,
              duration: 0.7,
              stagger: 0.025,
              ease: "power2.out",
              onComplete: () => {
                gsap.set(el.querySelectorAll(".written-char"), {
                  clearProps: "clipPath,opacity",
                });
              },
              scrollTrigger: {
                scroller,
                trigger: el,
                start: "top 94%",
                once: true,
              },
            },
          );
        });
        root.querySelectorAll(".reveal").forEach((el) =>
          gsap.from(el, {
            y: 26,
            opacity: 0.15,
            duration: 1.15,
            ease: "power2.out",
            scrollTrigger: {
              scroller,
              trigger: el,
              start: "top 95%",
              once: true,
            },
          }),
        );
        root.querySelectorAll(".ink-art").forEach((el) =>
          gsap.fromTo(
            el,
            { clipPath: "circle(0% at 50% 62%)", opacity: 0.2 },
            {
              clipPath: "circle(76% at 50% 50%)",
              opacity: 1,
              duration: 1.9,
              ease: "power2.inOut",
              scrollTrigger: {
                scroller,
                trigger: el,
                start: "top 95%",
                once: true,
              },
            },
          ),
        );
        root.querySelectorAll(".float-art").forEach((el) =>
          gsap.to(el, {
            yPercent: -9,
            rotate: 3,
            ease: "none",
            scrollTrigger: {
              scroller,
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }),
        );
        const calendar = root.querySelector(".calendar-paper");
        if (calendar) {
          gsap.from(calendar, {
            rotateX: -28,
            rotate: -4,
            opacity: 0.3,
            transformOrigin: "center top",
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: { trigger: calendar, start: "top 85%", once: true },
          });
          gsap.from(".date-circle", {
            strokeDashoffset: 190,
            duration: 1.3,
            ease: "power2.out",
            scrollTrigger: { trigger: calendar, start: "top 75%", once: true },
          });
        }
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [key], revertOnUpdate: true },
  );
  return ref;
}
