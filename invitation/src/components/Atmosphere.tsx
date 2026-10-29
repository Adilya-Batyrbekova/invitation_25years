import { useEffect, useRef, useState } from "react";
import { PauseIcon, MusicNotesIcon, FlowerIcon } from "@phosphor-icons/react";
import { t } from "../lib/typography";

export function Atmosphere() {
  const [sound, setSound] = useState(false);
  const [moving, setMoving] = useState(true);
  const canvas = useRef<HTMLCanvasElement>(null);
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => {
    document.documentElement.classList.toggle("motion-paused", !moving);
    return () => document.documentElement.classList.remove("motion-paused");
  }, [moving]);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    if (!moving || media.matches || coarse.matches) return;
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
        ["#b59ad9", "#f0d775", "#a5cdd9"].forEach((color, k) => {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.globalAlpha = Math.max(0, 1 - (time - lastMove) / 1200) * 0.65;
          points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y + k * 3);
            else ctx.lineTo(p.x, p.y + k * 3);
          });
          ctx.stroke();
        });
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
  }, [moving]);
  useEffect(() => {
    if (!sound) return;
    const ac = audio.current ?? new AudioContext();
    audio.current = ac;
    void ac.resume();
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
        gain.gain.linearRampToValueAtTime(i ? 0.018 : 0.045, now + 0.08);
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
      void ac.suspend();
    };
  }, [sound]);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  return (
    <>
      <canvas ref={canvas} className="cursor-ribbon" aria-hidden="true" />
      <div className="atmosphere-controls">
        <button
          className="round-control"
          aria-pressed={sound}
          aria-label={t(sound ? "Выключить музыку" : "Включить музыку")}
          title={t(sound ? "Выключить музыку" : "Включить музыку")}
          onClick={() => setSound(!sound)}
        >
          <MusicNotesIcon size={22} />
        </button>
        <button
          className="round-control"
          aria-pressed={!moving}
          aria-label={t(moving ? "Остановить анимацию" : "Включить анимацию")}
          title={t(moving ? "Остановить анимацию" : "Включить анимацию")}
          onClick={() => setMoving(!moving)}
        >
          {moving ? <PauseIcon size={19} /> : <FlowerIcon size={21} />}
        </button>
      </div>
    </>
  );
}
