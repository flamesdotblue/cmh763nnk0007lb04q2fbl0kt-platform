import React, { useEffect, useMemo, useRef, useState } from 'react';
import { analyzeTextEmotion, emotionToColor } from '../utils/emotion';

export default function AudioAnalysis() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [energy, setEnergy] = useState(0);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const recognitionRef = useRef(null);

  const textResult = useMemo(() => analyzeTextEmotion(transcript || ''), [transcript]);

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  const startRecording = async () => {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        setEnergy((prev) => prev * 0.8 + rms * 0.2);
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = 'en-US';
        recog.onresult = (e) => {
          let temp = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            temp += e.results[i][0].transcript + ' ';
          }
          setTranscript(temp.trim());
        };
        recog.onerror = () => {};
        recognitionRef.current = recog;
        recog.start();
      }

      setRecording(true);
    } catch (e) {
      console.error(e);
      alert('Microphone permission is required for audio analysis.');
    }
  };

  const stopAll = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    setRecording(false);
  };

  const arousal = Math.min(1, Math.max(0, energy * 4));

  const blendedEmotion = useMemo(() => {
    const base = textResult.emotion;
    if (arousal > 0.6 && base === 'sad') return 'angry';
    if (arousal > 0.6 && base === 'neutral') return 'surprise';
    if (arousal < 0.2 && base === 'angry') return 'sad';
    return base;
  }, [textResult.emotion, arousal]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-2xl font-semibold">Audio Analysis</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={recording ? stopAll : startRecording}
            className={`px-4 py-2 rounded-lg border border-white/10 transition ${recording ? 'bg-rose-500/90 hover:bg-rose-500' : 'bg-emerald-500/90 hover:bg-emerald-500'}`}
          >
            {recording ? 'Stop' : 'Start'} Recording
          </button>
          <span className="inline-flex items-center gap-2 text-sm">
            Top Emotion:
            <span className="px-2 py-1 rounded-md font-medium" style={{ backgroundColor: emotionToColor(blendedEmotion) }}>
              {blendedEmotion}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg bg-neutral-900 border border-white/10 p-4">
          <h3 className="font-medium mb-3">Live Energy</h3>
          <div className="h-24 rounded bg-white/5 flex items-end p-3">
            <div className="w-full h-2 rounded bg-white/10 overflow-hidden">
              <div className="h-full transition-all" style={{ width: `${Math.round(arousal * 100)}%`, backgroundColor: '#22c55e' }} />
            </div>
          </div>
          <p className="text-xs text-white/60 mt-2">Approximate vocal energy derived from microphone input.</p>
        </div>
        <div className="rounded-lg bg-neutral-900 border border-white/10 p-4">
          <h3 className="font-medium mb-3">Speech Transcript</h3>
          <div className="min-h-[100px] rounded bg-neutral-950/60 p-3 text-white/80">
            {transcript || (recording ? 'Listening...' : 'Press Start Recording to begin.')}
          </div>
          <div className="mt-4">
            <h4 className="text-sm text-white/70 mb-2">Text-based Emotion Scores</h4>
            <div className="space-y-2">
              {Object.entries(textResult.scores).map(([k, v]) => (
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
    </div>
  );
}
