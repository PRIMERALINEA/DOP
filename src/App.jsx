import React, { useState, useEffect, useCallback } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { supabase } from "./supabaseClient.js";

// Convención única en TODO el cuestionario: 1 (peor) -> 4 (mejor/más bienestar).
// inv:true significa "el ítem está redactado como riesgo, se corrige con 5-valor".
// inv:false significa "el ítem ya está redactado en positivo, no se corrige".

// ---------- CUESTIONARIO 1 (solo 1º ESO) ----------
const ITEMS_C1 = [
  ["A","Me cuesta dormir porque estoy pensando en cosas del insti.",true],
  ["A","Cuando tengo un examen o trabajo importante, me pongo muy nervioso/a.",true],
  ["A","Sé calmarme cuando algo me estresa.",false],
  ["A","Me siento agobiado/a por la cantidad de tareas y exámenes.",true],
  ["A","Cuando tengo un problema, encuentro la forma de resolverlo sin agobiarme demasiado.",false],
  ["A","Tengo dolores de cabeza, tripa o cansancio sin motivo físico claro.",true],
  ["A","Siento que tengo tiempo suficiente para hacer todo lo que tengo que hacer.",false],
  ["A","Me cuesta relajarme incluso en mi tiempo libre.",true],
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
  A: "Regulación del estrés", B: "Hábitos de estudio", C: "Autoestima",
  D: "Habilidades sociales", E: "Clima escolar/apoyo"
};

// ---------- CUESTIONARIO 2 (toda la ESO) ----------
const ITEMS_C2 = [
  ["F1","Algún compañero/a se ha metido conmigo o me ha insultado de forma repetida.",true],
  ["F1","Me han dejado de lado o excluido del grupo a propósito más de una vez.",true],
  ["F1","He recibido mensajes, comentarios o imágenes que me han hecho sentir mal por móvil o redes.",true],
  ["F2","He visto que otro compañero/a se metía con alguien de forma repetida, sin que nadie hiciera nada.",true],
  ["F2","Sé a quién puedo contarle si veo que están tratando mal a alguien.",false],
  ["ALERTA","Alguna vez me he metido con algún compañero/a o he participado en dejarlo de lado.",false],
  ["F2","Me siento seguro/a en los espacios del instituto (pasillos, patio, baños, vestuarios).",false],
  ["G","Uso el móvil o las redes sociales justo antes de dormir.",true],
  ["G","Pierdo la noción del tiempo cuando estoy con el móvil o videojuegos.",true],
  ["G","Comparar mi vida con lo que veo en redes sociales me hace sentir peor.",true],
  ["G","Discuto en casa por el tiempo que paso con el móvil o pantallas.",true],
  ["G","Sé desconectarme cuando quiero, sin sentir que \"necesito\" seguir mirando.",false],
  ["H","Duermo al menos 8 horas la mayoría de las noches.",false],
  ["H","Me cuesta quedarme dormido/a por las noches.",true],
  ["H","Me despierto cansado/a aunque haya dormido.",true],
  ["H","Me quedo despierto/a hasta tarde con el móvil o pantallas.",true],
  ["H","Durante el día, tengo suficiente energía para hacer las cosas.",false],
  ["I","Últimamente me siento triste o de bajón sin motivo claro.",true],
  ["I","Disfruto de las cosas que me gustan (quedar, aficiones, deporte...).",false],
  ["I","Me siento con ganas e ilusión por las cosas del día a día.",false],
  ["I","Me cuesta concentrarme más de lo normal últimamente.",true],
  ["I","Me siento irritable o de mal humor con facilidad.",true],
  ["I","Tengo a alguien con quien hablar cuando me siento mal.",false],
  ["J","Repaso lo que doy en clase el mismo día, aunque no tenga examen cercano.",false],
  ["J","Utilizo técnicas como resúmenes, esquemas o subrayado para estudiar.",false],
  ["J","Dejo de estudiar todas las asignaturas para el final de la evaluación.",true],
  ["J","Uso una agenda o planificador para apuntar exámenes y trabajos.",false],
  ["J","Cuando tengo varios exámenes seguidos, sé cómo repartir el tiempo de estudio entre ellos.",false],
  ["J","Antes de un examen, me autoevalúo (ejercicios, preguntas) para comprobar si me lo sé.",false],
  ["J","Estudio de un tirón la noche antes en vez de repartir los días.",true],
  ["J","Sé identificar qué parte de la materia me cuesta más para dedicarle más tiempo.",false],
];
const BLOQUES_C2 = {
  F1: "Seguridad frente al acoso", F2: "Entorno seguro y apoyo",
  G: "Autorregulación de pantallas", H: "Calidad del descanso", I: "Bienestar anímico",
  J: "Técnicas y hábitos de estudio"
};

// ---------- CUESTIONARIO 3 (toda la ESO) — Hábitos y técnicas de estudio ----------
// Instrumento de elaboración propia (redacción y agrupación originales),
// no reproduce ítems ni claves de ningún cuestionario comercial de terceros.
// Uso interno del centro como herramienta de autoconocimiento del alumnado,
// sin baremos poblacionales validados (ver AVISO_INFORME).
const ITEMS_HE = [
  ["AC","Sé explicar para qué me sirve estudiar, más allá de aprobar.",false],
  ["AC","Estudio solo porque me obligan, no porque me interese de verdad.",true],
  ["AC","Cuando algo me cuesta entender, busco la forma de resolverlo en vez de rendirme.",false],
  ["AC","Me desanimo con facilidad si una asignatura no me gusta.",true],
  ["AC","Me marco metas propias de aprendizaje, más allá de lo que pide el profesor.",false],
  ["OT","Sé, antes de empezar la semana, qué voy a estudiar cada día.",false],
  ["OT","Dejo los trabajos y el estudio para el último momento.",true],
  ["OT","Reparto el tiempo de estudio según la dificultad de cada asignatura.",false],
  ["OT","Reviso al final del día si he cumplido lo que me había propuesto.",false],
  ["OT","Combino el tiempo de estudio con descansos organizados.",false],
  ["LU","Estudio siempre en el mismo sitio, sin cambiar de lugar cada día.",false],
  ["LU","Hay ruido, música o pantallas encendidas cerca mientras estudio.",true],
  ["LU","Mi mesa de estudio suele estar despejada de cosas que no necesito.",false],
  ["LU","Tengo todo el material a mano antes de empezar, sin tener que levantarme.",false],
  ["LU","La luz de mi zona de estudio es suficiente para no forzar la vista.",false],
  ["ES","Duermo al menos 7-8 horas la mayoría de las noches.",false],
  ["ES","Me levanto cansado/a la mayoría de las mañanas.",true],
  ["ES","Hago descansos cortos cada 40-50 minutos cuando estudio.",false],
  ["ES","El cansancio me impide concentrarme con frecuencia.",true],
  ["TE","Leo el tema por encima antes de estudiarlo en profundidad.",false],
  ["TE","Subrayo o marco las ideas clave mientras leo.",false],
  ["TE","Hago resúmenes o esquemas propios después de leer un tema.",false],
  ["TE","Memorizo sin haber entendido antes el contenido.",true],
  ["TE","Relaciono lo nuevo que estudio con lo que ya sabía.",false],
  ["TE","Me limito a copiar lo que dice el libro o internet sin reformularlo con mis palabras.",true],
  ["EX","Leo todas las preguntas antes de empezar a responder.",false],
  ["EX","Reparto el tiempo del examen según el valor de cada pregunta.",false],
  ["EX","Entrego el examen en cuanto termino, sin revisar.",true],
  ["EX","Empiezo a preparar el examen con varios días de margen.",false],
  ["EX","Me pongo tan nervioso/a que me quedo en blanco con frecuencia.",true],
  ["TR","Hago un esquema antes de empezar a escribir un trabajo.",false],
  ["TR","Indico siempre las fuentes que he usado.",false],
  ["TR","Cuido la presentación y redacción final antes de entregar.",false],
  ["TR","Dejo la revisión y presentación para el último momento.",true],
];
const BLOQUES_HE = {
  AC: "Actitud y motivación", OT: "Organización del tiempo", LU: "Lugar de estudio",
  ES: "Estado físico y descanso", TE: "Técnicas de estudio", EX: "Exámenes y ejercicios",
  TR: "Elaboración de trabajos"
};

const COLORS = {
  A:"#c2694a", B:"#4a7a8c", C:"#8c6a4a", D:"#5a8c6a", E:"#7a5a8c",
  F1:"#a4483f", F2:"#c2694a", G:"#3f6b7a", H:"#6b5b3f", I:"#5b6b3f", J:"#4a7a6b",
  AC:"#b0553f", OT:"#3f7a6b", LU:"#4a6a8c", ES:"#8c7a3f", TE:"#5a6a8c", EX:"#7a4a5a", TR:"#4a8c5a"
};
const OPCIONES = [
  {v:1,l:"Nunca"}, {v:2,l:"A veces"}, {v:3,l:"Muchas veces"}, {v:4,l:"Siempre"},
];
const CURSOS = ["1º ESO","2º ESO","3º ESO","4º ESO"];
const CLASES_ESO = ["E1","E2","E3","E4","EP/ED"];
const CUESTIONARIOS = {
  C1: { label: "Cuestionario 1 · Bienestar general (solo 1º ESO)", items: ITEMS_C1, bloques: BLOQUES_C1, cursos: ["1º ESO"], clases: CLASES_ESO },
  C2: { label: "Cuestionario 2 · Convivencia y hábitos (toda la ESO)", items: ITEMS_C2, bloques: BLOQUES_C2, cursos: CURSOS, clases: CLASES_ESO },
  HE: { label: "Cuestionario 3 · Hábitos y técnicas de estudio (toda la ESO)", items: ITEMS_HE, bloques: BLOQUES_HE, cursos: CURSOS },
};

function correct(val, inv){ return inv ? 5 - val : val; }

// Calcula media por bloque (1=peor, 4=mejor en todos los bloques) e ignora
// ítems marcados como "ALERTA" (no forman parte de ninguna media).
function blockScores(items, bloques, answers){
  const sums = {}, counts = {};
  items.forEach((it, i) => {
    const [b, , inv] = it;
    if (b === "ALERTA") return;
    const raw = answers[i];
    if (raw == null) return;
    const c = correct(raw, inv);
    sums[b] = (sums[b]||0) + c;
    counts[b] = (counts[b]||0) + 1;
  });
  const out = {};
  Object.keys(bloques).forEach(b => { out[b] = counts[b] ? +(sums[b]/counts[b]).toFixed(2) : null; });
  // Ítems de alerta: se guardan aparte, con su valor bruto (sin corregir), 1-4.
  items.forEach((it, i) => {
    const [b] = it;
    if (b === "ALERTA" && answers[i] != null) out["ALERTA_" + i] = answers[i];
  });
  return out;
}

export default function App(){
  const [tab, setTab] = useState("responder");

  return (
    <div style={{fontFamily:"'Georgia', serif", background:"#f4f7f8", minHeight:"100vh", color:"#1e2f38"}}>
      <div style={{maxWidth:900, margin:"0 auto", padding:"32px 20px"}}>
        <header style={{marginBottom:28, borderBottom:"2px solid #12414f", paddingBottom:14}}>
          <h1 style={{fontSize:26, margin:0}}>Cuestionario de Orientación</h1>
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
    padding:"8px 18px", border:"1px solid #12414f", background: active ? "#12414f" : "transparent",
    color: active ? "#fff" : "#12414f", cursor:"pointer", fontFamily:"inherit", fontSize:14, borderRadius:2
  };
}
const inputStyle = {display:"block", width:"100%", padding:"10px 12px", margin:"10px 0", border:"1px solid #a9c1c7", borderRadius:2, fontFamily:"inherit", fontSize:14, boxSizing:"border-box"};
const btnPrimary = {padding:"10px 20px", background:"#1f7a8c", color:"#fff", border:"none", borderRadius:2, cursor:"pointer", fontFamily:"inherit", fontSize:14};

function BarraProgreso({ actual, total }){
  const pct = Math.round((actual/total)*100);
  return (
    <div style={{marginBottom:18}}>
      <div style={{height:6, background:"#dbe6e8", borderRadius:3, overflow:"hidden"}}>
        <div style={{height:"100%", width:`${pct}%`, background:"#1f7a8c", transition:"width .3s ease"}} />
      </div>
      <div style={{fontSize:11, color:"#5a7078", marginTop:4}}>{actual} de {total} · ya casi</div>
    </div>
  );
}

function FormularioAlumno(){
  const [cuestKey, setCuestKey] = useState("");
  const [curso, setCurso] = useState("");
  const [codigo, setCodigo] = useState("");
  const [clase, setClase] = useState("");
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
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

  if (step === 0) {
    return (
      <div style={{position:"relative", maxWidth:460, minHeight:340}}>
        <div style={{
          position:"fixed", inset:0,
          backgroundImage:"url(/logo.jpg)", backgroundSize:"cover", backgroundRepeat:"no-repeat", backgroundPosition:"center",
          filter:"blur(4px)", opacity:0.28, zIndex:0, pointerEvents:"none"
        }} />
        <div style={{position:"relative", zIndex:1}}>
          <p style={{color:"#5a7078", fontSize:14}}>Selecciona el cuestionario que te ha indicado tu tutor/a u orientadora.</p>
          <div style={{display:"flex", flexDirection:"column", gap:8}}>
            {Object.entries(CUESTIONARIOS).map(([key, c]) => (
              <button key={key} onClick={()=>{ setCuestKey(key); setCurso(c.cursos.length===1?c.cursos[0]:""); setStep(1); }}
                style={{textAlign:"left", padding:"14px", border:"1px solid #a9c1c7", background:"rgba(255,255,255,0.9)", borderRadius:2, cursor:"pointer", fontFamily:"inherit", fontSize:14}}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        {cfg.clases ? (
          <select style={inputStyle} value={clase} onChange={e=>setClase(e.target.value)}>
            <option value="">Selecciona tu clase</option>
            {cfg.clases.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        ) : (
          <input style={inputStyle} placeholder="Clase (ej. A, B, C...)" value={clase} onChange={e=>setClase(e.target.value)} />
        )}
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
        <BarraProgreso actual={itemIndex+1} total={total} />
        <div style={{fontSize:12, color:"#5a7078", marginBottom:6}}>{bloque==="ALERTA" ? "Convivencia" : cfg.bloques[bloque]}</div>
        <div style={{fontSize:18, marginBottom:16}}>{texto}</div>
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {OPCIONES.map(op => (
            <button key={op.v} onClick={()=>{ setAnswers(a=>({...a,[itemIndex]:op.v})); setStep(step+1); }}
              style={{textAlign:"left", padding:"12px 14px", border:"1px solid #a9c1c7", background: answers[itemIndex]===op.v ? "#12414f" : "#fff", color: answers[itemIndex]===op.v ? "#fff" : "#1e2f38", borderRadius:2, cursor:"pointer", fontFamily:"inherit", fontSize:14}}>
              {op.v}. {op.l}
            </button>
          ))}
        </div>
        {step>2 && <button onClick={()=>setStep(step-1)} style={{marginTop:14, background:"none", border:"none", color:"#5a7078", cursor:"pointer", fontSize:13}}>← Anterior</button>}
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
  const [vista, setVista] = useState("lista"); // lista | informeIndividual | informeGrupo

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

  // Ítems de alerta: se guardan aparte, con su valor bruto (sin corregir), 1-4.
  const alertas = filtered.filter(r => Object.entries(r.scores||{}).some(([k,v]) => k.startsWith("ALERTA_") && v>=3));

  if (vista === "informeIndividual" && selected) {
    return <InformeIndividual r={selected} groupAvg={groupAvg} cfg={cfg} onVolver={()=>setVista("lista")} />;
  }
  if (vista === "informeGrupo") {
    return <InformeGrupo filtered={filtered} groupAvg={groupAvg} cfg={cfg} alertas={alertas} cuestKey={cuestKey}
      curso={cursoFiltro} clase={claseFiltro} onVolver={()=>setVista("lista")} />;
  }

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

      {alertas.length > 0 && (
        <div style={{background:"#f7e9e5", border:"1px solid #c2694a", borderRadius:4, padding:"10px 14px", marginBottom:20, fontSize:13}}>
          ⚠ {alertas.length} alumno/a(s) han indicado haber participado en conductas de exclusión/acoso hacia compañeros/as. Revisar de forma individual, protocolo de convivencia.
        </div>
      )}

      <h3 style={{fontSize:16, marginBottom:4}}>Media grupal por bloque</h3>
      <div style={{fontSize:12, color:"#8c6a4a", marginBottom:8}}>En todos los bloques: más alto (cerca de 4) = más bienestar/protección. Más bajo (cerca de 1) = más riesgo.</div>
      <div style={{background:"#fff", border:"1px solid #e0d8ca", borderRadius:4, padding:12, marginBottom:12}}>
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
      <button onClick={()=>setVista("informeGrupo")} disabled={filtered.length===0} style={{...btnPrimary, marginBottom:28}}>
        Generar informe del grupo
      </button>

      <h3 style={{fontSize:16, marginBottom:8}}>Consulta individual</h3>
      <div style={{display:"flex", gap:20, flexWrap:"wrap"}}>
        <div style={{width:240, maxHeight:340, overflowY:"auto", border:"1px solid #e0d8ca", borderRadius:4}}>
          {filtered.map(r => {
            const tieneAlerta = Object.entries(r.scores||{}).some(([k,v]) => k.startsWith("ALERTA_") && v>=3);
            return (
              <div key={r.clase+r.codigo+r.cuestionario} onClick={()=>setSelected(r)}
                style={{padding:"8px 12px", cursor:"pointer", background: selected===r ? "#f0e8db" : "transparent", borderBottom:"1px solid #eee", fontSize:13}}>
                {tieneAlerta && <span style={{color:"#c2694a"}}>⚠ </span>}
                {r.codigo} <span style={{color:"#8c6a4a"}}>· {r.curso} {r.clase}</span>
              </div>
            );
          })}
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
              {Object.entries(selected.scores||{}).some(([k,v]) => k.startsWith("ALERTA_") && v>=3) && (
                <div style={{marginTop:10, fontSize:13, background:"#f7e9e5", border:"1px solid #c2694a", padding:10, borderRadius:3}}>
                  ⚠ Ha indicado con frecuencia "muchas veces" o "siempre" haber participado en excluir o meterse con algún compañero/a. Requiere seguimiento individual con protocolo de convivencia, no solo lectura del gráfico.
                </div>
              )}
              {selected.libre && (
                <div style={{marginTop:10, fontSize:13, background:"#faf6ef", padding:10, borderRadius:3}}>
                  <strong>Comentario libre:</strong> {selected.libre}
                </div>
              )}
              <button onClick={()=>setVista("informeIndividual")} style={{...btnPrimary, marginTop:14}}>
                Generar informe individual
              </button>
            </>
          ) : <div style={{fontSize:13, color:"#8c6a4a"}}>Selecciona un/a alumno/a de la lista.</div>}
        </div>
      </div>
    </div>
  );
}

function banda(score, media){
  if (score == null) return "Sin datos";
  if (score >= media + 0.5) return "Banda alta (punto fuerte)";
  if (score <= media - 0.5) return "Banda baja (a valorar / posible seguimiento)";
  return "Banda media (dentro de lo esperable)";
}

const AVISO_INFORME = "Este informe recoge los resultados de un cuestionario de cribado orientativo elaborado por el Departamento de Orientación. No es una evaluación clínica ni diagnóstica, y las puntuaciones no tienen baremos poblacionales validados: son de referencia interna, comparadas con el grupo evaluado en este mismo pase. Debe interpretarse junto con la valoración profesional de orientación, no de forma aislada.";

function InformeIndividual({ r, groupAvg, cfg, onVolver }){
  const fecha = new Date().toLocaleDateString("es-ES", { year:"numeric", month:"long", day:"numeric" });
  const tieneAlerta = Object.entries(r.scores||{}).some(([k,v]) => k.startsWith("ALERTA_") && v>=3);
  return (
    <div>
      <div className="no-print" style={{display:"flex", gap:10, marginBottom:20}}>
        <button onClick={onVolver} style={{...btnPrimary, background:"#5a7078"}}>← Volver al panel</button>
        <button onClick={()=>window.print()} style={btnPrimary}>Imprimir / Guardar como PDF</button>
      </div>

      <div style={{border:"1px solid #12414f", padding:24, background:"#fff"}}>
        <div style={{display:"flex", alignItems:"center", gap:12, borderBottom:"2px solid #12414f", paddingBottom:12, marginBottom:16}}>
          <img src="/logo.jpg" alt="" style={{height:44}} />
          <div>
            <div style={{fontSize:18, fontWeight:"bold"}}>Informe orientativo individual</div>
            <div style={{fontSize:12, color:"#5a7078"}}>Departamento de Orientación · Centro San Valero · {fecha}</div>
          </div>
        </div>

        <p style={{fontSize:12, color:"#5a7078", background:"#f4f7f8", padding:10, borderRadius:3}}>{AVISO_INFORME}</p>

        <table style={{fontSize:14, marginBottom:16}}>
          <tbody>
            <tr><td style={{paddingRight:12, color:"#5a7078"}}>Alumno/a</td><td>{r.codigo}</td></tr>
            <tr><td style={{paddingRight:12, color:"#5a7078"}}>Curso / Clase</td><td>{r.curso} {r.clase}</td></tr>
            <tr><td style={{paddingRight:12, color:"#5a7078"}}>Cuestionario</td><td>{r.cuestionario}</td></tr>
          </tbody>
        </table>

        {tieneAlerta && (
          <div style={{background:"#f7e9e5", border:"1px solid #c2694a", padding:10, borderRadius:3, fontSize:13, marginBottom:16}}>
            ⚠ Ha indicado con frecuencia haber participado en excluir o meterse con algún compañero/a. Se recomienda seguimiento individual siguiendo el protocolo de convivencia del centro.
          </div>
        )}

        <table style={{width:"100%", borderCollapse:"collapse", fontSize:13, marginBottom:16}}>
          <thead>
            <tr style={{textAlign:"left", borderBottom:"1px solid #ccc"}}>
              <th style={{padding:"6px 4px"}}>Bloque</th>
              <th style={{padding:"6px 4px"}}>Puntuación (1-4)</th>
              <th style={{padding:"6px 4px"}}>Media del grupo</th>
              <th style={{padding:"6px 4px"}}>Interpretación</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(cfg.bloques).map(b => {
              const score = r.scores?.[b];
              const media = groupAvg.find(g=>g.key===b)?.media ?? 0;
              return (
                <tr key={b} style={{borderBottom:"1px solid #eee"}}>
                  <td style={{padding:"6px 4px"}}>{cfg.bloques[b]}</td>
                  <td style={{padding:"6px 4px"}}>{score ?? "—"}</td>
                  <td style={{padding:"6px 4px"}}>{media}</td>
                  <td style={{padding:"6px 4px"}}>{banda(score, media)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {r.libre && (
          <div style={{fontSize:13, background:"#faf6ef", padding:10, borderRadius:3, marginBottom:8}}>
            <strong>Comentario del alumno/a:</strong> {r.libre}
          </div>
        )}

        <div style={{fontSize:11, color:"#8c9aa0", marginTop:20, borderTop:"1px solid #eee", paddingTop:8}}>
          Documento generado el {fecha}. Uso interno / familia según corresponda. Consultar con el Departamento de Orientación ante cualquier duda de interpretación.
        </div>
      </div>
    </div>
  );
}

function InformeGrupo({ filtered, groupAvg, cfg, alertas, cuestKey, curso, clase, onVolver }){
  const fecha = new Date().toLocaleDateString("es-ES", { year:"numeric", month:"long", day:"numeric" });
  return (
    <div>
      <div className="no-print" style={{display:"flex", gap:10, marginBottom:20}}>
        <button onClick={onVolver} style={{...btnPrimary, background:"#5a7078"}}>← Volver al panel</button>
        <button onClick={()=>window.print()} style={btnPrimary}>Imprimir / Guardar como PDF</button>
      </div>

      <div style={{border:"1px solid #12414f", padding:24, background:"#fff"}}>
        <div style={{display:"flex", alignItems:"center", gap:12, borderBottom:"2px solid #12414f", paddingBottom:12, marginBottom:16}}>
          <img src="/logo.jpg" alt="" style={{height:44}} />
          <div>
            <div style={{fontSize:18, fontWeight:"bold"}}>Informe orientativo de grupo</div>
            <div style={{fontSize:12, color:"#5a7078"}}>Departamento de Orientación · Centro San Valero · {fecha}</div>
          </div>
        </div>

        <p style={{fontSize:12, color:"#5a7078", background:"#f4f7f8", padding:10, borderRadius:3}}>{AVISO_INFORME} Este informe agrega datos de varios alumnos/as y contiene información identificable (correos) — uso exclusivo del equipo docente/orientación, no debe entregarse a familias.</p>

        <table style={{fontSize:14, marginBottom:16}}>
          <tbody>
            <tr><td style={{paddingRight:12, color:"#5a7078"}}>Cuestionario</td><td>{cuestKey}</td></tr>
            <tr><td style={{paddingRight:12, color:"#5a7078"}}>Curso</td><td>{curso || "Todos"}</td></tr>
            <tr><td style={{paddingRight:12, color:"#5a7078"}}>Clase</td><td>{clase || "Todas"}</td></tr>
            <tr><td style={{paddingRight:12, color:"#5a7078"}}>Nº de respuestas</td><td>{filtered.length}</td></tr>
          </tbody>
        </table>

        <table style={{width:"100%", borderCollapse:"collapse", fontSize:13, marginBottom:16}}>
          <thead>
            <tr style={{textAlign:"left", borderBottom:"1px solid #ccc"}}>
              <th style={{padding:"6px 4px"}}>Bloque</th>
              <th style={{padding:"6px 4px"}}>Media del grupo (1-4)</th>
            </tr>
          </thead>
          <tbody>
            {groupAvg.map(g => (
              <tr key={g.key} style={{borderBottom:"1px solid #eee"}}>
                <td style={{padding:"6px 4px"}}>{g.bloque}</td>
                <td style={{padding:"6px 4px"}}>{g.media}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{fontSize:14, fontWeight:"bold", marginBottom:6}}>Casos con alerta de convivencia ({alertas.length})</div>
        {alertas.length === 0 ? (
          <div style={{fontSize:13, color:"#5a7078", marginBottom:16}}>Ninguno en este grupo.</div>
        ) : (
          <ul style={{fontSize:13, marginBottom:16}}>
            {alertas.map(a => <li key={a.codigo+a.clase}>{a.codigo} · {a.curso} {a.clase}</li>)}
          </ul>
        )}

        <div style={{fontSize:11, color:"#8c9aa0", marginTop:20, borderTop:"1px solid #eee", paddingTop:8}}>
          Documento generado el {fecha}. Uso interno del centro.
        </div>
      </div>
    </div>
  );
}
