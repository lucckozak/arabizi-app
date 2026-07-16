# Audio system

Three layers — each can be turned off in **Settings → Sound**.

## 1. Pronunciation (Arabic words)

Picked automatically per word in this order:

1. **Pre-generated MP3** (ElevenLabs or any other TTS) if the manifest has an entry for that exact Arabic string.
2. **Web Speech API** — the device's built-in TTS (iOS, Safari, Chrome). Free, on-device, offline once the voice file is cached.

If neither is available the speaker icon hides itself.

### Generating MP3s with ElevenLabs (one-time)

```bash
# 1. Get a free key at https://elevenlabs.io
# 2. Run:
ELEVENLABS_API_KEY=sk_xxx node scripts/generate-audio.mjs
```

The script:
- iterates every unique Arabic string in `vocabulary.json`, `phrases.json`, `verbs.json`, `sentences.json`, `dialogues.json`
- requests an MP3 from ElevenLabs for each
- saves them to `public/audio/<sha1>.mp3`
- writes `src/data/audio-manifest.json` mapping `{ "<arabic>": "<filename>" }`
- skips files that already exist (idempotent — safe to re-run after vocab updates)

Default voice is **Rachel** (multilingual v2). Override via env vars:

```bash
ELEVENLABS_VOICE_ID=<id> ELEVENLABS_MODEL_ID=eleven_multilingual_v2 node scripts/generate-audio.mjs
```

Cost: the full vocab is ~2–3k characters, comfortably inside the free-tier 10k/month.

After generation, `npm run build` ships the audio + manifest. The runtime audio service auto-uses them — no app code changes needed.

## 2. Sound effects (correct / wrong)

Synthesized at runtime via the Web Audio API — no audio files required.

- **Correct:** soft two-note chime (C5 → E5)
- **Wrong:** soft descending pair (B♭3 → F3) — gentle, not punitive

Toggleable via **Settings → Sound → Sound effects**.

## 3. Tap-to-pronounce on Arabic text

When **Settings → Sound → Tap to pronounce** is on, every Arabic-text element in the app becomes tappable — tapping plays the pronunciation through the same audio pipeline as the speaker buttons.

Default: on.
