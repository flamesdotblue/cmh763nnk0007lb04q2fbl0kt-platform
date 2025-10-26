import React from 'react';
import Hero from './components/Hero';
import ModuleGrid from './components/ModuleGrid';
import TextAnalysis from './components/TextAnalysis';
import AudioAnalysis from './components/AudioAnalysis';
import ImageAnalysis from './components/ImageAnalysis';
import VideoAnalysis from './components/VideoAnalysis';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white antialiased">
      <Hero />
      <main className="relative z-10">
        <section className="container mx-auto px-4 py-10">
          <ModuleGrid />
        </section>

        <section id="text" className="container mx-auto px-4 py-10">
          <TextAnalysis />
        </section>

        <section id="audio" className="container mx-auto px-4 py-10">
          <AudioAnalysis />
        </section>

        <section id="image" className="container mx-auto px-4 py-10">
          <ImageAnalysis />
        </section>

        <section id="video" className="container mx-auto px-4 py-10">
          <VideoAnalysis />
        </section>
      </main>
      <footer className="border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-white/60">
          Multimodal Emotion Recognition Demo • Built with React, Tailwind, and Web APIs
        </div>
      </footer>
    </div>
  );
}
