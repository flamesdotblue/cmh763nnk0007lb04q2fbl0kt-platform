import React, { useEffect, useMemo, useRef, useState } from 'react';
import { analyzePixelsEmotion, emotionToColor } from '../utils/emotion';

export default function VideoAnalysis() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [active, setActive] = useState(false);
  const [result, setResult] = useState(null);
  const rafRef = useRef(null);

  useEffect(() => {
    return () => stop();
  }, []);

  const start = async () => {
    if (active) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        analyzeLoop();
        setActive(true);
      }
    } catch (e) {
      console.error(e);
      alert('Camera permission is required for video analysis.');
    }
  };

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setActive(false);
  };

  const analyzeLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = 224;
    const h = Math.floor((video.videoHeight / video.videoWidth) * w) || 224;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const tick = () => {
      if (!video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      ctx.drawImage(video, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);
      const r = analyzePixelsEmotion(data);
      setResult(r);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const top = useMemo(() => (result ? result.emotion : 'neutral'), [result]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-2xl font-semibold">Video Analysis</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={active ? stop : start}
            className={`px-4 py-2 rounded-lg border border-white/10 transition ${active ? 'bg-rose-500/90 hover:bg-rose-500' : 'bg-blue-500/90 hover:bg-blue-500'}`}
          >
            {active ? 'Stop' : 'Start'} Webcam
          </button>
          <span className="inline-flex items-center gap-2 text-sm">
            Top Emotion:
            <span className="px-2 py-1 rounded-md font-medium" style={{ backgroundColor: emotionToColor(top) }}>
              {top}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg bg-neutral-900 border border-white/10 p-4">
          <video ref={videoRef} className="w-full rounded-md bg-black aspect-video" muted playsInline />
        </div>
        <div className="rounded-lg bg-neutral-900 border border-white/10 p-4">
          <h3 className="font-medium mb-3">Live Estimates</h3>
          {!result ? (
            <p className="text-white/60 text-sm">Enable webcam to see real-time emotion approximations based on brightness and color warmth.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(result.scores).map(([k, v]) => (
                <div key={k} className="flex items-center gap-3">
                  <div className="w-24 capitalize text-white/80">{k}</div>
                  <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
                    <div className="h-full" style={{ width: `${Math.round(v * 100)}%`, backgroundColor: emotionToColor(k) }} />
                  </div>
                  <div className="w-12 text-right text-white/60 text-sm">{(v * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}
