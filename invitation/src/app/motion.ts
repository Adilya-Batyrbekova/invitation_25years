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
          if (
            el.matches(
              ".time-note,.paint-date,.heart-note,.preference-notes p,.wish-card,.paper-link,.wishlist-copy,.photo-deck,.story-more",
            )
          )
            return [];
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
          const animated = el.matches(".preference-notes")
            ? [...el.children]
            : words.length
              ? words
              : [el];
          timeline.fromTo(
            animated,
            { opacity: 0, y: (backward ? -1 : 1) * (script ? 18 : 10) },
            {
              opacity: 1,
              y: 0,
              duration: script ? 0.6 : 0.42,
              stagger: el.matches(".preference-notes")
                ? 0.09
                : script
                  ? 0.025
                  : words.length
                    ? { amount: Math.min(0.32, words.length * 0.025) }
                    : 0,
              ease: "power3.out",
            },
            at,
          );
          if (el.matches(".wishlist-copy,.story-more")) {
            const line = el.querySelector(".hand-underline path");
            if (line)
              timeline.fromTo(
                line,
                { strokeDashoffset: 1 },
                { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" },
                at + 0.2,
              );
          }
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
          let heroPlayed = false;
          const hidden = () =>
            gsap.set(heroPlayed ? sequence.slice(0, 1) : sequence, {
              opacity: 0,
              y: 0,
            });
          hidden();
          const play = () => {
            if (animation) active.delete(animation);
            animation?.kill();
            animation = gsap.timeline();
            active.add(animation);
            (heroPlayed ? sequence.slice(0, 1) : sequence).forEach((el) => {
              const at = animation!.duration();
              animation!.set(el, { opacity: 1, y: 0 }, at);
              playText(animation!, el, at, false);
            });
            heroPlayed = true;
          };
          ScrollTrigger.create({
            scroller,
            trigger: hero,
            start: "top bottom",
            end: "bottom top",
            onEnter: () => play(),
            onEnterBack: () => play(),
            onLeave: () => {
              animation?.progress(1);
              animation?.kill();
              hidden();
            },
            onLeaveBack: () => {
              animation?.progress(1);
              animation?.kill();
              hidden();
            },
          });
        }
        // Individual viewport triggers respect the actual entry order on long sections.
        // When heading and copy enter together, copy waits for the heading's words.
        const candidates = [
          ...root.querySelectorAll<HTMLElement>(
            "h1,h2,p,.text-link,.paper-link,.button,.calendar-paper,.ink-art,.bouquet-drift,.photo-deck,.guest-form,.address-note,.heart-note,.wish-card,.preference-notes,.wishlist-copy,.story-more",
          ),
        ].filter(
          (el) =>
            (!el.closest(".wish-card") || el.matches(".wish-card")) &&
            !el.closest(
              ".hero,.gift-card,dialog,.gift-settings,.contact,.telegram-section,.personal-links,.wish-card",
            ),
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
          gsap.set(
            el.matches(".preference-notes")
              ? [...el.children]
              : words.length
                ? words
                : el,
            { opacity: 0, y: 10 },
          );
          el.dataset.revealState = "waiting";
        };
        items.forEach((el) => {
          reset(el);
          const enter = (backward: boolean) => {
            if (el.dataset.revealState !== "waiting") return;
            const previous = running.get(el);
            previous?.kill();
            if (previous) active.delete(previous);
            el.dataset.revealDirection = backward ? "backward" : "forward";
            el.dataset.revealState = "entering";
            let delay = 0;
            if (!backward && !el.matches("h1,h2")) {
              const container =
                el.closest(
                  ".venue-copy,.flower-copy,.story,.subpage-intro,.personal-links,.preferences",
                ) ?? el.parentElement;
              const heading = container?.querySelector("h1,h2");
              const headingAnimation = heading && running.get(heading);
              if (headingAnimation && headingAnimation.totalProgress() < 1)
                delay = headingAnimation.duration() - headingAnimation.time();
            }
            const ordered = el.closest(".flowers,.personal-links,.story");
            if (ordered) {
              const siblings = items
                .filter((item) => ordered.contains(item))
                .sort(
                  (a, b) =>
                    a.getBoundingClientRect().top -
                    b.getBoundingClientRect().top,
                );
              const position = siblings.indexOf(el);
              const before = backward
                ? siblings.slice(position + 1)
                : siblings.slice(0, position);
              for (const item of before) {
                const bounds = item.getBoundingClientRect();
                if (
                  item.dataset.revealState === "waiting" &&
                  bounds.bottom > 0 &&
                  bounds.top < innerHeight
                )
                  revealers.get(item)?.(backward);
                const prior = running.get(item);
                if (
                  prior &&
                  prior.totalProgress() < 1 &&
                  item.dataset.revealState === "entering"
                )
                  delay = Math.max(delay, prior.duration() - prior.time());
              }
            }
            if (!backward && el.closest(".personal-links")) {
              const bouquet = root.querySelector(".bouquet-drift");
              if (
                bouquet instanceof HTMLElement &&
                bouquet.dataset.revealState === "waiting" &&
                bouquet.getBoundingClientRect().bottom > 0
              )
                revealers.get(bouquet)?.(false);
              const prior = bouquet && running.get(bouquet);
              if (prior && prior.totalProgress() < 1)
                delay = Math.max(delay, prior.duration() - prior.time());
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
          ScrollTrigger.create({
            scroller,
            trigger: el,
            start: "top 96%",
            end: "bottom 4%",
            onEnter: () => enter(false),
            onEnterBack: () => enter(true),
            once: true,
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
            if (items.includes(el) || el.closest(".flowers,.personal-links"))
              return;
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
            const layers = [
              ...cards,
              ...group.querySelectorAll<HTMLElement>(":scope > .stack-cover"),
            ];
            const content = items.filter((el) => group.contains(el));
            ScrollTrigger.create({
              trigger: group,
              start: "top bottom",
              end: "bottom top",
              onUpdate: (self) => {
                if (group.dataset.stackReady !== "true") return;
                for (const [index, layer] of layers.slice(0, -1).entries()) {
                  const nextTop = layers[index + 1].getBoundingClientRect().top;
                  const progress = gsap.utils.clamp(
                    0,
                    1,
                    (innerHeight - nextTop) / innerHeight,
                  );
                  const fit = Math.min(
                    0.7,
                    (layers[index + 1].offsetHeight / layer.offsetHeight) * 0.9,
                  );
                  layer.style.scale = String(1 - (1 - fit) * progress);
                  layer.style.rotate = `x ${40 * progress}deg`;
                  layer.style.transformOrigin = "center center";
                  const successor = layers[index + 1];
                  const currentTop =
                    parseFloat(getComputedStyle(layer).top) || 16;
                  const targetTop =
                    parseFloat(getComputedStyle(successor).top) || 16;
                  const shift =
                    (successor.offsetHeight - layer.offsetHeight) / 2 +
                    targetTop -
                    currentTop;
                  layer.style.translate = `0 ${shift * progress}px`;
                }
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
                (card) =>
                  card.dataset.expanded === "true" ||
                  card.offsetHeight < innerHeight - 32,
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
                  // The following flower cover supplies the real travel inside this group.
                  group.style.setProperty("--rsvp-runway", "0px");
                  group.style.setProperty(
                    "--cover-min-height",
                    Math.max(...cards.map((card) => card.offsetHeight)) +
                      32 +
                      "px",
                  );
                }
                if (!ready)
                  for (const layer of layers) {
                    layer.style.removeProperty("scale");
                    layer.style.removeProperty("rotate");
                    layer.style.removeProperty("transform-origin");
                    layer.style.removeProperty("translate");
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
              for (const layer of group.querySelectorAll<HTMLElement>(
                ":scope > .stack-card",
              )) {
                layer.style.removeProperty("scale");
                layer.style.removeProperty("rotate");
                layer.style.removeProperty("transform-origin");
                layer.style.removeProperty("translate");
              }
              group.style.removeProperty("--rsvp-cover-top");
              group.style.removeProperty("--rsvp-runway");
              group.style.removeProperty("--cover-min-height");
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
