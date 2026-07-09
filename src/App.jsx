import React, { useState, useEffect, useCallback } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { supabase } from "./supabaseClient.js";

const ITEMS = [
  ["A","Me cuesta dormir porque estoy pensando en cosas del insti.",false],
  ["A","Cuando tengo un examen o trabajo importante, me pongo muy nervioso/a.",false],
  ["A","Sé calmarme cuando algo me estresa.",true],
  ["A","Me siento agobiado/a por la cantidad de tareas y exámenes.",false],
  ["A","Cuando tengo un problema, encuentro la forma de resolverlo sin agobiarme demasiado.",true],
  ["A","Tengo dolores de cabeza, tripa o cansancio sin motivo físico claro.",false],
  ["A","Siento que tengo tiempo suficiente para hacer todo lo que tengo que hacer.",true],
  ["A","Me cuesta relajarme incluso en mi tiempo libre.",false],
  ["B","Tengo un horario o momento fijo para estudiar cada día.",false],
  ["B","Dejo los trabajos y el estudio para el último día.",true],
  ["B","Cuando estudio, entiendo lo que estoy leyendo o aprendiendo.",false],
  ["B","Me distraigo con el móvil u otras cosas mientras estudio.",true],
  ["B","Preparo el material (libreta, libro, apuntes) antes de ponerme a estudiar.",false],
  ["B","Sé organizar mi tiempo entre estudiar, descansar y hacer otras cosas.",false],
  ["B","Cuando no entiendo algo, pregunto o busco ayuda.",false],
  ["B","Estudio solo memorizando, sin entender de verdad.",true],
  ["C","En general, estoy contento/a con cómo soy.",false],
  ["C","Creo que tengo cosas buenas igual que mis compañeros/as.",false],
  ["C","Muchas veces pienso que no valgo para nada.",true],
  ["C","Me siento capaz de conseguir las cosas que me propongo.",false],
  ["C","Me comparo con otros/as y siento que no doy la talla.",true],
  ["C","Me gusta mi forma de ser.",false],
  ["C","Cuando algo me sale mal, pienso que soy un desastre en general.",true],
  ["C","Confío en mis propias opiniones y decisiones.",false],
  ["D","Me resulta fácil hacer amigos/as.",false],
  ["D","Sé decir que no cuando algo no me parece bien, sin miedo.",false],
  ["D","Me cuesta hablar o participar en grupo.",true],
  ["D","Si tengo un problema con un compañero/a, sé cómo hablarlo.",false],
  ["D","Me siento incómodo/a en situaciones sociales nuevas.",true],
  ["D","Escucho a los demás cuando tienen algo que decir.",false],
  ["D","Prefiero estar solo/a antes que con otros compañeros/as.",true],
  ["D","Sé pedir ayuda a otras personas cuando la necesito.",false],
  ["E","Me siento a gusto en el instituto.",false],
  ["E","Siento que tengo al menos un/a amigo/a de confianza en clase.",false],
  ["E","Alguna vez me he sentido excluido/a o tratado/a mal por compañeros/as.",true],
  ["E","Siento que puedo hablar con algún adulto del centro si tengo un problema.",false],
  ["E","Me llevo bien con la mayoría de mis profesores/as.",false],
  ["E","En casa siento que me apoyan con el tema de estudios.",false],
];

const BLOQUES = {
  A: "Gestión del estrés", B: "Hábitos de estudio", C: "Autoestima",
  D: "Habilidades sociales", E: "Clima escolar/apoyo"
};
const COLORS = { A:"#c2694a", B:"#4a7a8c", C:"#8c6a4a", D:"#5a8c6a", E:"#7a5a8c" };
const OPCIONES = [
  {v:1,l:"Nunca"},
  {v:2,l:"A veces"},
  {v:3,l:"Muchas veces"},
  {v:4,l:"Siempre"},
];

function correct(val, inv){ return inv ? 5 - val : val; }

function blockScores(answers){
  const sums = {}, counts = {};
  ITEMS.forEach((it, i) => {
    const [b, , inv] = it;
    const raw = answers[i];
    if (raw == null) return;
    const c = correct(raw, inv);
    sums[b] = (sums[b]||0) + c;
    counts[b] = (counts[b]||0) + 1;
  });
  const out = {};
  Object.keys(BLOQUES).forEach(b => { out[b] = counts[b] ? +(sums[b]/counts[b]).toFixed(2) : null; });
  return out;
}

export default function App(){
  const [tab, setTab] = useState("responder");

  return (
    <div style={{fontFamily:"'Georgia', serif", background:"#f6f3ee", minHeight:"100vh", color:"#2c2620"}}>
      <div style={{maxWidth:900, margin:"0 auto", padding:"32px 20px"}}>
        <header style={{marginBottom:28, borderBottom:"2px solid #2c2620", paddingBottom:14}}>
          <h1 style={{fontSize:28, margin:"4px 0 0"}}>Cuestionario de Orientación</h1>
        </header>

        <nav style={{display:"flex", gap:8, marginBottom:24}}>
          <button onClick={()=>setTab("responder")} style={tabStyle(tab==="responder")}>Responder</button>
          <button onClick={()=>setTab("panel")} style={tabStyle(tab==="panel")}>Panel de orientación</button>
        </nav>

        {tab==="responder" && <FormularioAlumno />}
        {tab==="panel" && <PanelAcceso />}
      </div>
    </div>
  );
}

function tabStyle(active){
  return {
    padding:"8px 18px", border:"1px solid #2c2620", background: active ? "#2c2620" : "transparent",
    color: active ? "#f6f3ee" : "#2c2620", cursor:"pointer", fontFamily:"inherit", fontSize:14, borderRadius:2
  };
}
const inputStyle = {display:"block", width:"100%", padding:"10px 12px", margin:"10px 0", border:"1px solid #b8ac9a", borderRadius:2, fontFamily:"inherit", fontSize:14, boxSizing:"border-box"};
const btnPrimary = {padding:"10px 20px", background:"#c2694a", color:"#fff", border:"none", borderRadius:2, cursor:"pointer", fontFamily:"inherit", fontSize:14};

function FormularioAlumno(){
  const [codigo, setCodigo] = useState("");
  const [clase, setClase] = useState("");
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [libre, setLibre] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const total = ITEMS.length;

  const submit = useCallback(async () => {
    if (!codigo.trim() || !clase.trim()) { setError("Falta código de alumno/a o clase."); return; }
    setEnviando(true);
    const scores = blockScores(answers);
    const { error: err } = await supabase.from("respuestas_orientacion").insert({
      codigo: codigo.trim(), clase: clase.trim(), scores, libre
    });
    setEnviando(false);
    if (err) { setError("No se pudo guardar: " + err.message); return; }
    setEnviado(true);
  }, [codigo, clase, answers, libre]);

  if (enviado) return <div style={{padding:20, background:"#e8ede8", borderRadius:4}}>Respuesta guardada. Gracias.</div>;

  if (step === 0) {
    return (
      <div style={{maxWidth:420}}>
        <p style={{color:"#5a5248", fontSize:14}}>Introduce tu código de alumno/a (el que te ha dado tu tutor/a) y tu clase. No escribas tu nombre completo.</p>
        <input style={inputStyle} placeholder="Código de alumno/a" value={codigo} onChange={e=>setCodigo(e.target.value)} />
        <input style={inputStyle} placeholder="Clase (ej. 1ºA)" value={clase} onChange={e=>setClase(e.target.value)} />
        {error && <div style={{color:"#c2694a", fontSize:13}}>{error}</div>}
        <button style={btnPrimary} onClick={()=>{ if(!codigo.trim()||!clase.trim()){setError("Falta código o clase.");return;} setError(""); setStep(1); }}>Empezar</button>
      </div>
    );
  }

  if (step >= 1 && step <= total) {
    const i = step - 1;
    const [bloque, texto] = ITEMS[i];
    return (
      <div style={{maxWidth:520}}>
        <div style={{fontSize:12, color:"#8c6a4a", marginBottom:6}}>{BLOQUES[bloque]} · pregunta {step} de {total}</div>
        <div style={{fontSize:18, marginBottom:16}}>{texto}</div>
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {OPCIONES.map(op => (
            <button key={op.v} onClick={()=>{ setAnswers(a=>({...a,[i]:op.v})); setStep(step+1); }}
              style={{textAlign:"left", padding:"12px 14px", border:"1px solid #b8ac9a", background: answers[i]===op.v ? "#2c2620" : "#fff", color: answers[i]===op.v ? "#fff" : "#2c2620", borderRadius:2, cursor:"pointer", fontFamily:"inherit", fontSize:14}}>
              {op.v}. {op.l}
            </button>
          ))}
        </div>
        {step>1 && <button onClick={()=>setStep(step-1)} style={{marginTop:14, background:"none", border:"none", color:"#8c6a4a", cursor:"pointer", fontSize:13}}>← Anterior</button>}
      </div>
    );
  }

  return (
    <div style={{maxWidth:520}}>
      <div style={{fontSize:12, color:"#8c6a4a", marginBottom:6}}>Última pregunta (opcional)</div>
      <div style={{fontSize:18, marginBottom:16}}>¿Hay algo que te preocupe o te gustaría contar a tu tutor/a u orientadora?</div>
      <textarea style={{...inputStyle, height:100}} value={libre} onChange={e=>setLibre(e.target.value)} placeholder="Puedes dejarlo en blanco" />
      <button style={btnPrimary} disabled={enviando} onClick={submit}>{enviando ? "Enviando..." : "Enviar respuestas"}</button>
      {error && <div style={{color:"#c2694a", fontSize:13, marginTop:8}}>{error}</div>}
    </div>
  );
}

function PanelAcceso(){
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(null); // null = no probado, true/false = resultado
  const [tryVal, setTryVal] = useState("");
  const [checking, setChecking] = useState(false);

  const tryUnlock = async () => {
    setChecking(true);
    const res = await fetch(`/api/respuestas?secret=${encodeURIComponent(tryVal)}`);
    setChecking(false);
    if (res.status === 401) { setUnlocked(false); return; }
    setSecret(tryVal);
    setUnlocked(true);
  };

  if (unlocked) return <PanelOrientacion secret={secret} />;

  return (
    <div style={{maxWidth:360}}>
      <p style={{fontSize:14, color:"#5a5248"}}>Código de acceso del panel (definido en las variables de entorno de Vercel, no en el código).</p>
      <input type="password" value={tryVal} onChange={e=>setTryVal(e.target.value)} placeholder="Código de acceso" style={inputStyle}/>
      <button style={btnPrimary} onClick={tryUnlock} disabled={checking}>{checking ? "Comprobando..." : "Entrar"}</button>
      {unlocked === false && <div style={{color:"#c2694a", fontSize:13, marginTop:8}}>Código incorrecto.</div>}
    </div>
  );
}

function PanelOrientacion({ secret }){
  const [records, setRecords] = useState([]);
  const [claseFiltro, setClaseFiltro] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/respuestas?secret=${encodeURIComponent(secret)}`);
      const data = await res.json();
      setRecords(data.records || []);
    } catch(e) {}
    setLoading(false);
  }, [secret]);

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [load]);

  const filtered = claseFiltro ? records.filter(r=>r.clase===claseFiltro) : records;
  const clases = [...new Set(records.map(r=>r.clase))];

  const groupAvg = Object.keys(BLOQUES).map(b => {
    const vals = filtered.map(r=>r.scores[b]).filter(v=>v!=null);
    const avg = vals.length ? vals.reduce((a,c)=>a+c,0)/vals.length : 0;
    return { bloque: BLOQUES[b], key:b, media: +avg.toFixed(2) };
  });

  return (
    <div>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
        <div style={{fontSize:14, color:"#5a5248"}}>{loading ? "Cargando…" : `${filtered.length} respuestas recibidas`} · se actualiza cada 5s</div>
        <select value={claseFiltro} onChange={e=>setClaseFiltro(e.target.value)} style={{padding:"6px 10px", fontFamily:"inherit"}}>
          <option value="">Todas las clases</option>
          {clases.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <h3 style={{fontSize:16, marginBottom:8}}>Media grupal por bloque</h3>
      <div style={{background:"#fff", border:"1px solid #e0d8ca", borderRadius:4, padding:12, marginBottom:28}}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={groupAvg}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
            <XAxis dataKey="bloque" tick={{fontSize:11}} />
            <YAxis domain={[1,4]} />
            <Tooltip />
            <Bar dataKey="media" radius={[3,3,0,0]}>
              {groupAvg.map(g => <Cell key={g.key} fill={COLORS[g.key]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3 style={{fontSize:16, marginBottom:8}}>Consulta individual</h3>
      <div style={{display:"flex", gap:20}}>
        <div style={{width:220, maxHeight:340, overflowY:"auto", border:"1px solid #e0d8ca", borderRadius:4}}>
          {filtered.map(r => (
            <div key={r.clase+r.codigo} onClick={()=>setSelected(r)}
              style={{padding:"8px 12px", cursor:"pointer", background: selected===r ? "#f0e8db" : "transparent", borderBottom:"1px solid #eee", fontSize:13}}>
              {r.codigo} <span style={{color:"#8c6a4a"}}>· {r.clase}</span>
            </div>
          ))}
          {filtered.length===0 && <div style={{padding:12, fontSize:13, color:"#8c6a4a"}}>Sin respuestas aún.</div>}
        </div>
        <div style={{flex:1, background:"#fff", border:"1px solid #e0d8ca", borderRadius:4, padding:12}}>
          {selected ? (
            <>
              <div style={{fontSize:14, marginBottom:8}}><strong>{selected.codigo}</strong> · {selected.clase}</div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={Object.keys(BLOQUES).map(b=>({bloque:BLOQUES[b], alumno:selected.scores[b]||0, grupo: groupAvg.find(g=>g.key===b)?.media||0}))}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="bloque" tick={{fontSize:10}} />
                  <PolarRadiusAxis domain={[1,4]} />
                  <Radar name="Alumno/a" dataKey="alumno" stroke="#c2694a" fill="#c2694a" fillOpacity={0.35} />
                  <Radar name="Media grupo" dataKey="grupo" stroke="#4a7a8c" fill="#4a7a8c" fillOpacity={0.15} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
              {selected.libre && (
                <div style={{marginTop:10, fontSize:13, background:"#faf6ef", padding:10, borderRadius:3}}>
                  <strong>Comentario libre:</strong> {selected.libre}
                </div>
              )}
            </>
          ) : <div style={{fontSize:13, color:"#8c6a4a"}}>Selecciona un/a alumno/a de la lista.</div>}
        </div>
      </div>
    </div>
  );
}
