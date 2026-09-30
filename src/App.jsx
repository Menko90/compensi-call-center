import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

const MESI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function emptyKo() {
  return { ko_luce: 0, ko_gas: 0, ko_telco: 0, ko_vas: 0, ko_vas_luce: 0, ko_vas_gas: 0, ko_vas_telco: 0 };
}

function fmtEuro(n) {
  return (n || 0).toLocaleString("it-IT", { style: "currency", currency: "EUR" });
}

function fmtNum(n, decimals = 0) {
  return (n || 0).toLocaleString("it-IT", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

const inputStyle = {
  width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #D8D3C4",
  fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", background: "#FFFDF8",
  color: "#2B2A25", boxSizing: "border-box",
};
const labelStyle = { fontSize: 12, color: "#6B6A5F", marginBottom: 4, display: "block", fontFamily: "'Space Grotesk', sans-serif" };
const cardStyle = { background: "#FFFDF8", border: "1px solid #E4DFCF", borderRadius: 12, padding: 16 };
const catColors = {
  luce: { bg: "#FCEFD2", text: "#7A4E06" },
  gas: { bg: "#DCEBFA", text: "#0C447C" },
  telco: { bg: "#EDE9FB", text: "#3C3489" },
  vas: { bg: "#DFF3EA", text: "#085041" },
};

function AuthScreen() {
  const [mode, setMode] = useState("signin"); // signin | signup
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
    <div style={{ minHeight: "100vh", background: "#F7F4EA", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ ...cardStyle, width: "100%", maxWidth: 360 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Compensi mensili</h1>
        <p style={{ fontSize: 13, color: "#6B6A5F", margin: "0 0 20px" }}>
          {mode === "signin" ? "Accedi al tuo account" : "Crea un nuovo account"}
        </p>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Email</label>
            <input type="email" required style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Password</label>
            <input type="password" required minLength={6} style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p style={{ color: "#A32D2D", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
          {info && <p style={{ color: "#0C447C", fontSize: 13, margin: "0 0 12px" }}>{info}</p>}
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "#2B2A25", color: "#F7F4EA", fontWeight: 500, fontSize: 14 }}>
            {loading ? "Attendere…" : mode === "signin" ? "Accedi" : "Registrati"}
          </button>
        </form>
        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setInfo(""); }}
          style={{ marginTop: 14, background: "none", border: "none", color: "#6B6A5F", fontSize: 13, textDecoration: "underline", width: "100%" }}
        >
          {mode === "signin" ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = no session

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div style={{ minHeight: "100vh", background: "#F7F4EA" }} />;
  }
  if (!session) {
    return <AuthScreen />;
  }
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

  const [form, setForm] = useState({ date: "", hours: "", luce: "", gas: "", cross: "", vas: "" });
  const [editingId, setEditingId] = useState(null);

  const key = monthKey(refDate);
  const label = `${MESI[refDate.getMonth()]} ${refDate.getFullYear()}`;

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
    setForm({ date: "", hours: "", luce: "", gas: "", cross: "", vas: "" });
    setEditingId(null);
  }, [key, load]);

  function changeMonth(delta) {
    const d = new Date(refDate);
    d.setMonth(d.getMonth() + delta);
    setRefDate(d);
  }

  async function saveEntry() {
    if (!form.date || !form.hours) return;
    const row = {
      month: key,
      date: form.date,
      hours: parseFloat(form.hours) || 0,
      luce: parseInt(form.luce) || 0,
      gas: parseInt(form.gas) || 0,
      contratti_telco: parseInt(form.cross) || 0,
      vas: parseInt(form.vas) || 0,
    };
    let error;
    if (editingId) {
      ({ error } = await supabase.from("entries").update(row).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("entries").insert(row));
    }
    if (error) {
      setErrorMsg("Salvataggio non riuscito: " + error.message);
      return;
    }
    setForm({ date: "", hours: "", luce: "", gas: "", cross: "", vas: "" });
    setEditingId(null);
    load(key);
  }

  function startEdit(e) {
    setEditingId(e.id);
    setForm({
      date: e.date,
      hours: String(e.hours),
      luce: String(e.luce),
      gas: String(e.gas),
      cross: String(e.contratti_telco),
      vas: String(e.vas),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ date: "", hours: "", luce: "", gas: "", cross: "", vas: "" });
  }

  async function removeEntry(id) {
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) { setErrorMsg("Eliminazione non riuscita: " + error.message); return; }
    load(key);
  }

  async function updateKoField(field, val) {
    const n = Math.max(0, parseInt(val) || 0);
    const next = { ...ko, [field]: n, month: key };
    setKo(next);
    const { error } = await supabase.from("monthly_ko").upsert(next, { onConflict: "user_id,month" });
    if (error) setErrorMsg("Salvataggio KO non riuscito: " + error.message);
  }

  // --- calcoli compensi ---
  const totalHours = entries.reduce((s, e) => s + Number(e.hours), 0);
  const grossLuce = entries.reduce((s, e) => s + Number(e.luce), 0);
  const grossGas = entries.reduce((s, e) => s + Number(e.gas), 0);
  const grossTelco = entries.reduce((s, e) => s + Number(e.contratti_telco), 0);
  const grossVas = entries.reduce((s, e) => s + Number(e.vas), 0);
  const totaleLordiEsclusiVas = grossLuce + grossGas + grossTelco;

  const resa = totalHours > 0 ? totaleLordiEsclusiVas / totalHours : 0;
  let gettone = 0;
  if (resa >= 0.7) gettone = 20;
  else if (resa >= 0.6) gettone = 15;
  else if (resa >= 0.5) gettone = 5;

  const koLuceTotal = ko.ko_luce + ko.ko_vas_luce;
  const koGasTotal = ko.ko_gas + ko.ko_vas_gas;
  const koTelcoTotal = ko.ko_telco + ko.ko_vas_telco;
  const koVasTotal = ko.ko_vas + ko.ko_vas_luce + ko.ko_vas_gas + ko.ko_vas_telco;

  const nettoLuce = Math.max(0, grossLuce - koLuceTotal);
  const nettoGas = Math.max(0, grossGas - koGasTotal);
  const nettoTelco = Math.max(0, grossTelco - koTelcoTotal);
  const nettoVas = Math.max(0, grossVas - koVasTotal);

  const pagaBase = totalHours * 8.5;
  const provvLuceGas = (nettoLuce + nettoGas) * gettone;
  const provvTelco = nettoTelco * 10;
  const provvVas = nettoVas * 2;
  const guadagnoTotale = pagaBase + provvLuceGas + provvTelco + provvVas;

  // --- netto stimato co.co.co. ---
  const contributiPrev = guadagnoTotale * 0.118;
  const imponibileFiscale = guadagnoTotale - contributiPrev;
  const irpefLorda = imponibileFiscale * 0.23;
  const detrazione = 166.04;
  const irpefNetta = Math.max(0, irpefLorda - detrazione);
  const nettoStimato = guadagnoTotale - contributiPrev - irpefNetta;

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", background: "#F7F4EA", minHeight: "100vh", padding: "20px 16px 40px", color: "#2B2A25" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Compensi mensili</h1>
            <p style={{ fontSize: 12, color: "#6B6A5F", margin: "2px 0 0" }}>{session.user.email}</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} style={{ background: "none", border: "1px solid #D8D3C4", borderRadius: 8, padding: "6px 10px", fontSize: 12, color: "#6B6A5F" }}>
            Esci
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#2B2A25", color: "#F7F4EA", borderRadius: 12, padding: "10px 14px", margin: "16px 0" }}>
          <button onClick={() => changeMonth(-1)} style={{ background: "none", border: "none", color: "#F7F4EA", fontSize: 18 }}>‹</button>
          <span style={{ fontWeight: 500, fontSize: 15, fontFamily: "'IBM Plex Mono', monospace" }}>{label}</span>
          <button onClick={() => changeMonth(1)} style={{ background: "none", border: "none", color: "#F7F4EA", fontSize: 18 }}>›</button>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[["giorni", "Giorni"], ["finemese", "Fine mese"], ["riepilogo", "Riepilogo"]].map(([id, lbl]) => (
            <button key={id} onClick={() => { setTab(id); setShowFiscali(false); }}
              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid " + (tab === id ? "#2B2A25" : "#E4DFCF"),
                background: tab === id ? "#2B2A25" : "#FFFDF8", color: tab === id ? "#F7F4EA" : "#2B2A25", fontSize: 13, fontWeight: 500 }}>
              {lbl}
            </button>
          ))}
        </div>

        {errorMsg && <div style={{ background: "#FCEBEB", color: "#791F1F", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{errorMsg}</div>}

        {loading ? (
          <p style={{ fontSize: 13, color: "#6B6A5F" }}>Caricamento…</p>
        ) : tab === "giorni" ? (
          <div>
            <div style={{ ...cardStyle, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div><label style={labelStyle}>Data</label><input type="date" style={inputStyle} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div><label style={labelStyle}>Ore lavorate</label><input type="number" step="0.5" min="0" style={inputStyle} value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div><label style={labelStyle}>Luce lordi</label><input type="number" min="0" style={inputStyle} value={form.luce} onChange={(e) => setForm({ ...form, luce: e.target.value })} /></div>
                <div><label style={labelStyle}>Gas lordi</label><input type="number" min="0" style={inputStyle} value={form.gas} onChange={(e) => setForm({ ...form, gas: e.target.value })} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div><label style={labelStyle}>Telco lordi</label><input type="number" min="0" style={inputStyle} value={form.cross} onChange={(e) => setForm({ ...form, cross: e.target.value })} /></div>
                <div><label style={labelStyle}>VAS lordi</label><input type="number" min="0" style={inputStyle} value={form.vas} onChange={(e) => setForm({ ...form, vas: e.target.value })} /></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={saveEntry} disabled={!form.date || !form.hours} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: !form.date || !form.hours ? "#D8D3C4" : "#2B2A25", color: "#F7F4EA", fontWeight: 500, fontSize: 14 }}>
                  {editingId ? "Salva modifiche" : "+ Aggiungi giornata"}
                </button>
                {editingId && <button onClick={cancelEdit} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #D8D3C4", background: "#FFFDF8", fontSize: 13 }}>Annulla</button>}
              </div>
            </div>

            {entries.length === 0 ? (
              <p style={{ fontSize: 13, color: "#6B6A5F", textAlign: "center", padding: "20px 0" }}>Nessuna giornata registrata per {label.toLowerCase()}.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {entries.map((e) => (
                  <div key={e.id} style={{ ...cardStyle, padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500 }}>
                        {new Date(e.date + "T00:00:00").toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })} · {fmtNum(e.hours, e.hours % 1 === 0 ? 0 : 1)}h
                      </div>
                      <div style={{ fontSize: 12, color: "#6B6A5F", marginTop: 2 }}>L {e.luce} · G {e.gas} · T {e.contratti_telco} · V {e.vas}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => startEdit(e)} style={{ background: "none", border: "none", color: "#0C447C", padding: 6, fontSize: 12 }}>Modifica</button>
                      <button onClick={() => removeEntry(e.id)} style={{ background: "none", border: "none", color: "#A32D2D", padding: 6, fontSize: 12 }}>Elimina</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : tab === "finemese" ? (
          <div style={cardStyle}>
            <p style={{ fontSize: 13, color: "#6B6A5F", margin: "0 0 14px" }}>
              Inserisci i KO definitivi del mese. Se un contratto base va KO insieme al suo VAS collegato, usa i campi "KO VAS collegati" per incrementare automaticamente entrambi i contatori.
            </p>
            {[["ko_luce", "KO Luce"], ["ko_gas", "KO Gas"], ["ko_telco", "KO Telco"], ["ko_vas", "KO VAS (autonomi)"]].map(([f, lbl]) => (
              <div key={f} style={{ marginBottom: 12 }}>
                <label style={labelStyle}>{lbl}</label>
                <input type="number" min="0" style={inputStyle} value={ko[f]} onChange={(e) => updateKoField(f, e.target.value)} />
              </div>
            ))}
            <div style={{ borderTop: "1px solid #E4DFCF", paddingTop: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#6B6A5F", margin: "0 0 10px" }}>KO VAS collegati a un contratto base andato KO</p>
              {[["ko_vas_luce", "VAS collegati a Luce"], ["ko_vas_gas", "VAS collegati a Gas"], ["ko_vas_telco", "VAS collegati a Telco"]].map(([f, lbl]) => (
                <div key={f} style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>{lbl}</label>
                  <input type="number" min="0" style={inputStyle} value={ko[f]} onChange={(e) => updateKoField(f, e.target.value)} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#6B6A5F", background: "#F0EDE1", borderRadius: 8, padding: "10px 12px" }}>
              KO totali applicati — Luce: {koLuceTotal} · Gas: {koGasTotal} · Telco: {koTelcoTotal} · VAS: {koVasTotal}
            </div>
          </div>
        ) : !showFiscali ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={cardStyle}>
              <p style={{ fontSize: 12, color: "#6B6A5F", margin: "0 0 8px" }}>Ore totali · Resa oraria globale</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 500 }}>{fmtNum(totalHours, 1)}h</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: "#6B6A5F" }}>resa {fmtNum(resa * 100, 1)}%</span>
              </div>
              <p style={{ fontSize: 12,
