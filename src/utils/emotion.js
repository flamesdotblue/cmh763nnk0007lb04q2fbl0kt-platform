// Lightweight heuristics for emotion estimation across modalities.
// Emotions: happy, sad, angry, fear, surprise, neutral

export function emotionToColor(e) {
  switch (e) {
    case 'happy':
      return '#22c55e';
    case 'sad':
      return '#60a5fa';
    case 'angry':
      return '#ef4444';
    case 'fear':
      return '#a78bfa';
    case 'surprise':
      return '#f59e0b';
    default:
      return '#94a3b8';
  }
}

export function analyzeTextEmotion(text) {
  const t = (text || '').toLowerCase();
  const dict = {
    happy: [
      'happy', 'joy', 'joyful', 'excited', 'delighted', 'glad', 'great', 'good', 'love', 'wonderful', 'hopeful', 'optimistic', 'grateful', 'smile'
    ],
    sad: [
      'sad', 'down', 'unhappy', 'depressed', 'blue', 'gloomy', 'tired', 'exhausted', 'lonely', 'cry', 'sorrow', 'disappointed'
    ],
    angry: [
      'angry', 'mad', 'furious', 'rage', 'annoyed', 'irritated', 'frustrated', 'hate', 'upset', 'offended'
    ],
    fear: [
      'afraid', 'scared', 'fear', 'terrified', 'anxious', 'anxiety', 'worried', 'concerned', 'nervous'
    ],
    surprise: [
      'surprised', 'shocked', 'amazed', 'astonished', 'wow', 'unexpected'
    ],
  };

  const scores = { happy: 0, sad: 0, angry: 0, fear: 0, surprise: 0, neutral: 0 };
  const words = t.split(/\W+/).filter(Boolean);
  const total = Math.max(1, words.length);

  Object.entries(dict).forEach(([emo, list]) => {
    let count = 0;
    for (const w of words) {
      if (list.includes(w)) count++;
    }
    scores[emo] = count / total;
  });

  // Boost negations for sad/angry
  const negation = (t.match(/\b(no|not|never|can't|won't|don't)\b/g) || []).length;
  scores.sad += negation * 0.02;
  scores.angry += negation * 0.015;

  // Normalize and compute neutral as leftover
  const sumKnown = scores.happy + scores.sad + scores.angry + scores.fear + scores.surprise;
  scores.neutral = Math.max(0, 1 - sumKnown);

  // Softmax-like smoothing
  const smooth = (x) => Math.pow(x + 0.0001, 0.9);
  let denom = 0;
  Object.keys(scores).forEach((k) => (denom += smooth(scores[k])));
  const finalScores = {};
  Object.keys(scores).forEach((k) => (finalScores[k] = smooth(scores[k]) / denom));

  const emotion = Object.entries(finalScores).sort((a, b) => b[1] - a[1])[0][0];
  return { emotion, scores: finalScores };
}

// Compute average brightness and warmth to approximate emotion.
export function analyzePixelsEmotion(rgba) {
  let rSum = 0, gSum = 0, bSum = 0;
  let count = 0;
  // Sample every 4th pixel to reduce work
  for (let i = 0; i < rgba.length; i += 16) {
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];
    rSum += r; gSum += g; bSum += b;
    count++;
  }
  const r = rSum / count;
  const g = gSum / count;
  const b = bSum / count;
  const brightness = (r + g + b) / (3 * 255);
  const warmth = (r - b + 255) / 510; // 0..1 where higher is warmer

  // Map heuristics to emotions
  // brighter + warmer => happy/surprise
  // dim + cool => sad/fear
  // warm + dim + high red dominance => angry
  const scores = { happy: 0, sad: 0, angry: 0, fear: 0, surprise: 0, neutral: 0 };

  const redDom = r / (g + b + 1e-6);

  scores.happy = Math.max(0, 0.5 * brightness + 0.5 * warmth);
  scores.surprise = Math.max(0, brightness * 0.8 + Math.abs(warmth - 0.5) * 0.2);
  scores.sad = Math.max(0, (1 - brightness) * 0.7 + (1 - warmth) * 0.3);
  scores.fear = Math.max(0, (1 - brightness) * 0.6 + (0.5 - Math.abs(0.5 - warmth)) * 0.2);
  scores.angry = Math.max(0, (1 - brightness) * 0.3 + warmth * 0.4 + Math.min(1, redDom / 2) * 0.3);

  // Neutral as leftover tendency
  const sumKnown = scores.happy + scores.sad + scores.angry + scores.fear + scores.surprise;
  scores.neutral = Math.max(0, 1 - sumKnown * 0.8);

  // Normalize
  let total = 0;
  Object.values(scores).forEach((v) => (total += v));
  const final = {};
  Object.entries(scores).forEach(([k, v]) => (final[k] = v / (total || 1)));

  const emotion = Object.entries(final).sort((a, b) => b[1] - a[1])[0][0];
  return { emotion, scores: final, features: { brightness, warmth, redDom } };
}
