import React, { useMemo, useState } from 'react';
import { analyzeTextEmotion, emotionToColor } from '../utils/emotion';

export default function TextAnalysis() {
  const [text, setText] = useState('I feel excited and hopeful about the future!');
  const { emotion, scores } = useMemo(() => analyzeTextEmotion(text), [text]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-2xl font-semibold">Text Analysis</h2>
        <span className="inline-flex items-center gap-2 text-sm">
          Top Emotion:
          <span className="px-2 py-1 rounded-md font-medium" style={{ backgroundColor: emotionToColor(emotion) }}>
            {emotion}
          </span>
        </span>
      </div>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text to analyze emotions"
          className="min-h-[160px] w-full rounded-lg bg-neutral-900 border border-white/10 p-4 outline-none focus:ring-2 ring-violet-500"
        />
        <div className="rounded-lg bg-neutral-900 border border-white/10 p-4">
          <h3 className="font-medium mb-3">Emotion Scores</h3>
          <div className="space-y-2">
            {Object.entries(scores).map(([k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <div className="w-24 capitalize text-white/80">{k}</div>
                <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
                  <div className="h-full" style={{ width: `${Math.round(v * 100)}%`, backgroundColor: emotionToColor(k) }} />
                </div>
                <div className="w-12 text-right text-white/60 text-sm">{(v * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
