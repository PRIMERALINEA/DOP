import React, { useState, useEffect, useCallback } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { supabase } from "./supabaseClient.js";

// ---------- CUESTIONARIO 1 (solo 1º ESO) ----------
const ITEMS_C1 = [
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
const BLOQUES_C1 = {
  A: "Gestión del estrés", B: "Hábitos de estudio", C: "Autoestima",
  D: "Habilidades sociales", E: "Clima escolar/apoyo"
};

// ---------- CUESTIONARIO 2 (toda la ESO) ----------
const ITEMS_C2 = [
  ["F","Algún compañero/a se ha metido conmigo o me ha insultado de forma repetida.",false],
  ["F","Me han dejado de lado o excluido del grupo a propósito más de una vez.",false],
  ["F","He recibido mensajes, comentarios o imágenes que me han hecho sentir mal por móvil o redes.",false],
  ["F","He visto que otro compañero/a se metía con alguien de forma repetida, sin que nadie hiciera nada.",false],
  ["F","Sé a quién puedo contarle si veo que están tratando mal a alguien.",true],
  ["F","Alguna vez me he metido con algún compañero/a o he participado en dejarlo de lado.",false],
  ["F","Me siento seguro/a en los espacios del instituto (pasillos, patio, baños, vestuarios).",true],
  ["G","Uso el móvil o las redes sociales justo antes de dormir.",false],
  ["G","Pierdo la noción del tiempo cuando estoy con el móvil o videojuegos.",false],
  ["G","Comparar mi vida con lo que veo en redes sociales me hace sentir peor.",false],
  ["G","Discuto en casa por el tiempo que paso con el móvil o pantallas.",false],
  ["G","Sé desconectarme cuando quiero, sin sentir que \"necesito\" seguir mirando.",true],
  ["G","Uso el móvil o internet para hablar de mis problemas con amigos/as.",false],
  ["H","Duermo al menos 8 horas la mayoría de las noches.",true],
  ["H","Me cuesta quedarme dormido/a por las noches.",false],
  ["H","Me despierto cansado/a aunque haya dormido.",false],
  ["H","Me quedo despierto/a hasta tarde con el móvil o pantallas.",false],
  ["H","Durante el día, tengo suficiente energía para hacer las cosas.",true],
  ["I","Últimamente me siento triste o de bajón sin motivo claro.",false],
  ["I","Disfruto de cosas que antes me gustaban (quedar, aficiones, deporte...).",true],
  ["I","Me siento con ganas e ilusión por las cosas del día a día.",true],
  ["I","Me cuesta concentrarme más de lo normal últimamente.",false],
  ["I","Me siento irritable o de mal humor con facilidad.",false],
  ["I","Tengo a alguien con quien hablar cuando me siento mal.",true],
];
const BLOQUES_C2 = {
  F: "Convivencia y acoso", G: "Pantallas y redes", H: "Sueño y descanso", I: "Estado de ánimo"
};

const COLORS = {
  A:"#c2694a", B:"#4a7a8c", C:"#8c6a4a", D:"#5a8c6a", E:"#7a5a8c",
  F:"#a4483f", G:"#3f6b7a", H:"#6b5b3f", I:"#5b6b3f"
};
const OPCIONES = [
  {v:1,l:"Nunca"}, {v:2,l:"A veces"}, {v:3,l:"Muchas veces"}, {v:4,l:"Siempre"},
];
const CURSOS = ["1º ESO","2º ESO","3º ESO","4º ESO"];
const CUESTIONARIOS = {
  C1: { label: "Cuestionario 1 · Bienestar general (solo 1º ESO)", items: ITEMS_C1, bloques: BLOQUES_C1, cursos: ["1º ESO"] },
  C2: { label: "Cuestionario 2 · Convivencia y hábitos (toda la ESO)", items: ITEMS_C2, bloques: BLOQUES_C2, cursos: CURSOS },
};

function correct(val, inv){ return inv ? 5 - val : val; }

function blockScores(items, bloques, answers){
  const sums = {}, counts = {};
  items.forEach((it, i) => {
    const [b, , inv] = it;
    const raw = answers[i];
    if (raw == null) return;
    const c = correct(raw, inv);
    sums[b] = (sums[b]||0) + c;
    counts[b] = (counts[b]||0) + 1;
  });
  const out = {};
  Object.keys(bloques).forEach(b => { out[b] = counts[b] ? +(sums[b]/counts[b]).toFixed(2) : null; });
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
  const [cuestKey, setCuestKey] = useState("");
  const [curso, setCurso] = useState("");
  const [codigo, setCodigo] = useState("");
  const [clase, setClase] = useState("");
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0); // 0 = selección, 1 = datos, 2..N+1 = items, luego abierta
  const [libre, setLibre] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const emailValido = (v) => /^[^\s@]+@svalero\.com$/i.test(v.trim());
  const cfg = cuestKey ? CUESTIONARIOS[cuestKey] : null;
  const total = cfg ? cfg.items.length : 0;

  const submit = useCallback(async () => {
    if (!emailValido(codigo) || !clase.trim() || !curso) { setError("Falta correo válido, curso o clase."); return; }
    setEnviando(true);
    const scores = blockScores(cfg.items, cfg.bloques, answers);
    const { error: err } = await supabase.from("respuestas_orientacion").insert({
      codigo: codigo.trim().toLowerCase(), clase: clase.trim(), curso, cuestionario: cuestKey, scores, libre
    });
    setEnviando(false);
    if (err) { setError("No se pudo guardar: " + err.message); return; }
    setEnviado(true);
  }, [codigo, clase, curso, cuestKey, cfg, answers, libre]);

  if (enviado) return <div style={{padding:20, background:"#e8ede8", borderRadius:4}}>Respuesta guardada. Gracias.</div>;

  // Paso 0: elegir cuestionario
  if (step === 0) {
    return (
      <div style={{maxWidth:460}}>
        <p style={{color:"#5a5248", fontSize:14}}>Selecciona el cuestionario que te ha indicado tu tutor/a u orientadora.</p>
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {Object.entries(CUESTIONARIOS).map(([key, c]) => (
            <button key={key} onClick={()=>{ setCuestKey(key); setCurso(c.cursos.length===1?c.cursos[0]:""); setStep(1); }}
              style={{textAlign:"left", padding:"14px", border:"1px solid #b8ac9a", background:"#fff", borderRadius:2, cursor:"pointer", fontFamily:"inherit", fontSize:14}}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Paso 1: datos del alumno/a
  if (step === 1) {
    return (
      <div style={{maxWidth:420}}>
        <p style={{color:"#5a5248", fontSize:14}}>Introduce tu correo del centro (@svalero.com), tu curso y tu clase.</p>
        <input style={inputStyle} placeholder="nombre@svalero.com" value={codigo} onChange={e=>setCodigo(e.target.value)} />
        {cfg.cursos.length > 1 ? (
          <select style={inputStyle} value={curso} onChange={e=>setCurso(e.target.value)}>
            <option value="">Selecciona tu curso</option>
            {cfg.cursos.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        ) : (
          <input style={inputStyle} value={curso} disabled />
        )}
        <input style={inputStyle} placeholder="Clase (ej. A, B, C...)" value={clase} onChange={e=>setClase(e.target.value)} />
        {error && <div style={{color:"#c2694a", fontSize:13}}>{error}</div>}
        <button style={btnPrimary} onClick={()=>{
          if(!emailValido(codigo)){setError("El correo debe terminar en @svalero.com");return;}
          if(!curso){setError("Falta el curso.");return;}
          if(!clase.trim()){setError("Falta la clase.");return;}
          setError(""); setStep(2);
        }}>Empezar</button>
        <button onClick={()=>setStep(0)} style={{marginTop:10, background:"none", border:"none", color:"#8c6a4a", cursor:"pointer", fontSize:13, display:"block"}}>← Cambiar cuestionario</button>
      </div>
    );
  }

  const itemIndex = step - 2;
  if (itemIndex >= 0 && itemIndex < total) {
    const [bloque, texto] = cfg.items[itemIndex];
    return (
      <div style={{maxWidth:520}}>
        <div style={{fontSize:12, color:"#8c6a4a", marginBottom:6}}>{cfg.bloques[bloque]} · pregunta {itemIndex+1} de {total}</div>
        <div style={{fontSize:18, marginBottom:16}}>{texto}</div>
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {OPCIONES.map(op => (
            <button key={op.v} onClick={()=>{ setAnswers(a=>({...a,[itemIndex]:op.v})); setStep(step+1); }}
              style={{textAlign:"left", padding:"12px 14px", border:"1px solid #b8ac9a", background: answers[itemIndex]===op.v ? "#2c2620" : "#fff", color: answers[itemIndex]===op.v ? "#fff" : "#2c2620", borderRadius:2, cursor:"pointer", fontFamily:"inherit", fontSize:14}}>
              {op.v}. {op.l}
            </button>
          ))}
        </div>
        {step>2 && <button onClick={()=>setStep(step-1)} style={{marginTop:14, background:"none", border:"none", color:"#8c6a4a", cursor:"pointer", fontSize:13}}>← Anterior</button>}
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
  const [unlocked, setUnlocked] = useState(null);
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
      <p style={{fontSize:14, color:"#5a5248"}}>Código de acceso del panel.</p>
      <input type="password" value={tryVal} onChange={e=>setTryVal(e.target.value)} placeholder="Código de acceso" style={inputStyle}/>
      <button style={btnPrimary} onClick={tryUnlock} disabled={checking}>{checking ? "Comprobando..." : "Entrar"}</button>
      {unlocked === false && <div style={{color:"#c2694a", fontSize:13, marginTop:8}}>Código incorrecto.</div>}
    </div>
  );
}

function PanelOrientacion({ secret }){
  const [records, setRecords] = useState([]);
  const [cuestKey, setCuestKey] = useState("C1");
  const [cursoFiltro, setCursoFiltro] = useState("");
  const [claseFiltro, setClaseFiltro] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const cfg = CUESTIONARIOS[cuestKey];

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

  const base = records.filter(r => (r.cuestionario || "C1") === cuestKey);
  const filtered = base.filter(r => (!cursoFiltro || r.curso===cursoFiltro) && (!claseFiltro || r.clase===claseFiltro));
  const cursos = [...new Set(base.map(r=>r.curso).filter(Boolean))];
  const clases = [...new Set(base.map(r=>r.clase))];

  const groupAvg = Object.keys(cfg.bloques).map(b => {
    const vals = filtered.map(r=>r.scores?.[b]).filter(v=>v!=null);
    const avg = vals.length ? vals.reduce((a,c)=>a+c,0)/vals.length : 0;
    return { bloque: cfg.bloques[b], key:b, media: +avg.toFixed(2) };
  });

  return (
    <div>
      <div style={{display:"flex", gap:8, marginBottom:16}}>
        {Object.entries(CUESTIONARIOS).map(([key,c]) => (
          <button key={key} onClick={()=>{ setCuestKey(key); setSelected(null); setCursoFiltro(""); setClaseFiltro(""); }}
            style={tabStyle(cuestKey===key)}>{key}</button>
        ))}
      </div>

      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8}}>
        <div style={{fontSize:14, color:"#5a5248"}}>{loading ? "Cargando…" : `${filtered.length} respuestas`} · se actualiza cada 5s</div>
        <div style={{display:"flex", gap:8}}>
          {cfg.cursos.length > 1 && (
            <select value={cursoFiltro} onChange={e=>setCursoFiltro(e.target.value)} style={{padding:"6px 10px", fontFamily:"inherit"}}>
              <option value="">Todos los cursos</option>
              {cursos.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <select value={claseFiltro} onChange={e=>setClaseFiltro(e.target.value)} style={{padding:"6px 10px", fontFamily:"inherit"}}>
            <option value="">Todas las clases</option>
            {clases.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
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
      <div style={{display:"flex", gap:20, flexWrap:"wrap"}}>
        <div style={{width:240, maxHeight:340, overflowY:"auto", border:"1px solid #e0d8ca", borderRadius:4}}>
          {filtered.map(r => (
            <div key={r.clase+r.codigo+r.cuestionario} onClick={()=>setSelected(r)}
              style={{padding:"8px 12px", cursor:"pointer", background: selected===r ? "#f0e8db" : "transparent", borderBottom:"1px solid #eee", fontSize:13}}>
              {r.codigo} <span style={{color:"#8c6a4a"}}>· {r.curso} {r.clase}</span>
            </div>
          ))}
          {filtered.length===0 && <div style={{padding:12, fontSize:13, color:"#8c6a4a"}}>Sin respuestas aún.</div>}
        </div>
        <div style={{flex:1, minWidth:280, background:"#fff", border:"1px solid #e0d8ca", borderRadius:4, padding:12}}>
          {selected ? (
            <>
              <div style={{fontSize:14, marginBottom:8}}><strong>{selected.codigo}</strong> · {selected.curso} {selected.clase}</div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={Object.keys(cfg.bloques).map(b=>({bloque:cfg.bloques[b], alumno:selected.scores?.[b]||0, grupo: groupAvg.find(g=>g.key===b)?.media||0}))}>
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
