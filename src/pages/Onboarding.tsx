import { useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { PrivacyPolicyContent, TermsContent } from '@/components/LegalDocs';
import { useAppStore } from '@/store/useAppStore';

/** Detects iOS Safari (not in standalone mode) so we can show install instructions. */
const useIsIosSafari = (): boolean => useMemo(() => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
  const isStandalone = (window.matchMedia('(display-mode: standalone)').matches)
    || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return isIos && isSafari && !isStandalone;
}, []);

export const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [showArabizi, setShowArabizi] = useState(true);
  const [goal, setGoal] = useState(20);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [legalView, setLegalView] = useState<null | 'privacy' | 'terms'>(null);
  const complete = useAppStore((s) => s.completeOnboarding);
  const isIosSafari = useIsIosSafari();

  const screens = [
    {
      title: 'Hala wallah',
      subtitle: "Learn spoken Emirati Arabic. Real words you'll hear in Dubai and Abu Dhabi — 10 minutes a day.",
      content: (
        <div className="text-center mt-10">
          <div className="mx-auto w-44 h-44 rounded-[40px] bg-gradient-to-br from-[color:var(--color-brand)] to-[color:var(--color-accent)] flex items-center justify-center shadow-[var(--shadow-pop)]">
            <span className="ar text-white text-[64px] font-bold leading-none">مرحبا</span>
          </div>
          <p className="text-[color:var(--color-muted)] mt-4 text-sm tracking-wide">mar7aba — welcome</p>
        </div>
      ),
    },
    {
      title: 'Show Arabizi?',
      subtitle: 'Latin transliteration shown under the Arabic. Helpful at first — turn off when you can read the script.',
      content: (
        <div className="mt-7 grid grid-cols-2 gap-3">
          <ChoiceCard active={showArabizi} onClick={() => setShowArabizi(true)} label="On">
            <div className="ar text-[40px] font-semibold leading-none">أشرب</div>
            <div className="text-xs text-[color:var(--color-muted)] mt-1">ashrab</div>
          </ChoiceCard>
          <ChoiceCard active={!showArabizi} onClick={() => setShowArabizi(false)} label="Off">
            <div className="ar text-[40px] font-semibold leading-none">أشرب</div>
            <div className="text-xs text-transparent select-none mt-1">·</div>
          </ChoiceCard>
        </div>
      ),
    },
    {
      title: 'Daily goal',
      subtitle: 'How many cards do you want to review each day? You can change this any time in Settings.',
      content: (
        <div className="mt-7 grid grid-cols-2 gap-3">
          {[10, 20, 30, 50].map((n) => (
            <ChoiceCard key={n} active={goal === n} onClick={() => setGoal(n)} label={n === 10 ? 'Casual' : n === 20 ? 'Recommended' : n === 30 ? 'Serious' : 'Intense'}>
              <div className="text-[40px] font-bold leading-none tracking-tight">{n}</div>
              <div className="text-xs text-[color:var(--color-muted)] mt-1">cards / day</div>
            </ChoiceCard>
          ))}
        </div>
      ),
    },
    {
      title: 'Use it like an app',
      subtitle: 'Add this web app to your home screen for full-screen, offline access — no App Store needed.',
      content: (
        <div className="mt-6">
          {isIosSafari ? <IosInstallInstructions /> : <GenericInstallInstructions />}
        </div>
      ),
    },
    {
      title: 'Privacy & Terms',
      subtitle: "Quick read — we don't collect anything. Your progress lives only on your device.",
      content: (
        <div className="mt-6 flex flex-col gap-3">
          <LegalLink label="Privacy Policy" sub="What we store, what we don't, where it goes." onClick={() => setLegalView('privacy')} />
          <LegalLink label="Terms & Conditions" sub="Educational use, no warranty, your content stays yours." onClick={() => setLegalView('terms')} />
          <button
            type="button"
            onClick={() => setAcceptedLegal((v) => !v)}
            aria-pressed={acceptedLegal}
            className={`mt-4 w-full flex items-start gap-3 text-left px-4 py-3.5 rounded-xl border-2 transition-colors active:scale-[0.99] ${
              acceptedLegal
                ? 'border-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)]'
                : 'border-[color:var(--color-line-strong)] bg-[color:var(--color-surface)]'
            }`}
          >
            <span
              className={`mt-0.5 w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${
                acceptedLegal
                  ? 'bg-[color:var(--color-brand)] border-2 border-[color:var(--color-brand)]'
                  : 'bg-[color:var(--color-surface)] border-2 border-[color:var(--color-line-strong)]'
              }`}
              aria-hidden="true"
            >
              {acceptedLegal && (
                <svg viewBox="0 0 16 16" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 8.5 6.5 12 13 4.5" />
                </svg>
              )}
            </span>
            <span className="text-[14px] leading-snug text-[color:var(--color-ink-soft)]">
              I agree to the <span className="font-semibold text-[color:var(--color-ink)]">Privacy Policy</span> and <span className="font-semibold text-[color:var(--color-ink)]">Terms & Conditions</span>.
            </span>
          </button>
        </div>
      ),
    },
  ];

  const current = screens[step];
  const isLast = step === screens.length - 1;
  const progress = (step + 1) / screens.length;
  const canProceed = !isLast || acceptedLegal;

  return (
    <div
      className="min-h-svh max-w-xl mx-auto px-6 flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="pt-10 flex-1">
        <div className="h-1.5 rounded-full bg-[color:var(--color-line)] overflow-hidden mb-10">
          <div className="h-full bg-[color:var(--color-brand)] transition-all duration-300" style={{ width: `${progress * 100}%` }} />
        </div>
        <h1 className="text-[34px] leading-[1.05] font-bold tracking-tight mb-3">{current.title}</h1>
        <p className="text-[15px] text-[color:var(--color-muted)] leading-relaxed">{current.subtitle}</p>
        {current.content}
      </div>
      <div className="pt-6 pb-8 flex flex-col gap-2">
        <Button
          full
          onClick={() => (isLast ? complete(goal, showArabizi) : setStep(step + 1))}
          disabled={!canProceed}
        >
          {isLast ? "Let's go" : 'Continue'}
        </Button>
        {step > 0 && (
          <Button variant="ghost" full onClick={() => setStep(step - 1)}>Back</Button>
        )}
      </div>

      <Modal open={legalView === 'privacy'} onClose={() => setLegalView(null)} title="Privacy Policy">
        <PrivacyPolicyContent />
      </Modal>
      <Modal open={legalView === 'terms'} onClose={() => setLegalView(null)} title="Terms & Conditions">
        <TermsContent />
      </Modal>
    </div>
  );
};

const ChoiceCard = ({ active, onClick, children, label }: { active: boolean; onClick: () => void; children: React.ReactNode; label?: string }) => (
  <button
    onClick={onClick}
    className={`min-h-[140px] rounded-2xl p-5 text-left flex flex-col justify-between transition-all duration-150 ${
      active
        ? 'bg-[color:var(--color-brand-soft)] border-2 border-[color:var(--color-brand)] shadow-[var(--shadow-card)]'
        : 'bg-[color:var(--color-surface)] border-2 border-[color:var(--color-line)] hover:border-[color:var(--color-line-strong)]'
    }`}
  >
    <div className="flex flex-col items-start">{children}</div>
    {label && (
      <div className={`text-xs font-semibold mt-3 ${active ? 'text-[color:var(--color-brand-strong)]' : 'text-[color:var(--color-muted)]'}`}>
        {label}
      </div>
    )}
  </button>
);

const InstallStep = ({ n, label, children }: { n: number; label: string; children?: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-strong)] flex items-center justify-center text-[13px] font-bold">{n}</span>
    <div className="flex-1 pt-0.5">
      <p className="text-[14px] font-medium text-[color:var(--color-ink)]">{label}</p>
      {children && <p className="text-[12px] text-[color:var(--color-muted)] mt-0.5 leading-snug">{children}</p>}
    </div>
  </li>
);

const IosInstallInstructions = () => (
  <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-line)] rounded-2xl p-5">
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brand-strong)] mb-3">iPhone · Safari</p>
    <ol className="flex flex-col gap-3.5">
      <InstallStep n={1} label="Tap the Share button">
        It's the square with an upward arrow at the bottom of Safari.
      </InstallStep>
      <InstallStep n={2} label='Choose "Add to Home Screen"'>
        Scroll the share menu down — it sits with the system actions.
      </InstallStep>
      <InstallStep n={3} label='Tap "Add"' >
        The app installs an icon on your home screen and launches full-screen — no Safari bar.
      </InstallStep>
    </ol>
  </div>
);

const GenericInstallInstructions = () => (
  <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-line)] rounded-2xl p-5">
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brand-strong)] mb-3">Add to home screen</p>
    <ol className="flex flex-col gap-3.5">
      <InstallStep n={1} label="Open the browser menu">
        Look for the three-dot or three-line icon in your browser's toolbar.
      </InstallStep>
      <InstallStep n={2} label='Choose "Install app" or "Add to Home screen"'>
        Wording varies by browser (Chrome, Edge, Firefox, Samsung Internet).
      </InstallStep>
      <InstallStep n={3} label="Confirm">
        The app launches like any installed app, with offline support after the first visit.
      </InstallStep>
    </ol>
    <p className="text-[11px] text-[color:var(--color-muted)] mt-4">
      On iPhone, open this app in Safari first, then tap the Share icon → Add to Home Screen.
    </p>
  </div>
);

const LegalLink = ({ label, sub, onClick }: { label: string; sub: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between gap-3 text-left rounded-2xl px-4 py-3.5 bg-[color:var(--color-surface)] border border-[color:var(--color-line)] hover:bg-[color:var(--color-surface-2)] active:scale-[0.99] transition-all"
  >
    <span className="flex-1 min-w-0">
      <span className="block font-semibold text-[color:var(--color-ink)] text-[15px] leading-tight">{label}</span>
      <span className="block text-xs text-[color:var(--color-muted)] mt-0.5">{sub}</span>
    </span>
    <span className="text-[color:var(--color-muted)] flex-shrink-0">›</span>
  </button>
);
