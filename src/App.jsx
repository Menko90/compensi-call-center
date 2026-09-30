import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

const MESI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

const CAT = {
  luce: { label: "Luce", short: "L", color: "#F59E0B", bg: "#FBEFD9" },
  gas: { label: "Gas", short: "G", color: "#10B981", bg: "#DCF2E8" },
  telco: { label: "Telco", short: "T", color: "#6366F1", bg: "#E5E4F8" },
  vas: { label: "VAS", short: "V", color: "#F43F5E", bg: "#FBDFE4" },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap');
* { box-sizing: border-box; }
body { margin: 0; }
.app { min-height: 100vh; font-family: 'Inter', sans-serif; color: #1E2433; padding: 20px 16px 48px;
  background:
    radial-gradient(circle at 0% 0%, #BFD3F7 0%, rgba(191,211,247,0) 45%),
    radial-gradient(circle at 100% 45%, #F2EADB 0%, rgba(242,234,219,0) 40%),
    radial-gradient(circle at 50% 95%, #D9DDF9 0%, rgba(217,221,249,0) 50%),
    #EDF1F9; }
.wrap { max-width: 520px; margin: 0 auto; }
.disp { font-family: 'Space Grotesk', sans-serif; }
.header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 16px; }
.brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.logo { width: 48px; height: 48px; border-radius: 50%; background: #2563EB; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 20px; box-shadow: 0 8px 20px rgba(37,99,235,.35); flex-shrink: 0; }
.brand h1 { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 18px; }
.logo img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
.uname { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; text-transform: capitalize; }
.brand p { margin: 0; font-size: 12px; color: #6B7280; }
.logout { background: none; border: none; padding: 0; font-size: 12px; color: #2563EB; text-decoration: underline; cursor: pointer; font-family: inherit; }
.month { display: flex; align-items: center; background: rgba(255,255,255,.6); border: 1px solid rgba(255,255,255,.95); border-radius: 999px; padding: 8px 6px; box-shadow: 0 4px 16px rgba(30,36,51,.06); }
.month span { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 15px; text-align: center; min-width: 92px; line-height: 1.2; }
.month button { background: none; border: none; font-size: 22px; color: #374151; padding: 0 8px; cursor: pointer; }
.tabs { display: flex; background: rgba(255,255,255,.45); border-radius: 999px; padding: 5px; margin-bottom: 18px; }
.tabs button { flex: 1; border: none; background: none; padding: 10px 0; border-radius: 999px; font-size: 14px; font-weight: 500; color: #6B7280; cursor: pointer; font-family: inherit; }
.tabs button.on { background: #fff; color: #111827; font-weight: 600; box-shadow: 0 4px 12px rgba(30,36,51,.08); }
.stack { display: flex; flex-direction: column; gap: 14px; }
.card { background: rgba(255,255,255,.72); border: 1px solid rgba(255,255,255,.95); border-radius: 24px; padding: 18px; box-shadow: 0 6px 24px rgba(30,36,51,.05); }
.card h2 { margin: 0 0 4px; font-family: 'Space Grotesk', sans-serif; font-size: 18px; }
.muted { color: #6B7280; font-size: 13px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.stat-label { font-size: 13px; color: #6B7280; display: flex; justify-content: space-between; align-items: center; gap: 6px; }
.stat-val { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 28px; margin-top: 8px; white-space: nowrap; }
.grid3 .stat-val { font-size: 21px; }
.grid3 .card { padding: 14px; }
.stat-val small { font-size: 15px; color: #9CA3AF; font-weight: 500; margin-left: 4px; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.big { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 46px; line-height: 1.1; }
.big small { font-size: 22px; color: #9CA3AF; font-weight: 500; margin-left: 8px; }
.eyebrow { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #6B7280; }
.tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 14px; }
.tile { border-radius: 16px; padding: 10px; }
.tile .tl { font-size: 12px; color: #6B7280; margin-top: 8px; }
.tile .tv { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 20px; }
.sec-head { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
.sec-head h2 { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 19px; }
.btn-primary { background: #2563EB; color: #fff; border: none; border-radius: 999px; padding: 11px 18px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; box-shadow: 0 8px 18px rgba(37,99,235,.3); }
.btn-primary:disabled { background: #A5B4D4; box-shadow: none; }
.btn-ghost { background: #EEF0F4; color: #4B5563; border: none; border-radius: 999px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
.btn-danger { background: #FDE2E7; color: #E11D48; border: none; border-radius: 999px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
.day-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.acts { display: flex; gap: 6px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.chip { border-radius: 999px; padding: 4px 11px; font-size: 13px; font-weight: 600; }
.field label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #4B5563; margin-bottom: 8px; }
.inp { width: 100%; background: rgba(255,255,255,.9); border: 1px solid #EEF0F4; border-radius: 18px; padding: 14px 16px; font-size: 17px; font-family: inherit; color: #1E2433; outline: none; }
.inp:focus { border-color: #93B4F5; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
.row { display: grid; grid-template-columns: 1fr 60px 50px 60px; align-items: center; padding: 12px 0; border-bottom: 1px solid #EDEFF3; font-size: 16px; }
.row:last-child { border-bottom: none; }
.row.head { font-size: 11px; letter-spacing: .1em; color: #6B7280; padding-top: 4px; }
.row .r { text-align: right; }
.cat { display: flex; align-items: center; gap: 10px; font-weight: 600; }
.line { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #EDEFF3; font-size: 15px; }
.line:last-child { border-bottom: none; }
.line span:first-child { color: #6B7280; }
.line span:last-child { font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
.dark { border-radius: 24px; padding: 20px; color: #fff; }
.dark .eyebrow { color: #AEB6CC; }
.dark .big { color: #fff; }
.dark-1 { background: linear-gradient(120deg, #1B2233 0%, #1E3A6E 100%); }
.dark-2 { background: linear-gradient(120deg, #2E3571 0%, #1B2233 100%); }
.btn-dark { background: rgba(255,255,255,.14); color: #fff; border: none; border-radius: 999px; padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; }
.err { background: #FDE2E7; color: #9F1239; border-radius: 16px; padding: 10px 14px; font-size: 13px; margin-bottom: 14px; }
.back { background: none; border: none; color: #2563EB; font-size: 14px; font-weight: 600; padding: 0; margin-bottom: 14px; cursor: pointer; font-family: inherit; }
.note { font-size: 12px; color: #6B7280; margin-top: 14px; line-height: 1.5; }
.link { background: none; border: none; color: #6B7280; font-size: 13px; text-decoration: underline; width: 100%; margin-top: 14px; cursor: pointer; font-family: inherit; }
`;

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function emptyKo() {
  return { ko_luce: 0, ko_gas: 0, ko_telco: 0, ko_vas: 0, ko_vas_luce: 0, ko_vas_gas: 0, ko_vas_telco: 0 };
}
function fmtEuro(n) {
  return (n || 0).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}
function fmtNum(n, decimals = 0) {
  return (n || 0).toLocaleString("it-IT", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtDay(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
}
const emptyForm = { date: "", hours: "", luce: "", gas: "", telco: "", vas: "" };

function Dot({ color }) {
  return <span className="dot" style={{ background: color }} />;
}

function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setError(error.message);
        else setInfo("Registrazione avviata. Controlla la tua email per confermare l'account, poi accedi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{CSS}</style>
      <div className="card" style={{ width: "100%", maxWidth: 380 }}>
        <div className="brand" style={{ marginBottom: 18 }}>
          <div className="logo">€</div>
          <div>
            <h1>Compensi mensili</h1>
            <p>{mode === "signin" ? "Accedi al tuo account" : "Crea un nuovo account"}</p>
          </div>
        </div>
        <form onSubmit={submit} className="stack">
          <div className="field">
            <label>Email</label>
            <input className="inp" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="inp" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="err" style={{ margin: 0 }}>{error}</div>}
          {info && <div className="muted">{info}</div>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Attendere…" : mode === "signin" ? "Accedi" : "Registrati"}
          </button>
        </form>
        <button className="link" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setInfo(""); }}>
          {mode === "signin" ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <div className="app"><style>{CSS}</style></div>;
  if (!session) return <AuthScreen />;
  return <MainApp session={session} />;
}

function MainApp({ session }) {
  const [refDate, setRefDate] = useState(new Date());
  const [tab, setTab] = useState("giorni");
  const [showFiscali, setShowFiscali] = useState(false);
  const [entries, setEntries] = useState([]);
  const [ko, setKo] = useState(emptyKo());
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const key = monthKey(refDate);
  const userId = session.user.id;
  const meta = session.user.user_metadata || {};
  const avatarUrl = meta.avatar_url || meta.picture || "";
  const displayName = meta.full_name || meta.name
    ? (meta.full_name || meta.name).split(" ")[0]
    : (session.user.email || "").split("@")[0];
  const initial = (displayName || "?").charAt(0).toUpperCase();

  const load = useCallback(async (k) => {
    setLoading(true);
    setErrorMsg("");
    const { data: e, error: e1 } = await supabase.from("entries").select("*").eq("month", k).order("date");
    if (e1) setErrorMsg("Errore nel caricamento delle giornate: " + e1.message);
    setEntries(e || []);
    const { data: kRow, error: e2 } = await supabase.from("monthly_ko").select("*").eq("month", k).maybeSingle();
    if (e2) setErrorMsg((prev) => prev || "Errore nel caricamento dei KO: " + e2.message);
    setKo(kRow || emptyKo());
    setLoading(false);
  }, []);

  useEffect(() => {
    load(key);
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  }, [key, load]);

  function changeMonth(delta) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() + delta, 1);
    setRefDate(d);
  }

  function openNew() {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setEditingId(null);
    setForm({ ...emptyForm, date: todayIso.startsWith(key) ? todayIso : `${key}-01` });
    setShowForm(true);
  }

  function startEdit(e) {
    setEditingId(e.id);
    setForm({
      date: e.date,
      hours: String(e.hours),
      luce: String(e.luce),
      gas: String(e.gas),
      telco: String(e.contratti_telco),
      vas: String(e.vas),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  async function saveEntry() {
    if (!form.date || !form.hours) return;
    const row = {
      user_id: userId,
      month: form.date.slice(0, 7),
      date: form.date,
      hours: parseFloat(String(form.hours).replace(",", ".")) || 0,
      luce: parseInt(form.luce) || 0,
      gas: parseInt(form.gas) || 0,
      contratti_telco: parseInt(form.telco) || 0,
      vas: parseInt(form.vas) || 0,
    };
    const { error } = editingId
      ? await supabase.from("entries").update(row).eq("id", editingId)
      : await supabase.from("entries").insert(row);
    if (error) {
      setErrorMsg("Salvataggio non riuscito: " + error.message);
      return;
    }
    closeForm();
    load(key);
  }

  async function removeEntry(id) {
    if (!window.confirm("Eliminare questa giornata?")) return;
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) { setErrorMsg("Eliminazione non riuscita: " + error.message); return; }
    load(key);
  }

  async function updateKoField(field, val) {
    const n = Math.max(0, parseInt(val) || 0);
    const next = { ...ko, [field]: n, month: key, user_id: userId };
    setKo(next);
    const { error } = await supabase.from("monthly_ko").upsert(next, { onConflict: "user_id,month" });
    if (error) setErrorMsg("Salvataggio KO non riuscito: " + error.message);
  }

  // --- calcoli compensi ---
  const totalHours = entries.reduce((s, e) => s + Number(e.hours), 0);
  const gross = {
    luce: entries.reduce((s, e) => s + Number(e.luce), 0),
    gas: entries.reduce((s, e) => s + Number(e.gas), 0),
    telco: entries.reduce((s, e) => s + Number(e.contratti_telco), 0),
    vas: entries.reduce((s, e) => s + Number(e.vas), 0),
  };
  const totaleLordi = gross.luce + gross.gas + gross.telco;

  const resa = totalHours > 0 ? totaleLordi / totalHours : 0;
  let gettone = 0;
  if (resa >= 0.7) gettone = 20;
  else if (resa >= 0.6) gettone = 15;
  else if (resa >= 0.5) gettone = 5;

  const koTot = {
    luce: ko.ko_luce + ko.ko_vas_luce,
    gas: ko.ko_gas + ko.ko_vas_gas,
    telco: ko.ko_telco + ko.ko_vas_telco,
    vas: ko.ko_vas + ko.ko_vas_luce + ko.ko_vas_gas + ko.ko_vas_telco,
  };
  const netti = {
    luce: Math.max(0, gross.luce - koTot.luce),
    gas: Math.max(0, gross.gas - koTot.gas),
    telco: Math.max(0, gross.telco - koTot.telco),
    vas: Math.max(0, gross.vas - koTot.vas),
  };

  const pagaBase = totalHours * 8.5;
  const provvLuceGas = (netti.luce + netti.gas) * gettone;
  const provvTelco = netti.telco * 10;
  const provvVas = netti.vas * 2;
  const guadagnoTotale = pagaBase + provvLuceGas + provvTelco + provvVas;

  // --- netto stimato co.co.co. ---
  const contributiPrev = guadagnoTotale * 0.118;
  const imponibileFiscale = guadagnoTotale - contributiPrev;
  const irpefLorda = imponibileFiscale * 0.23;
  const detrazione = 166.04;
  const irpefNetta = Math.max(0, irpefLorda - detrazione);
  const nettoStimato = guadagnoTotale - contributiPrev - irpefNetta;

  const catKeys = ["luce", "gas", "telco", "vas"];

  return (
    <div className="app">
      <style>{CSS}</style>
      <div className="wrap">
        <div className="header">
          <div className="brand">
            <div className="logo">
              {avatarUrl ? <img src={avatarUrl} alt="" referrerPolicy="no-referrer" /> : initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 className="uname">{displayName}</h1>
              <button className="logout" onClick={() => supabase.auth.signOut()}>Esci</button>
            </div>
          </div>
          <div className="month">
            <button onClick={() => changeMonth(-1)} aria-label="Mese precedente">‹</button>
            <span>{MESI[refDate.getMonth()]}<br />{refDate.getFullYear()}</span>
            <button onClick={() => changeMonth(1)} aria-label="Mese successivo">›</button>
          </div>
        </div>

        <div className="tabs">
          {[["giorni", "Giorni"], ["finemese", "Fine mese"], ["riepilogo", "Riepilogo"]].map(([id, lbl]) => (
            <button key={id} className={tab === id ? "on" : ""} onClick={() => { setTab(id); setShowFiscali(false); }}>{lbl}</button>
          ))}
        </div>

        {errorMsg && <div className="err">{errorMsg}</div>}

        {loading ? (
          <p className="muted">Caricamento…</p>
        ) : tab === "giorni" ? (
          <div className="stack">
            <div className="grid2">
              <div className="card">
                <div className="stat-label">Ore totali <Dot color="#9CA3AF" /></div>
                <div className="stat-val">{fmtNum(totalHours, totalHours % 1 === 0 ? 0 : 1)}<small>h</small></div>
              </div>
              <div className="card">
                <div className="stat-label">Resa oraria <Dot color="#2563EB" /></div>
                <div className="stat-val">{fmtNum(resa, 2)}<small>/h</small></div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <h2>Contratti lordi · mese</h2>
                <span className="muted">Luce + Gas + Telco</span>
              </div>
              <div className="big">{totaleLordi}<small>contratti</small></div>
              <div className="tiles">
                {catKeys.map((k) => (
                  <div key={k} className="tile" style={{ background: CAT[k].bg }}>
                    <Dot color={CAT[k].color} />
                    <div className="tl">{CAT[k].label}</div>
                    <div className="tv" style={{ color: CAT[k].color }}>{gross[k]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sec-head">
              <h2>Giornate</h2>
              {!showForm && <button className="btn-primary" onClick={openNew}>+ Aggiungi</button>}
            </div>

            {showForm && (
              <div className="card">
                <h2>{editingId ? "Modifica giornata" : "Nuova giornata"}</h2>
                <div className="form-grid">
                  <div className="field">
                    <label>Data</label>
                    <input className="inp" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Ore lavorate</label>
                    <input className="inp" type="number" inputMode="decimal" step="0.5" min="0" placeholder="0" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
                  </div>
                  {catKeys.map((k) => (
                    <div key={k} className="field">
                      <label><Dot color={CAT[k].color} />{CAT[k].label} lordi</label>
                      <input className="inp" type="number" inputMode="numeric" min="0" placeholder="0" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={saveEntry} disabled={!form.date || !form.hours}>
                    {editingId ? "Salva modifiche" : "Salva giornata"}
                  </button>
                  <button className="btn-ghost" onClick={closeForm}>Annulla</button>
                </div>
              </div>
            )}

            {entries.length === 0 ? (
              <p className="muted" style={{ textAlign: "center", padding: "16px 0" }}>Nessuna giornata registrata per questo mese.</p>
            ) : (
              entries.map((e) => (
                <div key={e.id} className="card">
                  <div className="day-top">
                    <span className="muted" style={{ fontSize: 15 }}>
                      {fmtDay(e.date)}&nbsp;&nbsp;<span style={{ color: "#1E2433" }}>{fmtNum(Number(e.hours), Number(e.hours) % 1 === 0 ? 0 : 1)} h</span>
                    </span>
                    <div className="acts">
                      <button className="btn-ghost" onClick={() => startEdit(e)}>Modifica</button>
                      <button className="btn-danger" onClick={() => removeEntry(e.id)}>Elimina</button>
                    </div>
                  </div>
                  <div className="chips">
                    {[["luce", e.luce], ["gas", e.gas], ["telco", e.contratti_telco], ["vas", e.vas]].map(([k, v]) => (
                      <span key={k} className="chip" style={{ background: CAT[k].bg, color: CAT[k].color }}>{CAT[k].short} {v}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : tab === "finemese" ? (
          <div className="stack">
            <div className="card">
              <h2>KO definitivi</h2>
              <p className="muted" style={{ margin: 0 }}>Inserimento manuale a fine mese.</p>
              <div className="form-grid">
                {catKeys.map((k) => (
                  <div key={k} className="field">
                    <label><Dot color={CAT[k].color} />KO {CAT[k].label}</label>
                    <input className="inp" type="number" inputMode="numeric" min="0" placeholder="0"
                      value={ko["ko_" + k] ? ko["ko_" + k] : ""} onChange={(e) => updateKoField("ko_" + k, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h2>KO VAS collegati</h2>
              <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>
                Contratti base andati KO che avevano un VAS associato: si sommano sia al KO del servizio base sia al KO VAS totale.
              </p>
              <div className="stack" style={{ marginTop: 14 }}>
                {["luce", "gas", "telco"].map((k) => (
                  <div key={k} className="field">
                    <label><Dot color={CAT[k].color} />KO VAS collegati a {CAT[k].label}</label>
                    <input className="inp" type="number" inputMode="numeric" min="0" placeholder="0"
                      value={ko["ko_vas_" + k] ? ko["ko_vas_" + k] : ""} onChange={(e) => updateKoField("ko_vas_" + k, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
            <p className="muted" style={{ textAlign: "center", margin: 0 }}>
              KO totali applicati — Luce {koTot.luce} · Gas {koTot.gas} · Telco {koTot.telco} · VAS {koTot.vas}
            </p>
          </div>
        ) : !showFiscali ? (
          <div className="stack">
            <div className="grid3">
              <div className="card"><div className="stat-label">Ore totali</div><div className="stat-val">{fmtNum(totalHours, 1)}</div></div>
              <div className="card"><div className="stat-label">Resa oraria</div><div className="stat-val">{fmtNum(resa * 100, 1)}%</div></div>
              <div className="card"><div className="stat-label">Gettone</div><div className="stat-val">{gettone}€</div></div>
            </div>

            <div className="card">
              <div className="eyebrow">Contratti lordi · Luce + Gas + Telco</div>
              <div className="big">{totaleLordi}</div>
            </div>

            <div className="card">
              <h2>Netti per categoria</h2>
              <div className="row head"><span>CATEGORIA</span><span className="r">LORDI</span><span className="r">KO</span><span className="r">NETTI</span></div>
              {catKeys.map((k) => (
                <div key={k} className="row">
                  <span className="cat"><Dot color={CAT[k].color} />{CAT[k].label}</span>
                  <span className="r">{gross[k]}</span>
                  <span className="r" style={{ color: "#6B7280" }}>{koTot[k]}</span>
                  <span className="r disp" style={{ color: CAT[k].color, fontWeight: 700 }}>{netti[k]}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <h2>Scomposizione guadagno</h2>
              <div className="line"><span>Paga base (8,50 €/h)</span><span>{fmtEuro(pagaBase)}</span></div>
              <div className="line"><span>Provvigioni Luce + Gas</span><span>{fmtEuro(provvLuceGas)}</span></div>
              <div className="line"><span>Provvigioni Telco</span><span>{fmtEuro(provvTelco)}</span></div>
              <div className="line"><span>Provvigioni VAS</span><span>{fmtEuro(provvVas)}</span></div>
            </div>

            <div className="dark dark-1">
              <div className="eyebrow">Guadagno totale</div>
              <div className="big" style={{ marginTop: 8 }}>{fmtEuro(guadagnoTotale)}</div>
            </div>

            <div className="dark dark-2">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div className="eyebrow" style={{ lineHeight: 1.6 }}>Netto stimato · co.co.co.</div>
                <button className="btn-dark" onClick={() => setShowFiscali(true)}>Dettagli fiscali</button>
              </div>
              <div className="big" style={{ marginTop: 8 }}>{fmtEuro(nettoStimato)}</div>
            </div>
          </div>
        ) : (
          <div className="card">
            <button className="back" onClick={() => setShowFiscali(false)}>← Torna al Riepilogo</button>
            <h2>Dettagli fiscali</h2>
            <div className="line"><span>Guadagno totale (lordo)</span><span>{fmtEuro(guadagnoTotale)}</span></div>
            <div className="line"><span>Contributi previdenziali (11,80%)</span><span>{fmtEuro(contributiPrev)}</span></div>
            <div className="line"><span>Imponibile fiscale</span><span>{fmtEuro(imponibileFiscale)}</span></div>
            <div className="line"><span>IRPEF lorda (23%)</span><span>{fmtEuro(irpefLorda)}</span></div>
            <div className="line"><span>Detrazione applicata</span><span>{fmtEuro(detrazione)}</span></div>
            <div className="line"><span>IRPEF netta</span><span>{fmtEuro(irpefNetta)}</span></div>
            <div className="line"><span>Netto stimato</span><span>{fmtEuro(nettoStimato)}</span></div>
            <p className="note">
              Stima basata su aliquota IRPEF 23% flat e detrazione da lavoro dipendente fissa a 166,04 €/mese, calibrate sui cedolini reali. Valida finché il reddito annuo cumulato resta sotto i 28.000 €.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
