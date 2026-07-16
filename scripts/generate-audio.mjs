#!/usr/bin/env node
/**
 * Generate Arabic pronunciation MP3s from ElevenLabs.
 *
 * Run once (or whenever vocab changes):
 *   ELEVENLABS_API_KEY=sk_xxx node scripts/generate-audio.mjs
 *
 * Output:
 *   public/audio/<sha1>.mp3       — one MP3 per unique Arabic string
 *   src/data/audio-manifest.json  — { "<arabic text>": "<sha1>.mp3" }
 *
 * The runtime audio service auto-uses these MP3s if the manifest contains
 * an entry for the requested text, falling back to Web Speech otherwise.
 *
 * Costs: ~2-3k characters total for the current vocab — well within the
 * ElevenLabs free tier (10k chars/month).
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel (multilingual v2)
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const OUT_DIR = path.join(ROOT, 'public', 'audio');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'audio-manifest.json');

if (!KEY) {
  console.error('Missing ELEVENLABS_API_KEY environment variable.');
  console.error('Get a key at https://elevenlabs.io and run:');
  console.error('  ELEVENLABS_API_KEY=sk_xxx node scripts/generate-audio.mjs');
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

const readJson = async (rel) => JSON.parse(await readFile(path.join(ROOT, 'src', 'data', rel), 'utf-8'));

const vocabulary = await readJson('vocabulary.json');
const phrases = await readJson('phrases.json');
const verbs = await readJson('verbs.json');
const sentences = await readJson('sentences.json');
const dialogues = await readJson('dialogues.json');

const arabicStrings = new Set();
for (const w of vocabulary) arabicStrings.add(w.arabic);
for (const w of phrases) arabicStrings.add(w.arabic);
for (const v of verbs) arabicStrings.add(v.firstPersonArabic);
for (const s of sentences) {
  arabicStrings.add(s.answer.arabic);
  arabicStrings.add(s.arabic.replace(/___+/g, s.answer.arabic));
}
for (const d of dialogues) {
  for (const b of d.blanks) arabicStrings.add(b.answer.arabic);
}

console.log(`Generating audio for ${arabicStrings.size} unique strings → ${path.relative(ROOT, OUT_DIR)}/`);
console.log(`Voice: ${VOICE_ID} · Model: ${MODEL_ID}`);
console.log('');

const manifest = {};
let generated = 0;
let cached = 0;
let failed = 0;

for (const text of arabicStrings) {
  const hash = crypto.createHash('sha1').update(text).digest('hex').slice(0, 12);
  const filename = `${hash}.mp3`;
  manifest[text] = filename;
  const out = path.join(OUT_DIR, filename);

  if (existsSync(out)) {
    cached++;
    continue;
  }

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`  ✗ ${text} → ${res.status} ${body.slice(0, 200)}`);
      failed++;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(out, buf);
    generated++;
    console.log(`  ✓ ${text}  (${(buf.length / 1024).toFixed(1)} KB)`);
  } catch (e) {
    console.error(`  ✗ ${text} → ${e?.message ?? e}`);
    failed++;
  }
}

await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

console.log('');
console.log(`Done. ${generated} generated, ${cached} cached, ${failed} failed.`);
console.log(`Manifest written: ${path.relative(ROOT, MANIFEST_PATH)}`);
