import React, { useMemo, useRef, useState } from 'react';
import { analyzePixelsEmotion, emotionToColor } from '../utils/emotion';

export default function ImageAnalysis() {
  const [imageURL, setImageURL] = useState('');
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageURL(url);
    setResult(null);
    setTimeout(() => analyzeImage(), 50);
  };

  const analyzeImage = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const w = Math.min(320, img.naturalWidth);
    const h = Math.floor((img.naturalHeight / img.naturalWidth) * w);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    const r = analyzePixelsEmotion(data);
    setResult(r);
  };

  const top = useMemo(() => (result ? result.emotion : 'neutral'), [result]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-2xl font-semibold">Image Analysis</h2>
        <span className="inline-flex items-center gap-2 text-sm">
          Top Emotion:
          <span className="px-2 py-1 rounded-md font-medium" style={{ backgroundColor: emotionToColor(top) }}>
            {top}
          </span>
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg bg-neutral-900 border border-white/10 p-4 flex flex-col items-center justify-center min-h-[280px]">
          {!imageURL ? (
            <label className="cursor-pointer text-center">
              <div className="p-6 rounded-lg border border-dashed border-white/20 bg-neutral-950/40 hover:bg-neutral-950/60 transition">
                <div className="font-medium">Upload an image</div>
                <div className="text-xs text-white/60 mt-1">PNG, JPG up to ~5MB</div>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </label>
          ) : (
            <div className="w-full">
              <img
                ref={imgRef}
                src={imageURL}
                alt="Uploaded"
                onLoad={analyzeImage}
                className="max-h-[360px] w-full object-contain rounded-md border border-white/10 bg-neutral-950"
              />
            </div>
          )}
        </div>

        <div className="rounded-lg bg-neutral-900 border border-white/10 p-4">
          <h3 className="font-medium mb-3">Analysis</h3>
          {!result ? (
            <p className="text-white/60 text-sm">Upload an image to see emotion estimates based on brightness and color warmth.</p>
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
