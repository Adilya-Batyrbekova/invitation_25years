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
        const active = new Set<gsap.core.Animation>();
        const drawHeading = (
          timeline: gsap.core.Timeline,
          heading: Element,
          at: number,
        ) => {
          const chars = [...heading.querySelectorAll(".written-char")];
          timeline
            .fromTo(
              chars,
              { opacity: 0, y: 18 },
              {
                opacity: 1,
                y: 0,
                duration: 0.85,
                stagger: 0.045,
                ease: "power3.out",
              },
              at,
            )
            .fromTo(
              heading.querySelectorAll(".glyph-contour"),
              { strokeDashoffset: 1 },
              {
                strokeDashoffset: 0,
                duration: 1.05,
                stagger: 0.045,
                ease: "power2.inOut",
              },
              at,
            )
            .fromTo(
              heading.querySelectorAll(".glyph-fill"),
              { opacity: 0 },
              { opacity: 1, duration: 0.5, stagger: 0.045, ease: "power2.out" },
              at + 0.55,
            );
        };
        const hero = root.querySelector(".hero");
        if (hero) {
          const sequence = [
            hero.querySelector(".hero-title"),
            hero.querySelector(".hero-subtitle"),
            hero.querySelector(".paint-date"),
            hero.querySelector(".ink-art"),
          ].filter((el): el is Element => !!el);
          const hidden = () => gsap.set(sequence, { opacity: 0, y: 18 });
          hidden();
          gsap.set(hero.querySelectorAll(".written-char"), {
            opacity: 0,
            y: 18,
          });
          let animation: gsap.core.Timeline | undefined;
          const play = (backward: boolean) => {
            if (animation) active.delete(animation);
            animation?.kill();
            animation = gsap.timeline();
            active.add(animation);
            (backward ? [...sequence].reverse() : sequence).forEach((el, i) => {
              if (el.matches(".handwriting")) {
                gsap.set(el, { opacity: 1, y: 0 });
                drawHeading(animation!, el, i * 0.65);
              } else
                animation!.fromTo(
                  el,
                  { opacity: 0, y: backward ? -18 : 18 },
                  { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" },
                  i * 0.65,
                );
            });
          };
          ScrollTrigger.create({
            scroller,
            trigger: hero,
            start: "top bottom",
            end: "bottom top",
            onEnter: () => play(false),
            onEnterBack: () => play(true),
            onLeave: () => {
              animation?.kill();
              hidden();
            },
            onLeaveBack: () => {
              animation?.kill();
              hidden();
            },
          });
        }
        // Independent viewport triggers keep long mobile sections readable in either direction.
        const candidates = [
          ...root.querySelectorAll<HTMLElement>(
            "h1,h2,p,.text-link,.paper-link,.button,.calendar-paper,.ink-art,.bouquet-drift,.photo-paper,.guest-form,.gift-card,.greeting-note,.address-note,details",
          ),
        ].filter((el) => !el.closest(".hero"));
        const items = candidates.filter(
          (el) =>
            !candidates.some((parent) => parent !== el && parent.contains(el)),
        );
        items.forEach((el) => {
          gsap.set(el, { opacity: 0, y: 18 });
          let tween: gsap.core.Tween | undefined;
          let drawing: gsap.core.Timeline | undefined;
          const reset = () => {
            if (drawing) active.delete(drawing);
            drawing?.kill();
            if (tween) active.delete(tween);
            tween?.kill();
            gsap.set(el, { opacity: 0, y: 18 });
            el.dataset.revealState = "waiting";
          };
          const enter = (backward: boolean) => {
            if (drawing) active.delete(drawing);
            drawing?.kill();
            if (tween) active.delete(tween);
            tween?.kill();
            el.dataset.revealDirection = backward ? "backward" : "forward";
            el.dataset.revealState = "entering";
            if (el.matches(".handwriting")) {
              gsap.set(el, { opacity: 1, y: 0 });
              drawing = gsap.timeline({
                onComplete: () => {
                  el.dataset.revealState = "visible";
                },
              });
              drawHeading(drawing, el, 0);
              active.add(drawing);
              return;
            }
            tween = gsap.fromTo(
              el,
              { opacity: 0, y: backward ? -18 : 18 },
              {
                opacity: 1,
                y: 0,
                duration: el.matches(".ink-art,.bouquet-drift") ? 1.7 : 1.1,
                ease: "power3.out",
                onComplete: () => {
                  el.dataset.revealState = "visible";
                },
              },
            );
            active.add(tween);
          };
          ScrollTrigger.create({
            scroller,
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            onEnter: () => enter(false),
            onEnterBack: () => enter(true),
            onLeave: reset,
            onLeaveBack: reset,
          });
        });
        root.querySelectorAll(".date-circle").forEach((el) =>
          gsap.fromTo(
            el,
            { strokeDashoffset: 190 },
            {
              strokeDashoffset: 0,
              duration: 1.2,
              scrollTrigger: {
                scroller,
                trigger: el,
                start: "top 90%",
                toggleActions: "restart reset restart reset",
              },
            },
          ),
        );
        root
          .querySelectorAll<HTMLElement>(".float-art:not(.doodle)")
          .forEach((el) => {
            if (items.includes(el)) return;
            gsap.fromTo(
              el,
              { y: 8 },
              {
                y: -8,
                ease: "none",
                scrollTrigger: {
                  scroller,
                  trigger: el,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1.2,
                },
              },
            );
          });
        const observers: ResizeObserver[] = [];
        const measurements: (() => void)[] = [];
        const focusCleanups: (() => void)[] = [];
        root
          .querySelectorAll<HTMLElement>(".scroll-card-stack")
          .forEach((group) => {
            const cards = [
              ...group.querySelectorAll<HTMLElement>(":scope > .stack-card"),
            ];
            if (cards.length < 2) return;
            let lastGeometry = "";
            const measure = () => {
              const ready = cards.every(
                (card) => card.offsetHeight < innerHeight - 32,
              );
              const next = String(ready);
              const geometry = `${innerHeight}:${cards.map((card) => `${card.offsetWidth}x${card.offsetHeight}`).join(",")}`;
              if (
                group.dataset.stackReady !== next ||
                geometry !== lastGeometry
              ) {
                lastGeometry = geometry;
                group.dataset.stackReady = next;
                ScrollTrigger.refresh();
              }
            };
            const observer = new ResizeObserver(measure);
            cards.forEach((card) => observer.observe(card));
            observers.push(observer);
            addEventListener("resize", measure);
            measurements.push(measure);
            measure();
            const revealFocusedCard = (event: FocusEvent) => {
              const target = event.target as HTMLElement;
              const card = target.closest<HTMLElement>(".stack-card");
              if (!card || group.dataset.stackReady !== "true") return;
              const rect = target.getBoundingClientRect();
              const hit = document.elementFromPoint(
                rect.x + rect.width / 2,
                rect.y + rect.height / 2,
              );
              if (!hit || card.contains(hit)) return;
              const before = cards
                .slice(0, cards.indexOf(card))
                .reduce(
                  (sum, item) =>
                    sum +
                    item.offsetHeight +
                    parseFloat(getComputedStyle(item).marginBottom) +
                    parseFloat(getComputedStyle(item).marginTop),
                  0,
                );
              const containerTop = group.getBoundingClientRect().top;
              const padding = parseFloat(getComputedStyle(group).paddingTop);
              if (scroller)
                scroller.scrollTop +=
                  containerTop -
                  scroller.getBoundingClientRect().top +
                  padding +
                  before -
                  24;
              else scrollTo(0, scrollY + containerTop + padding + before - 24);
            };
            group.addEventListener("focusin", revealFocusedCard);
            focusCleanups.push(() =>
              group.removeEventListener("focusin", revealFocusedCard),
            );
            cards.slice(0, -1).forEach((card, i) => {
              gsap.to(card, {
                scale: () => (group.dataset.stackReady === "true" ? 0.96 : 1),
                opacity: () => (group.dataset.stackReady === "true" ? 0.55 : 1),
                transformOrigin: "center top",
                ease: "none",
                scrollTrigger: {
                  scroller,
                  trigger: cards[i + 1],
                  start: "top 85%",
                  end: "top 18px",
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              });
            });
            cards.forEach((card, i) => (card.style.zIndex = String(i + 1)));
          });
        return () => {
          observers.forEach((observer) => observer.disconnect());
          measurements.forEach((measure) =>
            removeEventListener("resize", measure),
          );
          focusCleanups.forEach((cleanup) => cleanup());
          root
            .querySelectorAll<HTMLElement>(".scroll-card-stack")
            .forEach((group) => delete group.dataset.stackReady);
          active.forEach((animation) => animation.kill());
          items.forEach((el) => {
            delete el.dataset.revealState;
            delete el.dataset.revealDirection;
          });
        };
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [key], revertOnUpdate: true },
  );
  return ref;
}
