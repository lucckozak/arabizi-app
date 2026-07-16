import { useRef, useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { PrivacyPolicyContent, TermsContent } from '@/components/LegalDocs';
import { useAppStore } from '@/store/useAppStore';

export const Settings = () => {
  const settings = useAppStore((s) => s.settings);
  const setSetting = useAppStore((s) => s.setSetting);
  const exportJSON = useAppStore((s) => s.exportJSON);
  const importJSON = useAppStore((s) => s.importJSON);
  const resetAll = useAppStore((s) => s.resetAll);
  const fileInput = useRef<HTMLInputElement>(null);
  const [legalView, setLegalView] = useState<null | 'privacy' | 'terms'>(null);

  const onExport = () => {
    const data = exportJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = (file: File) => {
    file.text().then((text) => {
      const result = importJSON(text);
      alert(result.ok ? 'Imported' : `Import failed: ${result.error ?? 'unknown'}`);
    });
  };

  return (
    <div>
      <SettingsGroup label="Learning">
        <Row label="Show Arabizi" hint="Latin transliteration under Arabic script.">
          <Toggle checked={settings.showArabizi} onChange={(v) => setSetting('showArabizi', v)} />
        </Row>
        <Divider />
        <Row label="Daily goal" hint="Cards reviewed per day.">
          <Select value={String(settings.dailyGoal)} onChange={(v) => setSetting('dailyGoal', Number(v))}
            options={[10, 20, 30, 50, 100].map((n) => ({ value: String(n), label: String(n) }))} />
        </Row>
      </SettingsGroup>

      <SettingsGroup label="Sound">
        <Row label="Sound effects" hint="Chime on correct, soft buzz on wrong.">
          <Toggle checked={settings.soundEffects} onChange={(v) => setSetting('soundEffects', v)} />
        </Row>
        <Divider />
        <Row label="Tap to pronounce" hint="Tap any Arabic word to hear it spoken.">
          <Toggle checked={settings.tapToPronounce} onChange={(v) => setSetting('tapToPronounce', v)} />
        </Row>
      </SettingsGroup>

      <SettingsGroup label="Quiz length" hint="How many questions per session.">
        <Row label="Multiple choice">
          <Select
            value={String(settings.quizSize.mcq)}
            onChange={(v) => setSetting('quizSize', { ...settings.quizSize, mcq: Number(v) })}
            options={[5, 10, 15, 20].map((n) => ({ value: String(n), label: `${n} questions` }))}
          />
        </Row>
        <Divider />
        <Row label="Type the answer">
          <Select
            value={String(settings.quizSize.text)}
            onChange={(v) => setSetting('quizSize', { ...settings.quizSize, text: Number(v) })}
            options={[5, 10, 15, 20].map((n) => ({ value: String(n), label: `${n} questions` }))}
          />
        </Row>
        <Divider />
        <Row label="Matching pairs">
          <Select
            value={String(settings.quizSize.match)}
            onChange={(v) => setSetting('quizSize', { ...settings.quizSize, match: Number(v) })}
            options={[4, 6, 8, 12].map((n) => ({ value: String(n), label: `${n} pairs` }))}
          />
        </Row>
        <Divider />
        <Row label="Sentence completion">
          <Select
            value={String(settings.quizSize.sentence)}
            onChange={(v) => setSetting('quizSize', { ...settings.quizSize, sentence: Number(v) })}
            options={[4, 6, 8, 10].map((n) => ({ value: String(n), label: `${n} questions` }))}
          />
        </Row>
        <Divider />
        <Row label="Grammar drills" hint="Verb conjugation, ownership, prepositions.">
          <Select
            value={String(settings.quizSize.grammar)}
            onChange={(v) => setSetting('quizSize', { ...settings.quizSize, grammar: Number(v) })}
            options={[5, 10, 15, 20].map((n) => ({ value: String(n), label: `${n} questions` }))}
          />
        </Row>
      </SettingsGroup>

      <SettingsGroup label="Appearance">
        <Row label="Theme">
          <Select
            value={settings.darkMode}
            onChange={(v) => setSetting('darkMode', v as 'light' | 'dark' | 'system')}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
        </Row>
        <Divider />
        <Row label="Font size">
          <Select
            value={settings.fontSize}
            onChange={(v) => setSetting('fontSize', v as 'sm' | 'md' | 'lg' | 'xl')}
            options={[
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
              { value: 'xl', label: 'Extra large' },
            ]}
          />
        </Row>
      </SettingsGroup>

      <SettingsGroup label="Backup">
        <p className="text-sm text-[color:var(--color-muted)] mb-4 leading-relaxed">
          Export your progress, settings and SRS schedule to a JSON file. Import to restore.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onExport}>Export</Button>
          <Button variant="secondary" onClick={() => fileInput.current?.click()}>Import</Button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onImportFile(f); e.target.value = ''; }}
        />
      </SettingsGroup>

      <SettingsGroup label="Legal">
        <Row label="Privacy Policy" hint="What we store, what we don't.">
          <button
            onClick={() => setLegalView('privacy')}
            className="text-sm font-semibold text-[color:var(--color-brand-strong)] hover:underline"
          >View ›</button>
        </Row>
        <Divider />
        <Row label="Terms & Conditions" hint="Educational use, no warranty.">
          <button
            onClick={() => setLegalView('terms')}
            className="text-sm font-semibold text-[color:var(--color-brand-strong)] hover:underline"
          >View ›</button>
        </Row>
      </SettingsGroup>

      <SettingsGroup label="Danger zone" tone="danger">
        <p className="text-sm text-[color:var(--color-muted)] mb-4 leading-relaxed">
          Reset all progress. This cannot be undone.
        </p>
        <Button
          variant="danger"
          full
          onClick={() => { if (confirm('Reset all progress and settings?')) resetAll(); }}
        >Reset everything</Button>
      </SettingsGroup>

      <p className="text-center text-[11px] text-[color:var(--color-muted)] mt-2 mb-1">Arabic · UAE dialect · MVP</p>

      <Modal open={legalView === 'privacy'} onClose={() => setLegalView(null)} title="Privacy Policy">
        <PrivacyPolicyContent />
      </Modal>
      <Modal open={legalView === 'terms'} onClose={() => setLegalView(null)} title="Terms & Conditions">
        <TermsContent />
      </Modal>
    </div>
  );
};

const SettingsGroup = ({ label, hint, tone, children }: { label: string; hint?: string; tone?: 'danger'; children: React.ReactNode }) => (
  <section className="mb-5">
    <div className="flex items-baseline justify-between gap-3 mb-2 px-1">
      <h3 className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
        tone === 'danger' ? 'text-[color:var(--color-wrong)]' : 'text-[color:var(--color-muted)]'
      }`}>{label}</h3>
      {hint && <p className="text-[11px] text-[color:var(--color-muted)] truncate">{hint}</p>}
    </div>
    <Card>{children}</Card>
  </section>
);

const Row = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 py-1.5">
    <div className="min-w-0 flex-1">
      <div className="font-medium text-[15px]">{label}</div>
      {hint && <div className="text-xs text-[color:var(--color-muted)] mt-0.5 leading-snug">{hint}</div>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const Divider = () => <div className="h-px bg-[color:var(--color-line)] my-2" />;

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`w-12 h-7 rounded-full relative transition-colors flex-shrink-0 ${checked ? 'bg-[color:var(--color-brand)]' : 'bg-[color:var(--color-line-strong)]'}`}
    aria-pressed={checked}
  >
    <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
  </button>
);

const Select = <T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) => (
  <select
    className="bg-[color:var(--color-bg-soft)] border border-[color:var(--color-line)] rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--color-ink)] focus:border-[color:var(--color-brand)] focus:outline-none"
    value={value}
    onChange={(e) => onChange(e.target.value as T)}
  >
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);
