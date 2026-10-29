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
        const scroller = undefined;
        const active = new Set<gsap.core.Animation>();
        const targets = (el: Element) => {
          if (el.matches(".time-note")) return [];
          const chars = [...el.querySelectorAll<HTMLElement>(".written-char")];
          return chars.length
            ? chars
            : [...el.querySelectorAll<HTMLElement>(".text-word")];
        };
        const playText = (
          timeline: gsap.core.Timeline,
          el: Element,
          at: number,
          backward: boolean,
        ) => {
          const words = targets(el);
          const script = el.matches(".handwriting");
          const animated = words.length ? words : [el];
          timeline.fromTo(
            animated,
            { opacity: 0, y: (backward ? -1 : 1) * (script ? 18 : 10) },
            {
              opacity: 1,
              y: 0,
              duration: script ? 0.85 : 0.65,
              stagger: script
                ? 0.045
                : words.length
                  ? { amount: Math.min(0.65, words.length * 0.045) }
                  : 0,
              ease: "power3.out",
            },
            at,
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
          let animation: gsap.core.Timeline | undefined;
          const hidden = () => gsap.set(sequence, { opacity: 0, y: 0 });
          hidden();
          const play = (backward: boolean) => {
            if (animation) active.delete(animation);
            animation?.kill();
            animation = gsap.timeline();
            active.add(animation);
            (backward ? [...sequence].reverse() : sequence).forEach((el) => {
              const at = animation!.duration();
              animation!.set(el, { opacity: 1, y: 0 }, at);
              playText(animation!, el, at, backward);
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
        // Individual viewport triggers respect the actual entry order on long sections.
        // When heading and copy enter together, copy waits for the heading's words.
        const candidates = [
          ...root.querySelectorAll<HTMLElement>(
            "h1,h2,p,.text-link,.paper-link,.button,.calendar-paper,.ink-art,.bouquet-drift,.photo-paper,.guest-form,.address-note",
          ),
        ].filter(
          (el) =>
            !el.closest(".hero,.gift-card,dialog,.gift-settings,.contact"),
        );
        const items = candidates.filter(
          (el) =>
            !candidates.some((parent) => parent !== el && parent.contains(el)),
        );
        const running = new Map<Element, gsap.core.Timeline>();
        const revealers = new Map<HTMLElement, (backward: boolean) => void>();
        const reset = (el: HTMLElement) => {
          const previous = running.get(el);
          previous?.kill();
          if (previous) active.delete(previous);
          running.delete(el);
          const words = targets(el);
          gsap.set(words.length ? words : el, { opacity: 0, y: 10 });
          el.dataset.revealState = "waiting";
        };
        items.forEach((el) => {
          reset(el);
          const enter = (backward: boolean) => {
            const previous = running.get(el);
            previous?.kill();
            if (previous) active.delete(previous);
            el.dataset.revealDirection = backward ? "backward" : "forward";
            el.dataset.revealState = "entering";
            let delay = 0;
            if (!backward && !el.matches("h1,h2")) {
              const container =
                el.closest(".venue-copy,.flower-copy,.story,.subpage-intro") ??
                el.parentElement;
              const heading = container?.querySelector("h1,h2");
              const headingAnimation = heading && running.get(heading);
              if (headingAnimation && headingAnimation.totalProgress() < 1)
                delay = headingAnimation.duration() - headingAnimation.time();
            }
            const timeline = gsap.timeline({
              onComplete: () => {
                el.dataset.revealState = "visible";
              },
            });
            playText(timeline, el, Math.max(0, delay), backward);
            running.set(el, timeline);
            active.add(timeline);
          };
          revealers.set(el, enter);
          const leave = () => {
            const card = el.closest<HTMLElement>(".stack-card");
            if (card && getComputedStyle(card).position === "sticky") {
              const bounds = el.getBoundingClientRect();
              // Trigger coordinates follow document flow; a sticky target may still be visible.
              if (bounds.bottom > 0 && bounds.top < innerHeight) return;
            }
            reset(el);
          };
          ScrollTrigger.create({
            scroller,
            trigger: el,
            start: "top 96%",
            end: "bottom 4%",
            onEnter: () => enter(false),
            onEnterBack: () => enter(true),
            onLeave: leave,
            onLeaveBack: leave,
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
            const content = items.filter((el) => group.contains(el));
            ScrollTrigger.create({
              trigger: group,
              start: "top bottom",
              end: "bottom top",
              onUpdate: (self) => {
                if (group.dataset.stackReady !== "true") return;
                // A sticky element can be visible after its original flow position has passed.
                for (const el of content) {
                  if (el.dataset.revealState !== "waiting") continue;
                  const bounds = el.getBoundingClientRect();
                  if (bounds.bottom > 0 && bounds.top < innerHeight)
                    revealers.get(el)?.(self.direction < 0);
                }
              },
            });
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
                if (group.classList.contains("venue-rsvp-stack")) {
                  // RsvpSurface top-curve controls stay within y=45 of its 500-unit viewBox.
                  const clearance =
                    Math.ceil(cards[1].offsetHeight * (45 / 500)) + 1;
                  group.style.setProperty(
                    "--rsvp-cover-top",
                    16 - clearance + "px",
                  );
                  group.style.setProperty(
                    "--rsvp-runway",
                    Math.max(0, cards[0].offsetHeight - cards[1].offsetHeight) +
                      clearance +
                      "px",
                  );
                }
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
              scrollTo(0, scrollY + containerTop + padding + before - 24);
            };
            group.addEventListener("focusin", revealFocusedCard);
            focusCleanups.push(() =>
              group.removeEventListener("focusin", revealFocusedCard),
            );
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
            .forEach((group) => {
              delete group.dataset.stackReady;
              group.style.removeProperty("--rsvp-cover-top");
              group.style.removeProperty("--rsvp-runway");
            });
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
