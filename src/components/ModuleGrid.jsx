import React from 'react';
import { MessageSquare, Mic, Image as ImageIcon, Video } from 'lucide-react';

const modules = [
  {
    id: 'text',
    title: 'Text Analysis',
    desc: 'Detect emotions from written content using lightweight heuristics.',
    icon: MessageSquare,
    href: '#text',
  },
  {
    id: 'audio',
    title: 'Audio Analysis',
    desc: 'Record speech, transcribe with Web Speech API, analyze tone and content.',
    icon: Mic,
    href: '#audio',
  },
  {
    id: 'image',
    title: 'Image Analysis',
    desc: 'Identify likely emotions from facial images using visual cues.',
    icon: ImageIcon,
    href: '#image',
  },
  {
    id: 'video',
    title: 'Video Analysis',
    desc: 'Real-time webcam analysis with live emotion estimates.',
    icon: Video,
    href: '#video',
  },
];

export default function ModuleGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {modules.map((m) => (
        <a
          key={m.id}
          href={m.href}
          className="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-5 flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20 text-violet-300">
              <m.icon size={20} />
            </div>
            <h3 className="text-lg font-semibold">{m.title}</h3>
          </div>
          <p className="text-sm text-white/70">{m.desc}</p>
          <div className="mt-auto text-sm text-violet-300/80 group-hover:text-violet-300">Open →</div>
        </a>
      ))}
    </div>
  );
}
