import { Modal } from './Modal';
import {
  personLabel, ownerLabel,
  conjugateArabizi, conjugateArabic, conjugatePastArabizi, conjugatePastArabic,
  possessArabizi, possessArabic,
} from '@/services/conjugationService';

type Topic = 'verb' | 'verbPast' | 'owner' | 'prep' | 'both';

interface Props {
  open: boolean;
  onClose: () => void;
  topic?: Topic;
  exampleVerbRoot?: { root: string; arabicRoot: string; english: string };
  exampleNoun?: { arabic: string; arabizi: string; english: string };
}

const VERB_TABLE = [
  { p: 'I',    rule: 'a + word',         ex: 'ashrab',     ar: 'أشرب' },
  { p: 'youM', rule: 'te + word',        ex: 'teshrab',    ar: 'تشرب' },
  { p: 'youF', rule: 'te + word + een',  ex: 'teshrabeen', ar: 'تشربين' },
  { p: 'youP', rule: 'te + word + oon',  ex: 'teshraboon', ar: 'تشربون' },
  { p: 'we',   rule: 'ne + word',        ex: 'neshrab',    ar: 'نشرب' },
  { p: 'he',   rule: 'ye + word',        ex: 'yeshrab',    ar: 'يشرب' },
  { p: 'she',  rule: 'te + word',        ex: 'teshrab',    ar: 'تشرب' },
  { p: 'they', rule: 'ye + word + oon',  ex: 'yeshraboon', ar: 'يشربون' },
] as const;

const PAST_VERB_TABLE = [
  { p: 'I',    rule: 'word + t',    ex: 'darast',   ar: 'درست' },
  { p: 'youM', rule: 'word + t',    ex: 'darast',   ar: 'درست' },
  { p: 'youF', rule: 'word + tee',  ex: 'darastee', ar: 'درستي' },
  { p: 'youP', rule: 'word + too',  ex: 'darastoo', ar: 'درستوا' },
  { p: 'we',   rule: 'word + na',   ex: 'darasna',  ar: 'درسنا' },
  { p: 'he',   rule: 'word',        ex: 'daras',    ar: 'درس' },
  { p: 'she',  rule: 'word + t',    ex: 'darast',   ar: 'درست' },
  { p: 'they', rule: 'word + aw',   ex: 'darasaw',  ar: 'درسوا' },
] as const;

/** كان (kaan, "was/were") is a hollow irregular verb — its own paradigm, not derivable by simple suffixing. */
const KAAN_TABLE = [
  { p: 'I',    ex: 'kent',   ar: 'كنت' },
  { p: 'youM', ex: 'kent',   ar: 'كنت' },
  { p: 'youF', ex: 'kentee', ar: 'كنتي' },
  { p: 'youP', ex: 'kentoo', ar: 'كنتوا' },
  { p: 'we',   ex: 'kenna',  ar: 'كنا' },
  { p: 'he',   ex: 'kaan',   ar: 'كان' },
  { p: 'she',  ex: 'kanat',  ar: 'كانت' },
  { p: 'they', ex: 'kanaw',  ar: 'كانوا' },
] as const;

const OWNER_TABLE = [
  { p: 'mine',  rule: 'word + y',   ex: 'sayyaarty',    ar: 'سيارتي' },
  { p: 'yourM', rule: 'word + k',   ex: 'sayyaartek',   ar: 'سيارتك' },
  { p: 'yourF', rule: 'word + ch',  ex: 'sayyaartech',  ar: 'سيارتج' },
  { p: 'yourP', rule: 'word + kum', ex: 'sayyaaratkum', ar: 'سيارتكم' },
  { p: 'our',   rule: 'word + na',  ex: 'sayyaaratna',  ar: 'سيارتنا' },
  { p: 'his',   rule: 'word + ah',  ex: 'sayyaartah',   ar: 'سيارته' },
  { p: 'her',   rule: 'word + ha',  ex: 'sayyaarat-ha', ar: 'سيارتها' },
  { p: 'their', rule: 'word + hum', ex: 'sayyaarat-hum','ar': 'سيارتهم' },
] as const;

const PREP_TABLE = [
  { ar: 'في',   az: 'fi',     en: 'in / at',     ex: 'ana fi el bait — I am at home' },
  { ar: 'على',  az: '3ala',   en: 'on',          ex: 'el kitaab 3ala el taawlah — the book is on the table' },
  { ar: 'تحت',  az: 'ta7t',   en: 'under',       ex: 'el qit ta7t el kursi — the cat is under the chair' },
  { ar: 'فوق',  az: 'foog',   en: 'above',       ex: 'el telifoon foog el taawlah — the phone is on the table' },
  { ar: 'جدام', az: 'jeddaam',en: 'in front of', ex: 'also: amaam, geddaam' },
  { ar: 'ورا',  az: 'wara',   en: 'behind',      ex: 'also (MSA): khalf' },
  { ar: 'مع',   az: 'ma3',    en: 'with',        ex: 'also: wiya — ana ma3 sadeeqi' },
  { ar: 'من',   az: 'min',    en: 'from',        ex: 'jaay min el madrasah — coming from school' },
  { ar: 'إلى',  az: 'ila',    en: 'to',          ex: 'also: l — roo7 ila el soog' },
  { ar: 'بين',  az: 'bayn',   en: 'between',     ex: 'bayn el taawlah wo el areeka' },
  { ar: 'عند',  az: '3ind',   en: 'at / by',     ex: 'ana 3ind ummi — at my mom\'s' },
] as const;

export const GrammarSheet = ({ open, onClose, topic = 'both', exampleVerbRoot, exampleNoun }: Props) => (
  <Modal open={open} onClose={onClose} title="Grammar reference">
    {(topic === 'verb' || topic === 'both') && (
      <section className="mb-6">
        <h3 className="font-semibold mb-1">Present-tense verbs</h3>
        <p className="text-xs text-[color:var(--color-muted)] mb-3">
          Drop the leading <span className="font-mono">a-</span> from the dictionary form (the "I" version) to get the root, then add the prefix and suffix below.
        </p>
        <Table
          headers={['Person', 'Rule', 'Example', 'Arabic']}
          cols="grid-cols-[1.2fr_1fr_1fr_1fr]"
          rows={VERB_TABLE.map((r) => {
            const lbl = personLabel[r.p];
            const root = exampleVerbRoot?.root ?? 'shrab';
            const arRoot = exampleVerbRoot?.arabicRoot ?? 'شرب';
            const ex = exampleVerbRoot ? conjugateArabizi(root, r.p) : r.ex;
            const ar = exampleVerbRoot ? conjugateArabic(arRoot, r.p) : r.ar;
            return [
              <span><span className="block font-medium">{lbl.en}</span><span className="text-xs text-[color:var(--color-muted)]">{lbl.arabizi} · <span className="ar">{lbl.arabic}</span></span></span>,
              <span className="font-mono text-xs">{r.rule}</span>,
              <span className="font-medium">{ex}</span>,
              <span className="ar text-lg">{ar}</span>,
            ];
          })}
        />
        {exampleVerbRoot && (
          <p className="text-xs text-[color:var(--color-muted)] mt-2">Example uses: <em>to {exampleVerbRoot.english}</em></p>
        )}
      </section>
    )}

    {(topic === 'verbPast' || topic === 'both') && (
      <section className="mb-6">
        <h3 className="font-semibold mb-1">Past tense <span className="ar text-sm font-normal text-[color:var(--color-muted)]">(الماضي)</span></h3>
        <p className="text-xs text-[color:var(--color-muted)] mb-3">
          Past tense has no prefix — just add the suffix straight to the root. Written Arabic doesn't mark short vowels, so the bare root doubles as the "he" form.
        </p>
        <Table
          headers={['Person', 'Rule', 'Example', 'Arabic']}
          cols="grid-cols-[1.2fr_1fr_1fr_1fr]"
          rows={PAST_VERB_TABLE.map((r) => {
            const lbl = personLabel[r.p];
            const root = exampleVerbRoot?.root ?? 'dres';
            const arRoot = exampleVerbRoot?.arabicRoot ?? 'درس';
            const ex = exampleVerbRoot ? conjugatePastArabizi(root, r.p) : r.ex;
            const ar = exampleVerbRoot ? conjugatePastArabic(arRoot, r.p) : r.ar;
            return [
              <span><span className="block font-medium">{lbl.en}</span><span className="text-xs text-[color:var(--color-muted)]">{lbl.arabizi} · <span className="ar">{lbl.arabic}</span></span></span>,
              <span className="font-mono text-xs">{r.rule}</span>,
              <span className="font-medium">{ex}</span>,
              <span className="ar text-lg">{ar}</span>,
            ];
          })}
        />
        {exampleVerbRoot && (
          <p className="text-xs text-[color:var(--color-muted)] mt-2">Example uses: <em>to {exampleVerbRoot.english}</em></p>
        )}

        <h4 className="font-semibold mt-5 mb-1">كان <span className="font-normal text-[color:var(--color-muted)]">(kaan) — "was / were"</span></h4>
        <p className="text-xs text-[color:var(--color-muted)] mb-3">
          Irregular — the middle root letter drops in most persons. Learn this one by heart; it's also used as an auxiliary before another past verb (e.g. <em>kanaw yeshtaghiloon</em> — "they were working").
        </p>
        <Table
          headers={['Person', 'Arabizi', 'Arabic']}
          cols="grid-cols-[1.2fr_1fr_1fr]"
          rows={KAAN_TABLE.map((r) => {
            const lbl = personLabel[r.p];
            return [
              <span><span className="block font-medium">{lbl.en}</span><span className="text-xs text-[color:var(--color-muted)]">{lbl.arabizi} · <span className="ar">{lbl.arabic}</span></span></span>,
              <span className="font-medium">{r.ex}</span>,
              <span className="ar text-lg">{r.ar}</span>,
            ];
          })}
        />
      </section>
    )}

    {(topic === 'owner' || topic === 'both') && (
      <section className="mb-6">
        <h3 className="font-semibold mb-1">Ownership suffixes</h3>
        <p className="text-xs text-[color:var(--color-muted)] mb-3">
          Add the suffix to the noun. If the noun ends in <span className="ar">ة</span> it becomes <span className="ar">ت</span> first (e.g. <span className="ar">سيارة → سيارت + ك</span>).
        </p>
        <Table
          headers={['Person', 'Rule', 'Example', 'Arabic']}
          cols="grid-cols-[1.2fr_1fr_1fr_1fr]"
          rows={OWNER_TABLE.map((r) => {
            const lbl = ownerLabel[r.p];
            const ex = exampleNoun ? possessArabizi(exampleNoun.arabizi, r.p) : r.ex;
            const ar = exampleNoun ? possessArabic(exampleNoun.arabic, r.p) : r.ar;
            return [
              <span className="font-medium">{lbl.en}</span>,
              <span className="font-mono text-xs">{r.rule}</span>,
              <span className="font-medium">{ex}</span>,
              <span className="ar text-lg">{ar}</span>,
            ];
          })}
        />
        {exampleNoun && (
          <p className="text-xs text-[color:var(--color-muted)] mt-2">Example uses: <em>{exampleNoun.english}</em></p>
        )}
      </section>
    )}

    {(topic === 'prep' || topic === 'both') && (
      <section>
        <h3 className="font-semibold mb-1">Prepositions <span className="ar text-sm font-normal text-[color:var(--color-muted)]">(حروف الجر)</span></h3>
        <p className="text-xs text-[color:var(--color-muted)] mb-3">
          Prepositions are followed by nouns (not verbs) in Emirati Arabic. Some have multiple forms — the dialect form is listed first.
        </p>
        <Table
          headers={['Arabic', 'Arabizi', 'English']}
          cols="grid-cols-[1fr_1fr_1.4fr]"
          rows={PREP_TABLE.map((r) => [
            <span className="ar text-lg">{r.ar}</span>,
            <span className="font-medium">{r.az}</span>,
            <span><span className="block">{r.en}</span><span className="text-xs text-[color:var(--color-muted)]">{r.ex}</span></span>,
          ])}
        />
      </section>
    )}
  </Modal>
);

const Table = ({ headers, rows, cols }: { headers: string[]; rows: React.ReactNode[][]; cols: string }) => (
  <div className="rounded-xl border border-[color:var(--color-line)] overflow-hidden">
    <div className={`grid ${cols} bg-[color:var(--color-bg-soft)] text-xs uppercase tracking-wider text-[color:var(--color-muted)]`}>
      {headers.map((h) => <div key={h} className="px-3 py-2">{h}</div>)}
    </div>
    {rows.map((row, i) => (
      <div key={i} className={`grid ${cols} border-t border-[color:var(--color-line)] text-sm`}>
        {row.map((cell, j) => <div key={j} className="px-3 py-2.5">{cell}</div>)}
      </div>
    ))}
  </div>
);
