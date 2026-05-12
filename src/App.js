import { useState, useCallback } from 'react';

const C = {
  primary: '#6C5CE7',
  primaryHover: '#5A4BD1',
  primaryLight: '#EEE9FF',
  bg: '#F7F8FF',
  surface: '#FFFFFF',
  border: '#E2E3F0',
  text: '#1A1B2E',
  muted: '#6B7280',
  success: '#10B981',
  error: '#EF4444',
  tag: '#F0EFFF',
  tagText: '#6C5CE7',
};
const F = { body: "'Outfit', system-ui, sans-serif", mono: "'DM Mono', monospace" };

function ProfileModal({ profile, onChange, onClose }) {
  const fields = [
    { key: 'firstName', label: 'Prénom', ph: 'Jean-Philippe' },
    { key: 'email', label: 'Courriel', ph: 'jp@example.com' },
    { key: 'phone', label: 'Téléphone', ph: '819-555-0000' },
    { key: 'experience', label: 'Expérience', ph: '2 ans en service à la clientèle...', multi: true },
    { key: 'skills', label: 'Compétences', ph: 'Service client, caisse, MS Office...', multi: true },
    { key: 'education', label: 'Formation', ph: 'DEC en administration, Cégep...', multi: true },
    { key: 'languages', label: 'Langues', ph: 'Français (natif), Anglais (intermédiaire)' },
  ];
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${C.border}`, fontFamily: F.body, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: C.surface, borderRadius: 16, padding: 32, width: '90%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(108,92,231,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: F.body, fontSize: 20, fontWeight: 700, color: C.text }}>Mon Profil</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: C.muted, lineHeight: 1 }}>×</button>
        </div>
        {fields.map(({ key, label, ph, multi }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 5 }}>{label}</label>
            {multi
              ? <textarea value={profile[key]} onChange={e => onChange(key, e.target.value)} placeholder={ph} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              : <input value={profile[key]} onChange={e => onChange(key, e.target.value)} placeholder={ph} style={inputStyle} />
            }
          </div>
        ))}
        <button onClick={onClose} style={{ width: '100%', padding: 12, background: C.primary, color: '#fff', border: 'none', borderRadius: 10, fontFamily: F.body, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

function ManualJobForm({ onAdd, onClose }) {
  const [form, setForm] = useState({ title: '', company: '', location: '', type: '', salary: '', url: '' });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const submit = () => {
    if (!form.title || !form.company) return;
    onAdd({ ...form, id: `manual_${Date.now()}`, tags: ['Ajout manuel'] });
    onClose();
  };
  const fields = [
    { k: 'title', l: 'Titre *', ph: 'Caissier' }, { k: 'company', l: 'Entreprise *', ph: 'IGA' },
    { k: 'location', l: 'Lieu', ph: 'Gatineau, QC' }, { k: 'type', l: 'Type', ph: 'Temps partiel' },
    { k: 'salary', l: 'Salaire', ph: '18$/h' }, { k: 'url', l: 'URL offre', ph: 'https://...' },
  ];
  return (
    <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 24, marginTop: 10 }}>
      <h3 style={{ fontFamily: F.body, fontSize: 15, fontWeight: 700, marginBottom: 16, color: C.text }}>Ajouter manuellement</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {fields.map(({ k, l, ph }) => (
          <div key={k}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>{l}</label>
            <input value={form[k]} onChange={e => f(k, e.target.value)} placeholder={ph}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${C.border}`, fontFamily: F.body, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button onClick={submit} style={{ padding: '9px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontFamily: F.body, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Ajouter</button>
        <button onClick={onClose} style={{ padding: '9px 20px', background: 'none', color: C.muted, border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: F.body, fontSize: 14, cursor: 'pointer' }}>Annuler</button>
      </div>
    </div>
  );
}

function JobCard({ job, selected, onToggle }) {
  return (
    <div onClick={onToggle} style={{ background: selected ? C.primaryLight : C.surface, border: `2px solid ${selected ? C.primary : C.border}`, borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none' }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${selected ? C.primary : C.border}`, background: selected ? C.primary : 'white', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {selected && <span style={{ color: 'white', fontSize: 11, fontWeight: 800 }}>✓</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</div>
          <div style={{ fontFamily: F.body, fontSize: 13, color: C.muted, marginBottom: 2 }}>{job.company}</div>
          <div style={{ fontFamily: F.body, fontSize: 12, color: C.muted, marginBottom: 8 }}>
            📍 {job.location} · {job.type}{job.salary && job.salary !== 'Non précisé' ? ` · ${job.salary}` : ''}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {(job.tags || []).slice(0, 3).map((t, i) => (
              <span key={i} style={{ background: C.tag, color: C.tagText, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontFamily: F.body, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
          {job.url && job.url.startsWith('http') && (
            <a href={job.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
              style={{ display: 'inline-block', marginTop: 6, fontSize: 12, color: C.primary, fontFamily: F.body, textDecoration: 'none' }}>
              Voir l'offre →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ job, result, onEmail }) {
  const [tab, setTab] = useState('letter');
  const content = tab === 'letter' ? result.letter : result.cv;
  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{ padding: '6px 16px', background: tab === id ? C.primary : 'transparent', color: tab === id ? 'white' : C.muted, border: `1.5px solid ${tab === id ? C.primary : C.border}`, borderRadius: 8, fontFamily: F.body, fontSize: 13, fontWeight: tab === id ? 700 : 400, cursor: 'pointer' }}>
      {label}
    </button>
  );
  return (
    <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
        <div>
          <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 16, color: C.text }}>{job.title}</div>
          <div style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>{job.company} · {job.location}</div>
        </div>
        {!result.isGenerating && result.letter && (
          <button onClick={() => onEmail(job, result)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: C.success, color: 'white', border: 'none', borderRadius: 8, fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
            ✉ Envoyer
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <TabBtn id="letter" label="Lettre de motivation" />
        <TabBtn id="cv" label="Résumé CV" />
      </div>
      <div style={{ minHeight: 120, fontFamily: F.mono, fontSize: 13, color: C.text, lineHeight: 1.75, whiteSpace: 'pre-wrap', background: '#FAFAFE', borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
        {content
          ? <>{content}{result.isGenerating && <span style={{ color: C.primary }}>▊</span>}</>
          : result.isGenerating
            ? <span style={{ color: C.muted }}>⚡ Génération en cours...</span>
            : <span style={{ color: C.muted }}>En attente...</span>
        }
      </div>
    </div>
  );
}

function parseContent(raw) {
  const lm = raw.match(/===LETTRE===([\s\S]*?)(?====CV===|$)/);
  const cm = raw.match(/===CV===([\s\S]*?)$/);
  return { letter: lm ? lm[1].trim() : '', cv: cm ? cm[1].trim() : '' };
}

export default function App() {
  const [profile, setProfile] = useState({ firstName: '', email: '', phone: '', experience: '', skills: '', education: '', languages: '' });
  const [showProfile, setShowProfile] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [results, setResults] = useState({});
  const [searchError, setSearchError] = useState('');

  const updateProfile = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const toggleJob = id => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const searchJobs = useCallback(async (resetList = false) => {
    if (!query.trim()) return;
    setIsSearching(true); setSearchError('');
    try {
      const res = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: query.trim() }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setJobs(prev => {
        if (resetList) return data;
        const ids = new Set(prev.map(j => j.id));
        return [...prev, ...data.filter(j => !ids.has(j.id))];
      });
      setLastUpdated(new Date());
    } catch (err) { setSearchError(err.message); }
    finally { setIsSearching(false); }
  }, [query]);

  const applyToSelected = async () => {
    const toApply = jobs.filter(j => selected.has(j.id));
    if (!toApply.length) return;
    setIsApplying(true);

    for (const job of toApply) {
      setResults(p => ({ ...p, [job.id]: { letter: '', cv: '', raw: '', isGenerating: true } }));
      try {
        const res = await fetch('/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job, profile }) });
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split('\n'); buf = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6);
            if (payload === '[DONE]') break;
            try {
              const { text, error } = JSON.parse(payload);
              if (error) throw new Error(error);
              if (text) setResults(p => {
                const cur = p[job.id];
                const raw = (cur.raw ?? '') + text;
                return { ...p, [job.id]: { ...cur, raw, ...parseContent(raw) } };
              });
            } catch { /* skip malformed */ }
          }
        }
      } catch (err) { console.error(err); }
      setResults(p => p[job.id] ? { ...p, [job.id]: { ...p[job.id], isGenerating: false } } : p);
    }
    setIsApplying(false);
  };

  const sendEmail = (job, result) => {
    const sub = encodeURIComponent(`Candidature – ${job.title} chez ${job.company}`);
    const body = encodeURIComponent(`LETTRE DE MOTIVATION\n${'─'.repeat(40)}\n${result.letter}\n\n\nRÉSUMÉ CV\n${'─'.repeat(40)}\n${result.cv}`);
    window.open(`mailto:?subject=${sub}&body=${body}`);
  };

  const resultJobs = jobs.filter(j => results[j.id]);

  return (
    <div style={{ fontFamily: F.body, background: C.bg, minHeight: '100vh', color: C.text }}>
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 12px rgba(108,92,231,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26 }}>🤖</span>
          <span style={{ fontWeight: 800, fontSize: 19, color: C.primary, letterSpacing: '-0.3px' }}>Auto-Apply IA</span>
        </div>
        <button onClick={() => setShowProfile(true)} style={{ padding: '7px 16px', background: C.primaryLight, color: C.primary, border: 'none', borderRadius: 8, fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {profile.firstName ? `👤 ${profile.firstName}` : '👤 Mon Profil'}
        </button>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '36px 20px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: '-0.5px' }}>Trouve et postule en quelques clics</h1>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>L'IA cherche des offres réelles, génère ta lettre de motivation et ton CV adaptés au poste.</p>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchJobs()}
            placeholder="ex: emploi temps partiel Gatineau, caissier Hull..."
            style={{ flex: 1, padding: '11px 16px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontFamily: F.body, fontSize: 14, outline: 'none', background: C.surface }} />
          <button onClick={() => searchJobs()} disabled={isSearching || !query.trim()}
            style={{ padding: '11px 22px', background: isSearching || !query.trim() ? '#C4BCFC' : C.primary, color: 'white', border: 'none', borderRadius: 10, fontFamily: F.body, fontSize: 14, fontWeight: 700, cursor: isSearching || !query.trim() ? 'not-allowed' : 'pointer', minWidth: 110 }}>
            {isSearching ? '⏳ ...' : '🔍 Chercher'}
          </button>
        </div>

        {lastUpdated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.muted, marginBottom: 16 }}>
            Dernière mise à jour: {lastUpdated.toLocaleTimeString('fr-CA')}
            <button onClick={() => searchJobs()} disabled={isSearching} title="Rafraîchir"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: C.primary, padding: 0, lineHeight: 1 }}>↻</button>
          </div>
        )}

        {searchError && <div style={{ background: '#FEE2E2', color: C.error, padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>⚠️ {searchError}</div>}

        {/* Job grid */}
        {jobs.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 12 }}>
              {jobs.length} offre{jobs.length > 1 ? 's' : ''} trouvée{jobs.length > 1 ? 's' : ''}
              {selected.size > 0 && <span style={{ color: C.primary }}> · {selected.size} sélectionnée{selected.size > 1 ? 's' : ''}</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
              {jobs.map(j => <JobCard key={j.id} job={j} selected={selected.has(j.id)} onToggle={() => toggleJob(j.id)} />)}
            </div>
          </div>
        )}

        {/* Manual add */}
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => setShowManual(v => !v)}
            style={{ background: 'none', border: `1.5px dashed ${C.border}`, borderRadius: 10, padding: '10px 18px', fontFamily: F.body, fontSize: 13, color: C.muted, cursor: 'pointer', width: '100%' }}>
            {showManual ? '− Fermer' : '+ Ajouter une offre manuellement'}
          </button>
          {showManual && <ManualJobForm onAdd={j => { setJobs(p => [j, ...p]); setShowManual(false); }} onClose={() => setShowManual(false)} />}
        </div>

        {/* Apply button */}
        {selected.size > 0 && (
          <div style={{ marginBottom: 32 }}>
            <button onClick={applyToSelected} disabled={isApplying}
              style={{ width: '100%', padding: 14, background: isApplying ? '#C4BCFC' : C.primary, color: 'white', border: 'none', borderRadius: 12, fontFamily: F.body, fontSize: 16, fontWeight: 800, cursor: isApplying ? 'not-allowed' : 'pointer', letterSpacing: '-0.2px' }}>
              {isApplying ? '⚡ Génération des candidatures...' : `✉ Postuler aux ${selected.size} offre${selected.size > 1 ? 's' : ''} sélectionnée${selected.size > 1 ? 's' : ''}`}
            </button>
          </div>
        )}

        {/* Results */}
        {resultJobs.length > 0 && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 16 }}>📄 Candidatures générées</h2>
            {resultJobs.map(j => <ResultCard key={j.id} job={j} result={results[j.id]} onEmail={sendEmail} />)}
          </div>
        )}

        {/* Empty state */}
        {jobs.length === 0 && !isSearching && (
          <div style={{ textAlign: 'center', padding: '56px 20px', color: C.muted }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: C.text }}>Lance une recherche pour commencer</div>
            <div style={{ fontSize: 14 }}>Entre des mots-clés comme "emploi temps partiel Gatineau"</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>N'oublie pas de remplir ton <button onClick={() => setShowProfile(true)} style={{ background: 'none', border: 'none', color: C.primary, cursor: 'pointer', fontFamily: F.body, fontSize: 13, fontWeight: 700, padding: 0, textDecoration: 'underline' }}>profil</button> pour des candidatures personnalisées</div>
          </div>
        )}
      </main>

      {showProfile && <ProfileModal profile={profile} onChange={updateProfile} onClose={() => setShowProfile(false)} />}
    </div>
  );
}
