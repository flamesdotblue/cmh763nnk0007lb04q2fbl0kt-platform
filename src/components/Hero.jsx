import React from 'react';
import Spline from '@splinetool/react-spline';
import { Rocket } from 'lucide-react';

export default function Hero() {
  return (
    <header className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/20 via-neutral-950/40 to-neutral-950 pointer-events-none" />
      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
            <Rocket size={14} className="text-violet-300" />
            Multimodal AI • Text • Audio • Image • Video
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight">
            Emotion Intelligence Across Every Modality
          </h1>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto">
            Detect and classify human emotions using text, audio, image, and video inputs for more context-aware and empathetic AI interactions.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#text" className="px-5 py-2.5 rounded-lg bg-violet-500/90 hover:bg-violet-500 transition">
              Try the Modules
            </a>
            <a href="#video" className="px-5 py-2.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition">
              Live Webcam Demo
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
