'use client';

import { useEffect, useRef, useState } from 'react';
export default function HeroVideo() {
  const video = useRef(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      if (motion.matches) video.current?.pause();else video.current?.play().catch(() => {});
    };
    update();
    motion.addEventListener('change', update);
    return () => motion.removeEventListener('change', update);
  }, []);
  return <><video ref={video} className="hero-video" muted loop playsInline preload="metadata" poster="/assets/property.jpg" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} aria-hidden="true"><source src="/assets/hero.mp4" type="video/mp4" /></video><button className="video-toggle" onClick={() => playing ? video.current?.pause() : video.current?.play().catch(() => {})} aria-label={playing ? 'Pause background video' : 'Play background video'}>{playing ? 'Ⅱ' : '▷'} <span>{playing ? 'Pause film' : 'Play film'}</span></button></>;
}
