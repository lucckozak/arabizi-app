/**
 * Privacy Policy and Terms & Conditions content.
 *
 * IMPORTANT: This is a starter template tailored to the current app architecture
 * (frontend-only, no backend, no tracking, optional pre-generated audio).
 * Before App Store / public launch, REVIEW with a lawyer and customize:
 *   - Effective date
 *   - Contact email / address
 *   - Jurisdiction (governing law)
 *   - Any new data practices added later (push notifications, accounts, IAP, etc.)
 */

const APP_NAME = 'Arabic';
const EFFECTIVE_DATE = '2026-05-10'; // TODO: update before each public release
const CONTACT_EMAIL = 'zayna.emirates@gmail.com';
const JURISDICTION = 'United Arab Emirates'; // TODO: confirm

export const PrivacyPolicyContent = () => (
  <div className="text-[14px] leading-relaxed text-[color:var(--color-ink-soft)] space-y-4">
    <p className="text-xs text-[color:var(--color-muted)]">Effective {EFFECTIVE_DATE}</p>

    <Section title="The short version">
      <p>
        {APP_NAME} runs entirely on your device. We do not have a server, an account system,
        or any analytics tracking your activity. Your progress lives in your browser's local
        storage — it never leaves your device unless you choose to export it.
      </p>
    </Section>

    <Section title="What we store on your device">
      <ul className="list-disc pl-5 space-y-1">
        <li>Quiz progress (which words you've learned, your spaced-repetition schedule)</li>
        <li>Streak and daily goal stats</li>
        <li>Your settings (theme, font size, sound preferences, daily goal)</li>
      </ul>
      <p>
        All of this is held in your browser's <em>localStorage</em>. Clearing your browser
        data erases it. You can export it as a JSON file or import a backup from
        <strong> Settings → Backup</strong>.
      </p>
    </Section>

    <Section title="What we do NOT collect">
      <ul className="list-disc pl-5 space-y-1">
        <li>No accounts, no logins, no email addresses</li>
        <li>No analytics or behavioral tracking</li>
        <li>No advertising identifiers</li>
        <li>No location, contacts, microphone, or camera access</li>
        <li>No third-party trackers or fingerprinting</li>
      </ul>
    </Section>

    <Section title="Audio pronunciation">
      <p>
        Pronunciations are produced two ways:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>System voice (Web Speech API).</strong> Your device's built-in text-to-speech
          generates audio locally. No network request leaves your device.
        </li>
        <li>
          <strong>Pre-generated MP3s.</strong> If audio files were bundled with the app, they
          are static assets served from the same origin. No external service is contacted at runtime.
        </li>
      </ul>
    </Section>

    <Section title="Network requests">
      <p>
        Aside from the initial download and updates of the app itself (and Google Fonts for the
        Arabic and Latin typefaces), {APP_NAME} does not make network requests during use.
      </p>
    </Section>

    <Section title="Children">
      <p>
        {APP_NAME} is suitable for all ages. Because we collect no personal data, COPPA / GDPR-K
        consent flows are not required.
      </p>
    </Section>

    <Section title="Changes to this policy">
      <p>
        If we change how data is handled, the effective date above will be updated and you'll
        see a notice the next time you open the app.
      </p>
    </Section>

    <Section title="Contact">
      <p>
        Questions? <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>
      </p>
    </Section>
  </div>
);

export const TermsContent = () => (
  <div className="text-[14px] leading-relaxed text-[color:var(--color-ink-soft)] space-y-4">
    <p className="text-xs text-[color:var(--color-muted)]">Effective {EFFECTIVE_DATE}</p>

    <Section title="Acceptance">
      <p>
        By using {APP_NAME}, you agree to these terms. If you do not agree, please don't use the app.
      </p>
    </Section>

    <Section title="What the app is">
      <p>
        {APP_NAME} is an educational tool for learning spoken Emirati Gulf Arabic vocabulary
        and basic grammar. It is provided free of charge for personal, non-commercial use.
      </p>
    </Section>

    <Section title="Educational use only">
      <p>
        Translations, pronunciations, and grammar rules are simplified for learners and may
        differ from formal Modern Standard Arabic. {APP_NAME} is not a substitute for a tutor,
        accredited course, or certified translator.
      </p>
    </Section>

    <Section title="No warranty">
      <p>
        The app is provided "as-is" without warranties of any kind. We make no guarantees about
        accuracy, availability, or fitness for any particular purpose. To the extent permitted by
        law, we are not liable for any losses arising from your use of the app.
      </p>
    </Section>

    <Section title="Your content">
      <p>
        Your progress and settings belong to you. We don't claim any rights over the data you
        generate by using the app.
      </p>
    </Section>

    <Section title="App content">
      <p>
        The vocabulary, phrases, dialogues, design, and code of {APP_NAME} are protected by
        copyright. You may use the app for personal learning. Redistribution, resale, or commercial
        use of the content requires written permission.
      </p>
    </Section>

    <Section title="Acceptable use">
      <p>
        Don't reverse-engineer the app, abuse third-party services it depends on, or use it to
        harass others. Pretty standard stuff.
      </p>
    </Section>

    <Section title="Changes">
      <p>
        We may update these terms over time. Continued use after a change means you accept the
        revised terms.
      </p>
    </Section>

    <Section title="Governing law">
      <p>
        These terms are governed by the laws of {JURISDICTION}.
      </p>
    </Section>

    <Section title="Contact">
      <p>
        Reach us at <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>.
      </p>
    </Section>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="font-semibold text-[color:var(--color-ink)] mb-1.5">{title}</h3>
    {children}
  </div>
);
