import { useEffect, useRef, useState } from "react";
import { PauseIcon, MusicNotesIcon } from "@phosphor-icons/react";
import { t } from "../lib/typography";

export function Atmosphere() {
  const [sound, setSound] = useState(false);
  const muted = useRef(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    if (media.matches || coarse.matches) return;
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const points = Array.from({ length: 22 }, () => ({ x: 0, y: 0 }));
    let x = 0,
      y = 0,
      frame = 0,
      lastMove = 0,
      started = false;
    const resize = () => {
      el.width = innerWidth;
      el.height = innerHeight;
    };
    resize();
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      lastMove = performance.now();
      if (!started) {
        points.forEach((p) => {
          p.x = x;
          p.y = y;
        });
        started = true;
      }
    };
    const draw = (time: number) => {
      ctx.clearRect(0, 0, el.width, el.height);
      if (
        started &&
        time - lastMove < 1200 &&
        !document.hidden &&
        !media.matches
      ) {
        points[0].x += (x - points[0].x) * 0.35;
        points[0].y += (y - points[0].y) * 0.35;
        for (let i = 1; i < points.length; i++) {
          points[i].x += (points[i - 1].x - points[i].x) * 0.36;
          points[i].y += (points[i - 1].y - points[i].y) * 0.36;
        }
        // One stroke, with the entire ribbon slowly changing within the palette.
        const palette = [
          [181, 154, 217],
          [165, 205, 217],
          [240, 215, 117],
        ];
        const phase = (time / 6000) % palette.length;
        const first = palette[Math.floor(phase)];
        const next = palette[(Math.floor(phase) + 1) % palette.length];
        const blend = phase % 1;
        ctx.beginPath();
        ctx.strokeStyle = `rgb(${first.map((c, i) => Math.round(c + (next[i] - c) * blend)).join(",")})`;
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.globalAlpha = Math.max(0, 1 - (time - lastMove) / 1200) * 0.55;
        points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("pointermove", move);
      removeEventListener("resize", resize);
      ctx.clearRect(0, 0, el.width, el.height);
    };
  }, []);
  useEffect(() => {
    const ac = new AudioContext();
    audio.current = ac;
    ac.onstatechange = () => setSound(ac.state === "running");
    const resume = () => {
      if (!muted.current) void ac.resume().catch(() => {});
    };
    const activate = (event: Event) => {
      if ((event.target as Element)?.closest?.(".round-control")) return;
      if (event instanceof KeyboardEvent && !["Enter", " "].includes(event.key))
        return;
      resume();
    };
    resume();
    addEventListener("pointerdown", activate);
    addEventListener("keydown", activate);
    const notes = [261.63, 329.63, 392, 523.25, 440, 392, 329.63, 293.66];
    let step = 0;
    const play = () => {
      if (document.hidden || ac.state !== "running") return;
      const now = ac.currentTime;
      [notes[step++ % notes.length], 130.81].forEach((frequency, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = "sine";
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(i ? 0.006 : 0.014, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now);
        osc.stop(now + 2.6);
      });
    };
    play();
    const timer = window.setInterval(play, 1250);
    return () => {
      clearInterval(timer);
      removeEventListener("pointerdown", activate);
      removeEventListener("keydown", activate);
      ac.onstatechange = null;
      void ac.close();
      audio.current = null;
    };
  }, []);
  return (
    <>
      <canvas ref={canvas} className="cursor-ribbon" aria-hidden="true" />
      <div className="atmosphere-controls">
        <button
          className="round-control"
          aria-pressed={sound}
          aria-label={t(sound ? "Выключить музыку" : "Включить музыку")}
          title={t(sound ? "Выключить музыку" : "Включить музыку")}
          onClick={() => {
            const ac = audio.current;
            if (!ac) return;
            muted.current = ac.state === "running";
            if (muted.current) void ac.suspend();
            else void ac.resume().catch(() => {});
          }}
        >
          {sound ? <PauseIcon size={20} /> : <MusicNotesIcon size={22} />}
        </button>
      </div>
    </>
  );
}
