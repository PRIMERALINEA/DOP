import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
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
  ["INFO","En casa siento que me apoyan.",false],
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
  ["F1","He tenido miedo de venir al instituto por cómo me tratan compañeros/as.",true],
  ["F1","Me han puesto motes o me han ridiculizado delante de otros/as de forma repetida.",true],
  ["F2","He visto que otro compañero/a se metía con alguien de forma repetida, sin que nadie hiciera nada.",true],
  ["F2","Sé a quién puedo contarle si veo que están tratando mal a alguien.",false],
  ["F2","Si viera que tratan mal a alguien, sabría cómo intervenir o pedir ayuda sin ponerme en riesgo.",false],
  ["F2","Confío en que si cuento que me tratan mal, el instituto haría algo al respecto.",false],
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
  ["OT","Se me olvida con frecuencia qué tenía que estudiar ese día.",true],
  ["OT","Combino el tiempo de estudio con descansos organizados.",false],
  ["LU","Tengo pensado y preparado un lugar para estudiar, aunque no sea siempre el mismo.",false],
  ["LU","Hay ruido, música o pantallas encendidas cerca mientras estudio.",true],
  ["LU","Tengo la mesa llena de cosas que no necesito mientras estudio.",true],
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
  ["TR","Me olvido de indicar las fuentes que he usado.",true],
  ["TR","Cuido la presentación y redacción final antes de entregar.",false],
  ["TR","Dejo la revisión y presentación para el último momento.",true],
];
const BLOQUES_HE = {
  AC: "Actitud y motivación", OT: "Organización del tiempo", LU: "Lugar de estudio",
  ES: "Estado físico y descanso", TE: "Técnicas de estudio", EX: "Exámenes y ejercicios",
  TR: "Elaboración de trabajos"
};

// ---------- CUESTIONARIO 4 — Orientación vocacional RIASEC (3º-4º ESO y Bachillerato) ----------
// Instrumento de elaboración propia basado en el modelo teórico RIASEC de
// Holland (de dominio académico, no propietario). Uso interno del centro
// como herramienta de autoconocimiento vocacional del alumnado, sin baremos
// poblacionales validados (ver AVISO_RIASEC). Las claves de bloque usan el
// prefijo "R_" para no colisionar con los códigos de bloque de C1/C2/HE, que
// comparten el objeto COLORS.
const BLOQUES_RIASEC = {
  R_R: "Realista", R_I: "Investigador", R_A: "Artístico",
  R_S: "Social", R_E: "Emprendedor", R_C: "Convencional",
};
const ORDEN_RIASEC = ["R_R","R_I","R_A","R_S","R_E","R_C"];
const letraRiasec = (tipo) => tipo.replace("R_", "");
const pairKeyRiasec = (t1, t2) => {
  const [a, b] = [t1, t2].sort((x, y) => ORDEN_RIASEC.indexOf(x) - ORDEN_RIASEC.indexOf(y));
  return letraRiasec(a) + letraRiasec(b);
};

// Bloque 1 · Escala de intereses (30 ítems, 5 por tipo, orden entremezclado
// a propósito para que los 6 tipos no aparezcan agrupados).
const ITEMS_RIASEC = [
  ["R_R","Reparar o montar objetos mecánicos (bicicletas, electrodomésticos, ordenadores)."],
  ["R_I","Investigar por qué ocurren las cosas y buscar explicaciones basadas en datos."],
  ["R_A","Crear contenidos originales (dibujos, textos, vídeos, música, diseño)."],
  ["R_S","Ayudar a otras personas a resolver sus problemas o sentirse mejor."],
  ["R_E","Liderar un grupo, tomar decisiones o convencer a otros de una idea."],
  ["R_C","Organizar información, hacer listas, seguir procedimientos ordenados."],
  ["R_R","Trabajar al aire libre, con plantas, animales o en la naturaleza."],
  ["R_I","Resolver problemas complejos que requieren pensar de forma lógica."],
  ["R_A","Expresar ideas o emociones a través del arte, la escritura o la interpretación."],
  ["R_S","Enseñar o explicar algo a alguien que no lo entiende."],
  ["R_E","Organizar y dirigir un proyecto de principio a fin."],
  ["R_C","Trabajar con números, tablas o cálculos con precisión."],
  ["R_R","Usar herramientas, máquinas o instrumentos técnicos."],
  ["R_I","Leer o aprender sobre ciencia, tecnología o descubrimientos nuevos."],
  ["R_A","Improvisar o inventar algo nuevo sin seguir instrucciones fijas."],
  ["R_S","Escuchar a otros y ofrecerles apoyo cuando lo necesitan."],
  ["R_E","Vender un producto o una idea, negociando con otras personas."],
  ["R_C","Mantener el orden y el control de archivos, documentos o datos."],
  ["R_R","Construir o fabricar cosas con las manos (muebles, maquetas, circuitos)."],
  ["R_I","Hacer experimentos o comprobar hipótesis para entender un fenómeno."],
  ["R_A","Diseñar espacios, imágenes o productos con un estilo propio."],
  ["R_S","Trabajar en equipo cuidando que todos se sientan incluidos."],
  ["R_E","Asumir riesgos para conseguir una meta ambiciosa."],
  ["R_C","Seguir normas y procedimientos claros para hacer bien una tarea."],
  ["R_R","Realizar actividades físicas o deportivas que requieran fuerza o destreza."],
  ["R_I","Analizar información o datos para sacar conclusiones."],
  ["R_A","Participar en actividades de teatro, música, danza o artes visuales."],
  ["R_S","Participar en actividades de voluntariado o ayuda comunitaria."],
  ["R_E","Hablar en público o representar a un grupo ante otros."],
  ["R_C","Revisar detalles y corregir errores en un texto o documento."],
];

// Bloque 2 · Preferencias de actividades (elección forzada). Cada ítem tiene
// 3 opciones, cada una asociada a un tipo RIASEC; a lo largo del bloque cada
// tipo aparece al menos 5 veces.
const ELECCION_RIASEC = [
  { texto: "Vais a organizar un evento en el instituto. ¿Qué tarea elegirías?", opciones: [
    { label: "a) Diseñar el cartel del evento", tipo: "R_A" },
    { label: "b) Organizar el calendario y los materiales", tipo: "R_C" },
    { label: "c) Presentar el evento y coordinar a los participantes", tipo: "R_E" }]},
  { texto: "Un trabajo en grupo para clase. ¿Qué parte prefieres?", opciones: [
    { label: "a) Investigar y recopilar datos", tipo: "R_I" },
    { label: "b) Redactar y darle forma creativa al texto final", tipo: "R_A" },
    { label: "c) Repartir tareas y coordinar los plazos del grupo", tipo: "R_E" }]},
  { texto: "Un fin de semana libre. ¿Qué plan te apetece más?", opciones: [
    { label: "a) Salir en bici o hacer deporte al aire libre", tipo: "R_R" },
    { label: "b) Ayudar en una actividad solidaria", tipo: "R_S" },
    { label: "c) Organizar tus apuntes y planificar la semana", tipo: "R_C" }]},
  { texto: "Un proyecto de tecnología en clase. ¿Qué parte eliges?", opciones: [
    { label: "a) Montar y programar el circuito o robot", tipo: "R_R" },
    { label: "b) Investigar cómo funciona la tecnología que vais a usar", tipo: "R_I" },
    { label: "c) Diseñar la estética y la presentación final", tipo: "R_A" }]},
  { texto: "Feria de ciencias del instituto. ¿Qué rol prefieres?", opciones: [
    { label: "a) Hacer el experimento y explicar los resultados", tipo: "R_I" },
    { label: "b) Ayudar a compañeros/as más pequeños a entender el stand", tipo: "R_S" },
    { label: "c) Llevar el control de horarios y turnos del stand", tipo: "R_C" }]},
  { texto: "Un trabajo de verano. ¿Cuál elegirías?", opciones: [
    { label: "a) Monitor/a en un campamento con niños/as", tipo: "R_S" },
    { label: "b) Dependiente/a en una tienda, atendiendo y vendiendo", tipo: "R_E" },
    { label: "c) Ayudante en un taller mecánico o de mantenimiento", tipo: "R_R" }]},
  { texto: "Surge un problema en tu grupo de amigos/as. ¿Qué haces primero?", opciones: [
    { label: "a) Escuchar a cada uno y ayudar a que se entiendan", tipo: "R_S" },
    { label: "b) Proponer un plan claro y convencer al grupo de seguirlo", tipo: "R_E" },
    { label: "c) Analizar con calma qué ha pasado antes de opinar", tipo: "R_I" }]},
  { texto: "Organizáis un viaje de estudios. ¿Qué tarea te toca?", opciones: [
    { label: "a) Buscar y comparar datos de precios, horarios y rutas", tipo: "R_I" },
    { label: "b) Llevar la hoja de gastos y la lista de lo necesario", tipo: "R_C" },
    { label: "c) Diseñar el itinerario más original y atractivo", tipo: "R_A" }]},
  { texto: "En una empresa simulada de clase, ¿qué departamento eliges?", opciones: [
    { label: "a) Cuentas y contabilidad", tipo: "R_C" },
    { label: "b) Ventas y clientes", tipo: "R_E" },
    { label: "c) Diseño del producto o el logotipo", tipo: "R_A" }]},
  { texto: "Tarea de fin de semana en casa. ¿Cuál te apetece más?", opciones: [
    { label: "a) Reparar o montar algo que estaba roto", tipo: "R_R" },
    { label: "b) Escribir, dibujar o grabar algo por gusto propio", tipo: "R_A" },
    { label: "c) Ordenar y organizar tu cuarto o tus cosas", tipo: "R_C" }]},
  { texto: "Tienes que elegir una optativa. ¿Cuál te llama más?", opciones: [
    { label: "a) Robótica o tecnología aplicada", tipo: "R_R" },
    { label: "b) Psicología o ciencias sociales", tipo: "R_S" },
    { label: "c) Economía y emprendimiento", tipo: "R_E" }]},
  { texto: "Al salir de clase, ¿qué plan te engancha más?", opciones: [
    { label: "a) Quedarte resolviendo un problema o acertijo que te ha enganchado", tipo: "R_I" },
    { label: "b) Ir a un ensayo de teatro, música o algo creativo", tipo: "R_A" },
    { label: "c) Ir a una reunión de un club o asociación que organizas tú", tipo: "R_E" }]},
];

// Bloque 3 · Autoevaluación de habilidades (opcional). No se suma a la
// puntuación vocacional (interés y habilidad percibida son cosas distintas);
// se muestra aparte en el informe como información complementaria.
const HABILIDADES_RIASEC = [
  ["R_C","Trabajar con números y cálculos."],
  ["R_A","Expresarme de forma creativa (escribir, dibujar, actuar)."],
  ["R_S","Escuchar y apoyar emocionalmente a otras personas."],
  ["R_C","Organizar tareas y gestionar tiempo o recursos."],
  ["R_R","Reparar, montar o manipular objetos y herramientas."],
  ["R_I","Analizar problemas complejos de forma lógica."],
  ["R_E","Convencer a otros y liderar un grupo."],
  ["R_R","Adaptarme a tareas físicas o manuales exigentes."],
];

// Bloque 4 · Datos abiertos (texto libre, no puntúan).
const DATOS_ABIERTOS_RIASEC = [
  "¿Hay alguna profesión o área de estudio que ya tengas en mente? ¿Por qué?",
  "¿Qué tipo de actividades te hacen perder la noción del tiempo?",
  "¿Qué te gustaría estar haciendo dentro de 5 o 10 años?",
  "¿Alguna duda o preocupación sobre tu futuro académico o profesional?",
];

const OPCIONES_5 = [
  {v:1,l:"Nada de acuerdo / No me interesa"}, {v:2,l:"Poco de acuerdo / Me interesa poco"},
  {v:3,l:"Neutral / Me interesa moderadamente"}, {v:4,l:"Bastante de acuerdo / Me interesa bastante"},
  {v:5,l:"Totalmente de acuerdo / Me interesa mucho"},
];
const OPCIONES_HABILIDAD = [
  {v:1,l:"Nada hábil"}, {v:2,l:"Poco hábil"}, {v:3,l:"Hábil"}, {v:4,l:"Bastante hábil"}, {v:5,l:"Muy hábil"},
];
const OPCIONES_IMPORTANCIA = [
  {v:1,l:"Nada importante"}, {v:2,l:"Poco importante"}, {v:3,l:"Moderadamente importante"}, {v:4,l:"Bastante importante"}, {v:5,l:"Muy importante"},
];

// Descripciones breves de cada tipo dominante (tono cercano y motivador,
// sin etiquetas limitantes) y, para las combinaciones de los 2 tipos más
// altos, familias profesionales, ejemplos de profesiones/estudios y
// consejos prácticos. 15 combinaciones — cubre cualquier pareja posible de
// los 6 tipos, muy por encima del mínimo de 10 pedido.
const TIPOS_RIASEC_DESC = {
  R_R: "Te sientes cómodo/a con lo práctico: te gusta ver resultados tangibles, trabajar con herramientas, máquinas o el cuerpo en movimiento. Aprendes haciendo, no solo escuchando.",
  R_I: "Te mueve la curiosidad: te gusta entender por qué pasan las cosas, analizar datos y resolver problemas complejos paso a paso.",
  R_A: "Necesitas espacio para crear y expresarte a tu manera. Valoras la originalidad y disfrutas cuando puedes darle tu propio estilo a lo que haces.",
  R_S: "Te energiza estar con personas: escuchar, enseñar, ayudar o cuidar. Te sientes bien cuando tu trabajo tiene un impacto directo en alguien.",
  R_E: "Te gusta tomar la iniciativa, liderar y convencer. Disfrutas de los retos, de tomar decisiones y de ver crecer un proyecto que impulsas tú.",
  R_C: "Te sientes seguro/a con el orden: planificar, organizar datos y seguir procedimientos claros te da tranquilidad y te permite hacer bien tu trabajo.",
};
const FAMILIAS_RIASEC = {
  RI: { desc:"Combinas la practicidad con el análisis: te interesa entender cómo funcionan las cosas y ponerlo en práctica.",
    familias:["Ingeniería y Tecnología","Informática y Telecomunicaciones","Ciencias Aplicadas"],
    profesiones:["Ingeniería Informática","Ingeniería Industrial","Desarrollo de Software","FP de Informática y Redes","Automoción y Electrónica","Biotecnología aplicada"],
    consejos:["Visita una facultad de ingeniería o un centro de FP tecnológico en unas jornadas de puertas abiertas.","Prueba un curso corto de programación o robótica para ver si te engancha.","Habla con alguien que trabaje en un campo técnico sobre su día a día."]},
  RA: { desc:"Te atrae lo técnico pero con un toque creativo: te gusta construir o diseñar cosas que además tengan un estilo propio.",
    familias:["Diseño y Artes Aplicadas","Arquitectura y Edificación","Artes Gráficas"],
    profesiones:["Diseño de Producto","Arquitectura Técnica","FP de Artes Gráficas","Interiorismo","Diseño Industrial","Maquetación y efectos especiales"],
    consejos:["Explora talleres de diseño o maquetas para ver qué parte técnica y creativa te atrae más.","Sigue a profesionales del diseño técnico en redes para ver proyectos reales.","Apúntate a un concurso escolar de diseño o construcción."]},
  RS: { desc:"Combinas lo práctico con las ganas de ayudar: te ves haciendo algo útil con las manos que beneficie directamente a otras personas.",
    familias:["Sanidad (técnica)","Actividades Físicas y Deportivas","Emergencias y Seguridad"],
    profesiones:["Técnico/a en Emergencias Sanitarias","Fisioterapia","Técnico/a Deportivo","Bombero/a","Técnico/a en Prótesis","Socorrismo"],
    consejos:["Prueba un curso de primeros auxilios para ver si te llama.","Habla con un/a técnico/a sanitario/a o deportivo/a sobre su trabajo diario.","Haz voluntariado relacionado con deporte o salud."]},
  RE: { desc:"Te gusta lo práctico, pero también asumir el mando: te imaginas dirigiendo un proyecto técnico o tu propio negocio.",
    familias:["Mantenimiento e Instalaciones","Automoción","Emprendimiento técnico"],
    profesiones:["Gestión de un taller propio","FP de Electricidad y Electrónica","FP de Mantenimiento Industrial","Instalaciones eléctricas","Autoempleo técnico","Gestión de obra"],
    consejos:["Investiga cómo es montar un negocio en un sector técnico que te guste.","Habla con alguien que tenga su propio taller o negocio técnico.","Prueba a liderar un proyecto técnico en clase, aunque sea pequeño."]},
  RC: { desc:"Te sientes cómodo/a con tareas técnicas y ordenadas: te gusta que las cosas funcionen bien y sigan un procedimiento claro.",
    familias:["Automoción","Instalación y Mantenimiento","Transporte y Logística"],
    profesiones:["FP de Automoción","FP de Mantenimiento","Electricidad y Electrónica","Control de calidad técnico","Logística de almacén","Climatización"],
    consejos:["Visita un centro de FP de la familia de Transporte y Mantenimiento de Vehículos.","Pregunta por prácticas en un taller o empresa de mantenimiento.","Prueba a montar o reparar algo siguiendo instrucciones paso a paso."]},
  IA: { desc:"Te mueve entender el mundo y también expresarlo a tu manera: la curiosidad y la creatividad van de la mano en ti.",
    familias:["Arquitectura","Investigación y Ciencia aplicada","Diseño"],
    profesiones:["Arquitectura","Diseño de videojuegos","Investigación científica","Biotecnología","Diseño gráfico con base técnica","Ilustración científica"],
    consejos:["Busca proyectos que combinen ciencia y diseño (por ejemplo, ilustración científica).","Prueba a documentar un experimento o proceso de forma visual y creativa.","Investiga carreras que mezclen ambos mundos, como arquitectura o diseño de producto."]},
  IS: { desc:"Te interesa entender a las personas y ayudarlas basándote en el conocimiento y la evidencia.",
    familias:["Ciencias de la Salud","Psicología","Educación"],
    profesiones:["Medicina","Psicología","Enfermería","Investigación educativa","Logopedia","Nutrición y Dietética"],
    consejos:["Habla con un/a profesional sanitario/a o educativo/a sobre su formación.","Haz un voluntariado en un contexto social o sanitario.","Investiga qué grados o FP sanitarias hay cerca de ti."]},
  IE: { desc:"Combinas el análisis con las ganas de liderar: te gusta entender los problemas a fondo y luego tomar decisiones para resolverlos.",
    familias:["Ingeniería de gestión","Economía","Consultoría"],
    profesiones:["Ingeniería con gestión de proyectos","Economía","Administración de Empresas","Consultoría técnica","Analista de datos","Gestión de la innovación"],
    consejos:["Prueba a liderar un proyecto de investigación o innovación en clase.","Investiga carreras que combinen ciencia y empresa.","Lee sobre casos reales de innovación tecnológica y su gestión."]},
  IC: { desc:"Te gusta analizar datos con rigor y precisión, siguiendo métodos claros y ordenados.",
    familias:["Ciencias y Laboratorio","Estadística y Datos","Química Aplicada"],
    profesiones:["FP de Laboratorio de Análisis y Control de Calidad","Estadística","Química","Análisis de datos","Auditoría técnica","Control de calidad"],
    consejos:["Prueba un curso básico de análisis de datos o estadística.","Visita un laboratorio en una jornada de puertas abiertas.","Investiga la FP de Laboratorio si te atrae lo práctico dentro de la ciencia."]},
  AS: { desc:"Te gusta expresarte y, a la vez, conectar con otras personas: el arte y el acompañamiento van juntos para ti.",
    familias:["Educación","Terapias Creativas","Comunicación Social"],
    profesiones:["Magisterio de Educación Infantil","Arteterapia","Educación Social","Musicoterapia","Animación sociocultural","Integración Social"],
    consejos:["Prueba a dar una clase o taller creativo a niños/as o compañeros/as.","Investiga qué es la arteterapia o la musicoterapia.","Haz voluntariado en actividades culturales con enfoque social."]},
  AE: { desc:"Te gusta crear y también mostrar tu trabajo al mundo: la creatividad y la iniciativa se combinan bien en ti.",
    familias:["Comunicación y Marketing","Diseño de Moda","Industrias Creativas"],
    profesiones:["Publicidad y Relaciones Públicas","Marketing Digital","Diseño de Moda","Comunicación Audiovisual","Producción de eventos","Creación de contenido"],
    consejos:["Prueba a crear contenido propio (vídeo, diseño, redes) y compartirlo.","Investiga estudios de Comunicación Audiovisual o Marketing.","Habla con alguien que se dedique a la creación de contenido o publicidad."]},
  AC: { desc:"Combinas la creatividad con el gusto por el detalle y el orden: te gusta que lo que creas esté bien organizado y cuidado.",
    familias:["Artes Gráficas","Documentación y Edición","Diseño Editorial"],
    profesiones:["FP de Artes Gráficas","Diseño Editorial","Documentación","Maquetación","Ilustración técnica","Archivo y Biblioteconomía"],
    consejos:["Prueba a maquetar una revista o dossier para un proyecto de clase.","Investiga la FP de Artes Gráficas si te llama lo técnico dentro del diseño.","Explora perfiles de documentación o edición en redes profesionales."]},
  SE: { desc:"Te gusta ayudar a otras personas y también tomar la iniciativa: podrías liderar proyectos con un fuerte componente humano.",
    familias:["Educación","Trabajo Social","Recursos Humanos"],
    profesiones:["Magisterio","Trabajo Social","Integración Social","Recursos Humanos","Turismo","Gestión de proyectos sociales"],
    consejos:["Prueba a organizar una actividad solidaria o de grupo en tu instituto.","Habla con un/a docente o trabajador/a social sobre su trabajo.","Investiga estudios de Educación Social o Recursos Humanos."]},
  SC: { desc:"Te gusta ayudar a otros de forma ordenada y cercana, cuidando los detalles y el bienestar de las personas.",
    familias:["Administración","Educación","Atención Sociosanitaria"],
    profesiones:["FP de Atención a Personas en Situación de Dependencia","Administración y Gestión","Educación Infantil","Secretariado","Gestión de centros educativos","Atención al cliente en salud"],
    consejos:["Prueba un curso o voluntariado de atención a personas mayores o dependientes.","Investiga la FP de Atención a Personas en Situación de Dependencia.","Habla con alguien que trabaje en administración de un centro educativo o sanitario."]},
  EC: { desc:"Te gusta organizar, liderar y gestionar con orden: podrías disfrutar dirigiendo procesos o negocios de forma estructurada.",
    familias:["Administración y Finanzas","Comercio y Marketing","Gestión Empresarial"],
    profesiones:["Administración y Finanzas","Comercio Internacional","Gestión Administrativa","Marketing","Banca y Finanzas","Dirección de pequeños negocios"],
    consejos:["Prueba a llevar las cuentas o la organización de un proyecto de clase.","Investiga la FP de Administración y Finanzas o Comercio y Marketing.","Habla con alguien que gestione un negocio sobre cómo empezó."]},
};
const AVISO_RIASEC = "Este perfil recoge tus intereses actuales según un cuestionario de orientación vocacional elaborado por el Departamento de Orientación (modelo RIASEC de Holland). No es un test clínico ni una evaluación de aptitudes, y no tiene baremos poblacionales validados: es una guía para explorar opciones, no una sentencia. Tus intereses pueden evolucionar con el tiempo y la experiencia — coméntalo con tu orientador/a para profundizar.";

// ---------- CUESTIONARIO 5 — Personalidad (Big Five breve, TIPI) ----------
// Adaptación al castellano del Ten-Item Personality Inventory (TIPI, Gosling,
// Rentfrow y Swann, 2003), instrumento académico de dominio público pensado
// como cribado rápido de los 5 grandes rasgos de personalidad. Al ser tan
// breve (2 ítems por rasgo) tiene menor fiabilidad que un inventario largo:
// úsalo como orientación, no como medida definitiva. Claves con prefijo
// "BF_" para no colisionar con el resto de códigos de bloque.
const BLOQUES_BF = {
  BF_O: "Apertura a la experiencia", BF_C: "Responsabilidad",
  BF_E: "Extraversión", BF_A: "Amabilidad", BF_ES: "Estabilidad emocional",
};
const ITEMS_BF = [
  ["BF_E","Extrovertido/a, entusiasta.",false],
  ["BF_A","Crítico/a, discutidor/a.",true],
  ["BF_C","Responsable, autodisciplinado/a.",false],
  ["BF_ES","Ansioso/a, se altera con facilidad.",true],
  ["BF_O","Abierto/a a experiencias nuevas, con ideas complejas.",false],
  ["BF_E","Reservado/a, callado/a.",true],
  ["BF_A","Solidario/a, cálido/a.",false],
  ["BF_C","Desorganizado/a, descuidado/a.",true],
  ["BF_ES","Tranquilo/a, emocionalmente estable.",false],
  ["BF_O","Convencional, poco creativo/a.",true],
];
const OPCIONES_7 = [
  {v:1,l:"Totalmente en desacuerdo"}, {v:2,l:"Moderadamente en desacuerdo"}, {v:3,l:"Un poco en desacuerdo"},
  {v:4,l:"Ni de acuerdo ni en desacuerdo"}, {v:5,l:"Un poco de acuerdo"}, {v:6,l:"Moderadamente de acuerdo"},
  {v:7,l:"Totalmente de acuerdo"},
];

// ---------- SIMULADOR DE PERFIL PROFESIONAL ----------
// Tablas de afinidad orientativas entre cada tipo RIASEC y (a) los 5 rasgos
// de personalidad, (b) 6 valores de trabajo (versión simplificada de los
// valores de Super) y (c) 5 aptitudes técnicas autopercibidas. Los signos y
// magnitudes (-1..1) resumen tendencias generales descritas en la
// literatura de orientación vocacional (asociaciones Holland-Big Five,
// cruces Holland-valores de trabajo); NO son coeficientes calculados ni
// validados para esta herramienta — son un punto de partida razonado,
// ajústalos si tu criterio profesional o la evidencia de tu centro lo piden.
const RIASEC_BIGFIVE = {
  R_R:{BF_O:-0.1,BF_C:0.1,BF_E:-0.1,BF_A:-0.1,BF_ES:0.1},
  R_I:{BF_O:0.5,BF_C:0.1,BF_E:-0.2,BF_A:-0.1,BF_ES:0.1},
  R_A:{BF_O:0.6,BF_C:-0.2,BF_E:0.1,BF_A:0.0,BF_ES:0.0},
  R_S:{BF_O:0.1,BF_C:0.1,BF_E:0.4,BF_A:0.4,BF_ES:0.1},
  R_E:{BF_O:0.1,BF_C:0.2,BF_E:0.5,BF_A:-0.1,BF_ES:0.1},
  R_C:{BF_O:-0.4,BF_C:0.4,BF_E:0.0,BF_A:0.1,BF_ES:0.1},
};
const VALORES_RIASEC = {
  LOG:{label:"Logro y reto profesional", afinidad:{R_R:0.1,R_I:0.5,R_A:0.2,R_S:0.1,R_E:0.6,R_C:0.0}},
  IND:{label:"Independencia y autonomía", afinidad:{R_R:0.3,R_I:0.4,R_A:0.5,R_S:-0.1,R_E:0.3,R_C:-0.2}},
  REC:{label:"Reconocimiento y estatus", afinidad:{R_R:-0.1,R_I:0.2,R_A:0.4,R_S:0.1,R_E:0.6,R_C:0.0}},
  REL:{label:"Ayudar a otros/relaciones", afinidad:{R_R:0.0,R_I:0.0,R_A:0.1,R_S:0.7,R_E:0.1,R_C:0.1}},
  SEG:{label:"Seguridad y estabilidad", afinidad:{R_R:0.2,R_I:0.1,R_A:-0.2,R_S:0.2,R_E:-0.1,R_C:0.5}},
  ORD:{label:"Orden y condiciones claras", afinidad:{R_R:0.2,R_I:0.1,R_A:-0.2,R_S:0.1,R_E:0.0,R_C:0.6}},
};
const APTITUDES_RIASEC = {
  VER:{label:"Comunicación verbal/escrita", afinidad:{R_R:-0.2,R_I:0.2,R_A:0.4,R_S:0.4,R_E:0.4,R_C:0.1}},
  NUM:{label:"Numérica/lógica", afinidad:{R_R:0.1,R_I:0.5,R_A:-0.1,R_S:-0.1,R_E:0.1,R_C:0.4}},
  ESP:{label:"Espacial/visual", afinidad:{R_R:0.4,R_I:0.2,R_A:0.5,R_S:-0.1,R_E:0.0,R_C:0.0}},
  MAN:{label:"Manual/técnica", afinidad:{R_R:0.6,R_I:0.1,R_A:0.2,R_S:-0.1,R_E:0.0,R_C:0.1}},
  DIG:{label:"Digital/tecnológica", afinidad:{R_R:0.2,R_I:0.5,R_A:0.2,R_S:-0.1,R_E:0.2,R_C:0.2}},
};
const AVISO_SIMULADOR = "El índice de congruencia combina el modelo RIASEC (base principal), la personalidad (Big Five breve, si está disponible), y los valores/aptitudes que introduzcas tú. Las ponderaciones y las tablas de afinidad son un criterio de partida razonado, no un algoritmo validado científicamente: es una herramienta de apoyo a tu valoración profesional, no un sustituto de ella.";

// Similitud coseno entre dos vectores dispersos {clave: valor -1..1},
// reescalada a 0..1 (0.5 = sin señal / neutro). `claves` fija el conjunto de
// dimensiones a comparar.
function afinidadCoseno(personVec, envVec, claves){
  let dot=0, na=0, nb=0;
  claves.forEach(k => { const a=personVec[k]||0, b=envVec[k]||0; dot+=a*b; na+=a*a; nb+=b*b; });
  if (na===0 || nb===0) return 0.5;
  const cos = dot/(Math.sqrt(na)*Math.sqrt(nb));
  return (cos+1)/2;
}
// Vector RIASEC "ideal" de un entorno definido por sus 2 letras dominantes
// (código de FAMILIAS_RIASEC, p.ej. "RI"): esas 2 dimensiones altas (5), el
// resto en un valor base neutro (2), sobre la escala 1-5 de RIASEC.
function envVecRiasec(codigo2){
  const out = {};
  ORDEN_RIASEC.forEach(t => { out[t] = codigo2.includes(letraRiasec(t)) ? 5 : 2; });
  return out;
}
// Congruencia RIASEC persona-entorno: 1 - distancia euclídea normalizada
// (0-1) entre el vector de la persona y el del entorno, sobre 6 dimensiones.
function congruenciaRiasec(personVec, envVec){
  let sumsq = 0;
  ORDEN_RIASEC.forEach(t => {
    const a = (((personVec[t] ?? 3) - 1) / 4), b = ((envVec[t] - 1) / 4);
    sumsq += (a-b)*(a-b);
  });
  return 1 - Math.sqrt(sumsq) / Math.sqrt(6);
}
// Perfil Big Five esperado de un entorno (RIASEC_BIGFIVE: tipo -> {rasgo: afinidad}):
// media de las filas de sus 2 letras dominantes.
function envPerfilBigFive(codigo2){
  const t1 = "R_"+codigo2[0], t2 = "R_"+codigo2[1];
  const out = {};
  ["BF_O","BF_C","BF_E","BF_A","BF_ES"].forEach(k => {
    out[k] = ((RIASEC_BIGFIVE[t1]?.[k]||0) + (RIASEC_BIGFIVE[t2]?.[k]||0))/2;
  });
  return out;
}
// Perfil esperado de un entorno en un mapa de valores o aptitudes
// (clave -> {label, afinidad:{tipo: valor}}): media de sus 2 letras.
function envPerfilValorAptitud(mapa, codigo2){
  const t1 = "R_"+codigo2[0], t2 = "R_"+codigo2[1];
  const out = {};
  Object.keys(mapa).forEach(k => { out[k] = ((mapa[k].afinidad[t1]||0) + (mapa[k].afinidad[t2]||0))/2; });
  return out;
}

const COLORS = {
  A:"#c2694a", B:"#4a7a8c", C:"#8c6a4a", D:"#5a8c6a", E:"#7a5a8c",
  F1:"#a4483f", F2:"#c2694a", G:"#3f6b7a", H:"#6b5b3f", I:"#5b6b3f", J:"#4a7a6b",
  AC:"#b0553f", OT:"#3f7a6b", LU:"#4a6a8c", ES:"#8c7a3f", TE:"#5a6a8c", EX:"#7a4a5a", TR:"#4a8c5a",
  R_R:"#b0553f", R_I:"#3f7a6b", R_A:"#8c4a7a", R_S:"#4a8c6a", R_E:"#c2694a", R_C:"#4a6a8c",
  BF_O:"#7a5a8c", BF_C:"#4a6a8c", BF_E:"#c2694a", BF_A:"#4a8c6a", BF_ES:"#8c7a3f",
};
const OPCIONES = [
  {v:1,l:"Nunca"}, {v:2,l:"A veces"}, {v:3,l:"Muchas veces"}, {v:4,l:"Siempre"},
];
const CURSOS = ["1º ESO","2º ESO","3º ESO","4º ESO"];
const CLASES_ESO = ["E1","E2","E3","E4","EP/ED"];
// Clases de RIASEC y Big Five: cubren 3º-4º ESO (E1-E4, ED) y los itinerarios
// de Bachillerato (C=Ciencias, T=Tecnología, H=Humanidades).
const CLASES_ESO_BACH = ["E1","E2","E3","E4","ED","C","T","H"];
const CUESTIONARIOS = {
  C1: { label: "Cuestionario 1 · Bienestar general (solo 1º ESO)", items: ITEMS_C1, bloques: BLOQUES_C1, cursos: ["1º ESO"], clases: CLASES_ESO, escala:[1,4] },
  C2: { label: "Cuestionario 2 · Convivencia y hábitos (toda la ESO)", items: ITEMS_C2, bloques: BLOQUES_C2, cursos: CURSOS, clases: CLASES_ESO, escala:[1,4] },
  HE: { label: "Cuestionario 3 · Hábitos y técnicas de estudio (toda la ESO)", items: ITEMS_HE, bloques: BLOQUES_HE, cursos: CURSOS, clases: CLASES_ESO, escala:[1,4] },
  RIASEC: { label: "Cuestionario 4 · Orientación vocacional RIASEC (3º-4º ESO y Bachillerato)", tipo:"riasec", bloques: BLOQUES_RIASEC, escala:[1,5],
    cursos: ["3º ESO","4º ESO","1º Bachillerato","2º Bachillerato"], clases: CLASES_ESO_BACH,
    itemsLikert: ITEMS_RIASEC, opcionesLikert: OPCIONES_5, eleccion: ELECCION_RIASEC,
    habilidades: HABILIDADES_RIASEC, opcionesHabilidad: OPCIONES_HABILIDAD, datosAbiertos: DATOS_ABIERTOS_RIASEC },
  BF: { label: "Cuestionario 5 · Personalidad (Big Five breve, TIPI)", items: ITEMS_BF, bloques: BLOQUES_BF,
    cursos: ["3º ESO","4º ESO","1º Bachillerato","2º Bachillerato"], clases: CLASES_ESO_BACH, escala:[1,7], opciones: OPCIONES_7 },
};

// Puntuación media 1-5 por tipo a partir de un array de ítems [tipo, texto]
// y las respuestas indexadas por posición. Se usa tanto para el Bloque 1
// (intereses) como para el Bloque 3 (habilidades) del cuestionario RIASEC.
function mediaPorTipoRiasec(items, respuestas){
  const sums = {}, counts = {};
  items.forEach((it, i) => {
    const t = it[0];
    const v = respuestas[i];
    if (v == null) return;
    sums[t] = (sums[t]||0) + v;
    counts[t] = (counts[t]||0) + 1;
  });
  const out = {};
  ORDEN_RIASEC.forEach(t => { out[t] = counts[t] ? +(sums[t]/counts[t]).toFixed(2) : null; });
  return out;
}

// Lee la puntuación de un bloque `b` de un registro `r`, según el tipo de
// cuestionario: los de bienestar (C1/C2/HE) guardan scores planos
// {bloque: valor}; RIASEC guarda scores.final.{tipo: valor}.
function getScore(cfg, r, b){
  return cfg.tipo === "riasec" ? r.scores?.final?.[b] : r.scores?.[b];
}

function correct(val, inv, base=5){ return inv ? base - val : val; }

// Bloques especiales que nunca entran en la media de ninguna dimensión:
// "ALERTA" = posible conducta de riesgo (se revisa con umbral en el panel).
// "INFO"   = dato descriptivo que no pertenece a ninguna dimensión medida
//            (ej. apoyo familiar dentro de un cuestionario de clima escolar).
const BLOQUES_EXCLUIDOS = ["ALERTA", "INFO"];

// Bloques de bienestar/seguridad donde una media baja dispara alerta en el
// panel (umbral ≤2 sobre 4 — un punto por debajo del punto medio teórico de
// la escala). Es un criterio de cribado interno sin validar con datos,
// ajústalo si tu criterio profesional pide otro corte. Los bloques de
// técnica de estudio (B, J, y todo HE) no están aquí a propósito: una media
// baja ahí es información para el informe, no una urgencia de seguimiento.
const BLOQUES_ALERTA_BAJA = {
  A: "regulación del estrés", C: "autoestima", D: "habilidades sociales", E: "clima escolar/apoyo",
  F1: "seguridad frente al acoso (posible víctima)", F2: "entorno seguro y apoyo",
  H: "calidad del descanso", I: "bienestar anímico",
};

// Calcula media por bloque (1=peor, 4=mejor en todos los bloques) e ignora
// los bloques de BLOQUES_EXCLUIDOS.
function blockScores(items, bloques, answers, base=5){
  const sums = {}, counts = {};
  items.forEach((it, i) => {
    const [b, , inv] = it;
    if (BLOQUES_EXCLUIDOS.includes(b)) return;
    const raw = answers[i];
    if (raw == null) return;
    const c = correct(raw, inv, base);
    sums[b] = (sums[b]||0) + c;
    counts[b] = (counts[b]||0) + 1;
  });
  const out = {};
  Object.keys(bloques).forEach(b => { out[b] = counts[b] ? +(sums[b]/counts[b]).toFixed(2) : null; });
  // Ítems excluidos: se guardan aparte, con su valor bruto (sin corregir), 1-4.
  items.forEach((it, i) => {
    const [b] = it;
    if (BLOQUES_EXCLUIDOS.includes(b) && answers[i] != null) out[b + "_" + i] = answers[i];
  });
  // Alertas de bienestar/seguridad por bloque bajo (ver BLOQUES_ALERTA_BAJA).
  Object.keys(BLOQUES_ALERTA_BAJA).forEach(b => {
    if (out[b] != null && out[b] <= 2) out["ALERTA_BLOQUE_" + b] = true;
  });
  return out;
}

// Único punto de verdad para "¿esta respuesta dispara alguna alerta?": cubre
// tanto los ítems ALERTA_<índice> (conducta agresora, valor bruto 1-4) como
// ALERTA_BLOQUE_<clave> (media baja en un bloque de bienestar/seguridad,
// booleano). Evita tener el mismo criterio repetido y potencialmente
// desincronizado en varios sitios del panel.
function tieneAlerta(scores){
  return Object.entries(scores||{}).some(([k,v]) =>
    k.startsWith("ALERTA_") && (v === true || v >= 3)
  );
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
          <button onClick={()=>setTab("simulador")} style={tabStyle(tab==="simulador")}>Simulador de perfil</button>
        </nav>

        {tab==="responder" && <FormularioAlumno />}
        {tab==="panel" && <PanelAcceso />}
        {tab==="simulador" && <PanelAcceso Contenido={Simulador} />}
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
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [clase, setClase] = useState("");
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [libre, setLibre] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Permite enlazar/escanear (QR) directamente a un cuestionario concreto con
  // ?c=C1 | ?c=C2 | ?c=HE, saltando la pantalla de selección. Solo se aplica
  // una vez al cargar la página; si el parámetro no es válido, no hace nada.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("c");
    if (c && CUESTIONARIOS[c]) {
      const cfgInicial = CUESTIONARIOS[c];
      setCuestKey(c);
      setCurso(cfgInicial.cursos.length === 1 ? cfgInicial.cursos[0] : "");
      setStep(1);
    }
  }, []);

  // El correo es opcional: si se deja en blanco, vale; si se rellena, debe
  // ser del centro. Nombre, apellidos, curso y clase siguen siendo obligatorios.
  const emailValido = (v) => {
    const t = v.trim();
    return t === "" || /^[^\s@]+@svalero\.com$/i.test(t);
  };
  const cfg = cuestKey ? CUESTIONARIOS[cuestKey] : null;
  const total = cfg && cfg.items ? cfg.items.length : 0;

  const submit = useCallback(async () => {
    if (!nombre.trim() || !apellidos.trim() || !clase.trim() || !curso) { setError("Falta nombre, apellidos, curso o clase."); return; }
    if (!emailValido(codigo)) { setError("Si indicas un correo, debe terminar en @svalero.com"); return; }
    setEnviando(true);
    const scores = blockScores(cfg.items, cfg.bloques, answers, (cfg.escala ? cfg.escala[1]+1 : 5));
    const { error: err } = await supabase.from("respuestas_orientacion").insert({
      codigo: codigo.trim() ? codigo.trim().toLowerCase() : null, nombre: nombre.trim(), apellidos: apellidos.trim(),
      clase: clase.trim(), curso, cuestionario: cuestKey, scores, libre
    });
    setEnviando(false);
    if (err) { setError("No se pudo guardar: " + err.message); return; }
    setEnviado(true);
  }, [codigo, nombre, apellidos, clase, curso, cuestKey, cfg, answers, libre]);

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
        <p style={{color:"#5a5248", fontSize:14}}>Escribe tu nombre y apellidos, tu curso y tu clase. El correo del centro (@svalero.com) es opcional, uso interno, no se mostrará a nadie.</p>
        <input style={inputStyle} placeholder="Nombre" value={nombre} onChange={e=>setNombre(e.target.value)} />
        <input style={inputStyle} placeholder="Apellidos" value={apellidos} onChange={e=>setApellidos(e.target.value)} />
        <input style={inputStyle} placeholder="nombre@svalero.com (opcional)" value={codigo} onChange={e=>setCodigo(e.target.value)} />
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
          if(!nombre.trim()){setError("Falta el nombre.");return;}
          if(!apellidos.trim()){setError("Faltan los apellidos.");return;}
          if(!emailValido(codigo)){setError("Si indicas un correo, debe terminar en @svalero.com");return;}
          if(!curso){setError("Falta el curso.");return;}
          if(!clase.trim()){setError("Falta la clase.");return;}
          setError(""); setStep(2);
        }}>Empezar</button>
        <button onClick={()=>setStep(0)} style={{marginTop:10, background:"none", border:"none", color:"#8c6a4a", cursor:"pointer", fontSize:13, display:"block"}}>← Cambiar cuestionario</button>
      </div>
    );
  }

  if (step >= 2 && cfg.tipo === "riasec") {
    return (
      <FormularioRIASEC
        cfg={cfg} cuestKey={cuestKey}
        alumno={{ nombre: nombre.trim(), apellidos: apellidos.trim(), codigo: codigo.trim() ? codigo.trim().toLowerCase() : null, curso, clase: clase.trim() }}
        onCambiarCuestionario={()=>{ setStep(0); setCuestKey(""); }}
      />
    );
  }

  const itemIndex = step - 2;
  if (itemIndex >= 0 && itemIndex < total) {
    const [bloque, texto] = cfg.items[itemIndex];
    return (
      <div style={{maxWidth:520}}>
        <BarraProgreso actual={itemIndex+1} total={total} />
        <div style={{fontSize:12, color:"#5a7078", marginBottom:6}}>{bloque==="ALERTA" ? "Convivencia" : bloque==="INFO" ? "Entorno familiar" : cfg.bloques[bloque]}</div>
        <div style={{fontSize:18, marginBottom:16}}>{texto}</div>
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {(cfg.opciones || OPCIONES).map(op => (
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

// Cuestionario RIASEC: 4 bloques encadenados (intereses Likert, elección
// forzada, autoevaluación de habilidades, preguntas abiertas). Se maneja
// aparte de FormularioAlumno porque su estructura de pasos y su lógica de
// puntuación son muy distintas a las de los cuestionarios de bienestar.
function FormularioRIASEC({ cfg, cuestKey, alumno, onCambiarCuestionario }){
  const [pasoInterno, setPasoInterno] = useState(0);
  const [respLikert, setRespLikert] = useState({});
  const [respEleccion, setRespEleccion] = useState({});
  const [respHabilidad, setRespHabilidad] = useState({});
  const [abiertas, setAbiertas] = useState({});
  const [respValores, setRespValores] = useState({});
  const [respAptitudes, setRespAptitudes] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const valoresKeys = useMemo(() => Object.keys(VALORES_RIASEC), []);
  const aptitudesKeys = useMemo(() => Object.keys(APTITUDES_RIASEC), []);

  const pasos = useMemo(() => ([
    ...cfg.itemsLikert.map((it, i) => ({ tipoPaso:"likert", idx:i, bloqueTipo:it[0], texto:it[1] })),
    ...cfg.eleccion.map((it, i) => ({ tipoPaso:"eleccion", idx:i, texto:it.texto, opciones:it.opciones })),
    ...cfg.habilidades.map((it, i) => ({ tipoPaso:"habilidad", idx:i, bloqueTipo:it[0], texto:it[1] })),
    ...cfg.datosAbiertos.map((texto, i) => ({ tipoPaso:"abierta", idx:i, texto })),
    ...valoresKeys.map((k, i) => ({ tipoPaso:"valor", idx:i, clave:k, texto:`Importancia para ti de: ${VALORES_RIASEC[k].label}` })),
    ...aptitudesKeys.map((k, i) => ({ tipoPaso:"aptitud", idx:i, clave:k, texto:`¿Cómo de hábil te consideras en...: ${APTITUDES_RIASEC[k].label}?` })),
  ]), [cfg, valoresKeys, aptitudesKeys]);
  const total = pasos.length;

  // Nº máximo de veces que puede salir elegido cada tipo en el Bloque 2, para
  // poder normalizar el recuento a una escala 1-5 comparable con el Bloque 1.
  const maxEleccionPorTipo = useMemo(() => {
    const out = {};
    cfg.eleccion.forEach(it => it.opciones.forEach(op => { out[op.tipo] = (out[op.tipo]||0) + 1; }));
    return out;
  }, [cfg]);

  const submit = useCallback(async () => {
    setEnviando(true);
    const avgLikert = mediaPorTipoRiasec(cfg.itemsLikert, respLikert);
    const avgHabilidad = mediaPorTipoRiasec(cfg.habilidades, respHabilidad);
    const eleccionNormalizado = {};
    ORDEN_RIASEC.forEach(t => {
      const max = maxEleccionPorTipo[t];
      eleccionNormalizado[t] = max ? +(1 + ((respEleccion[t]||0)/max)*4).toFixed(2) : null;
    });
    const final = {};
    ORDEN_RIASEC.forEach(t => {
      const vals = [avgLikert[t], eleccionNormalizado[t]].filter(v => v != null);
      final[t] = vals.length ? +(vals.reduce((a,c)=>a+c,0)/vals.length).toFixed(2) : 0;
    });
    const ranking = [...ORDEN_RIASEC].sort((a,b) => (final[b]||0) - (final[a]||0));
    const codigoHolland = ranking.slice(0,3).map(letraRiasec).join("");
    const top2Pair = pairKeyRiasec(ranking[0], ranking[1]);
    const valoresFinal = {};
    valoresKeys.forEach((k, i) => { valoresFinal[k] = respValores[i] ?? null; });
    const aptitudesFinal = {};
    aptitudesKeys.forEach((k, i) => { aptitudesFinal[k] = respAptitudes[i] ?? null; });
    const scores = {
      likert: avgLikert, eleccionCount: respEleccion, eleccionNormalizado, final,
      habilidades: avgHabilidad, ranking, codigoHolland, top2Pair,
      abiertas: cfg.datosAbiertos.map((_, i) => abiertas[i] || ""),
      valores: valoresFinal, aptitudes: aptitudesFinal,
    };
    const { error: err } = await supabase.from("respuestas_orientacion").insert({
      codigo: alumno.codigo, nombre: alumno.nombre, apellidos: alumno.apellidos,
      clase: alumno.clase, curso: alumno.curso, cuestionario: cuestKey, scores, libre: null,
    });
    setEnviando(false);
    if (err) { setError("No se pudo guardar: " + err.message); return; }
    setEnviado(true);
  }, [cfg, respLikert, respEleccion, respHabilidad, abiertas, respValores, respAptitudes, valoresKeys, aptitudesKeys, maxEleccionPorTipo, alumno, cuestKey]);

  if (enviado) return <div style={{padding:20, background:"#e8ede8", borderRadius:4}}>Respuesta guardada. Gracias.</div>;

  const p = pasos[pasoInterno];
  const esUltima = pasoInterno === total - 1;
  const avanzar = () => { if (esUltima) { submit(); } else { setPasoInterno(pasoInterno+1); } };
  const etiquetaBloque = {
    likert: "Bloque 1 · Intereses",
    eleccion: "Bloque 2 · Preferencias de actividades",
    habilidad: "Bloque 3 · Autoevaluación de habilidades",
    abierta: "Bloque 4 · Cuéntanos más (opcional)",
    valor: "Bloque 5 · Valores de trabajo",
    aptitud: "Bloque 5 · Aptitudes técnicas",
  }[p.tipoPaso];

  const anterior = pasoInterno > 0 && (
    <button onClick={()=>setPasoInterno(pasoInterno-1)} style={{marginTop:14, background:"none", border:"none", color:"#5a7078", cursor:"pointer", fontSize:13}}>← Anterior</button>
  );

  if (["likert","habilidad","valor","aptitud"].includes(p.tipoPaso)) {
    const opciones = { likert:cfg.opcionesLikert, habilidad:cfg.opcionesHabilidad, valor:OPCIONES_IMPORTANCIA, aptitud:OPCIONES_HABILIDAD }[p.tipoPaso];
    const respuestas = { likert:respLikert, habilidad:respHabilidad, valor:respValores, aptitud:respAptitudes }[p.tipoPaso];
    const setRespuestas = { likert:setRespLikert, habilidad:setRespHabilidad, valor:setRespValores, aptitud:setRespAptitudes }[p.tipoPaso];
    return (
      <div style={{maxWidth:520}}>
        <BarraProgreso actual={pasoInterno+1} total={total} />
        <div style={{fontSize:12, color:"#5a7078", marginBottom:6}}>{etiquetaBloque}</div>
        <div style={{fontSize:18, marginBottom:16}}>{p.texto}</div>
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {opciones.map(op => (
            <button key={op.v} disabled={enviando} onClick={()=>{ setRespuestas(a=>({...a,[p.idx]:op.v})); avanzar(); }}
              style={{textAlign:"left", padding:"12px 14px", border:"1px solid #a9c1c7", background: respuestas[p.idx]===op.v ? "#12414f" : "#fff", color: respuestas[p.idx]===op.v ? "#fff" : "#1e2f38", borderRadius:2, cursor:"pointer", fontFamily:"inherit", fontSize:14}}>
              {op.v}. {op.l}
            </button>
          ))}
        </div>
        {error && <div style={{color:"#c2694a", fontSize:13, marginTop:8}}>{error}</div>}
        {anterior}
      </div>
    );
  }

  if (p.tipoPaso === "eleccion") {
    return (
      <div style={{maxWidth:520}}>
        <BarraProgreso actual={pasoInterno+1} total={total} />
        <div style={{fontSize:12, color:"#5a7078", marginBottom:6}}>{etiquetaBloque}</div>
        <div style={{fontSize:18, marginBottom:16}}>{p.texto}</div>
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {p.opciones.map((op, i) => (
            <button key={i} onClick={()=>{ setRespEleccion(a=>({...a,[op.tipo]:(a[op.tipo]||0)+1})); avanzar(); }}
              style={{textAlign:"left", padding:"12px 14px", border:"1px solid #a9c1c7", background:"#fff", color:"#1e2f38", borderRadius:2, cursor:"pointer", fontFamily:"inherit", fontSize:14}}>
              {op.label}
            </button>
          ))}
        </div>
        {anterior}
      </div>
    );
  }

  // abierta
  return (
    <div style={{maxWidth:520}}>
      <BarraProgreso actual={pasoInterno+1} total={total} />
      <div style={{fontSize:12, color:"#8c6a4a", marginBottom:6}}>{etiquetaBloque}</div>
      <div style={{fontSize:18, marginBottom:16}}>{p.texto}</div>
      <textarea style={{...inputStyle, height:90}} value={abiertas[p.idx] || ""} onChange={e=>setAbiertas(a=>({...a,[p.idx]:e.target.value}))} placeholder="Puedes dejarlo en blanco" />
      <button style={btnPrimary} disabled={enviando} onClick={avanzar}>{enviando ? "Enviando..." : esUltima ? "Finalizar y enviar" : "Siguiente"}</button>
      {error && <div style={{color:"#c2694a", fontSize:13, marginTop:8}}>{error}</div>}
      {anterior}
    </div>
  );
}

function PanelAcceso({ Contenido = PanelOrientacion }){
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

  if (unlocked) return <Contenido secret={secret} />;

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
  const [grupoActivo, setGrupoActivo] = useState(null); // {curso, clase} | null = todos los grupos juntos
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState("carpetas"); // carpetas | grupo | informeIndividual | informeGrupo
  const [mostrarGrupo, setMostrarGrupo] = useState(true);

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

  // Carpetas: una por cada combinación curso+clase que exista de verdad en
  // las respuestas de este cuestionario. "E2" se repite en 1º, 2º, 3º y 4º
  // ESO, así que agrupar solo por clase mezclaría alumnos de cursos
  // distintos como si fueran el mismo grupo.
  const carpetas = useMemo(() => {
    const map = new Map();
    base.forEach(r => {
      const key = `${r.curso}|||${r.clase}`;
      if (!map.has(key)) map.set(key, { curso: r.curso, clase: r.clase, total: 0, alertas: 0 });
      const c = map.get(key);
      c.total++;
      if (tieneAlerta(r.scores)) c.alertas++;
    });
    return [...map.values()].sort((a,b) => (a.curso+a.clase).localeCompare(b.curso+b.clase));
  }, [base]);

  const filtered = grupoActivo ? base.filter(r => r.curso===grupoActivo.curso && r.clase===grupoActivo.clase) : base;

  const groupAvg = Object.keys(cfg.bloques).map(b => {
    const vals = filtered.map(r=>getScore(cfg,r,b)).filter(v=>v!=null);
    const avg = vals.length ? vals.reduce((a,c)=>a+c,0)/vals.length : 0;
    return { bloque: cfg.bloques[b], key:b, media: +avg.toFixed(2) };
  });

  // Ítems de alerta: se guardan aparte, con su valor bruto (sin corregir), 1-4.
  const alertas = filtered.filter(r => tieneAlerta(r.scores));

  const irACarpetas = () => { setVista("carpetas"); setGrupoActivo(null); setSelected(null); };
  const abrirCarpeta = (curso, clase) => { setGrupoActivo({curso, clase}); setSelected(null); setVista("grupo"); };

  if (vista === "informeIndividual" && selected) {
    return <InformeIndividual r={selected} groupAvg={groupAvg} cfg={cfg} onVolver={()=>setVista("grupo")} mostrarGrupoInicial={mostrarGrupo} />;
  }
  if (vista === "informeGrupo") {
    return <InformeGrupo filtered={filtered} groupAvg={groupAvg} cfg={cfg} alertas={alertas} cuestKey={cuestKey}
      curso={grupoActivo?.curso || ""} clase={grupoActivo?.clase || ""} onVolver={()=>setVista("grupo")} />;
  }

  const tabsCuestionario = (
    <div style={{display:"flex", gap:8, marginBottom:16}}>
      {Object.entries(CUESTIONARIOS).map(([key,c]) => (
        <button key={key} onClick={()=>{ setCuestKey(key); irACarpetas(); }}
          style={tabStyle(cuestKey===key)}>{key}</button>
      ))}
    </div>
  );

  if (vista === "carpetas") {
    return (
      <div>
        {tabsCuestionario}
        <div style={{fontSize:14, color:"#5a5248", marginBottom:4}}>{loading ? "Cargando…" : `${base.length} respuestas en total`} · se actualiza cada 5s</div>
        <h3 style={{fontSize:16, margin:"12px 0 4px"}}>Carpetas por grupo · {cfg.label}</h3>
        <div style={{fontSize:12, color:"#8c6a4a", marginBottom:12}}>Cada carpeta contiene solo las respuestas de ese curso y clase para este cuestionario.</div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:12, marginBottom:20}}>
          {carpetas.map(c => (
            <div key={c.curso+c.clase} onClick={()=>abrirCarpeta(c.curso, c.clase)}
              style={{cursor:"pointer", border:"1px solid #a9c1c7", borderRadius:4, padding:"14px 16px", background:"#fff"}}>
              <div style={{fontSize:22, marginBottom:6}}>📁</div>
              <div style={{fontWeight:"bold", fontSize:14}}>{c.curso} · {c.clase}</div>
              <div style={{fontSize:12, color:"#5a7078", marginTop:4}}>{c.total} respuesta{c.total!==1?"s":""}</div>
              {c.alertas > 0 && <div style={{fontSize:12, color:"#c2694a", marginTop:2}}>⚠ {c.alertas} con alerta</div>}
            </div>
          ))}
          {carpetas.length===0 && !loading && (
            <div style={{fontSize:13, color:"#8c6a4a"}}>Sin respuestas aún para este cuestionario.</div>
          )}
        </div>
        {carpetas.length > 0 && (
          <button onClick={()=>{ setGrupoActivo(null); setSelected(null); setVista("grupo"); }} style={{...btnPrimary, background:"#5a7078"}}>
            Ver todos los grupos juntos
          </button>
        )}
      </div>
    );
  }

  // vista === "grupo": panel de un grupo concreto (o de todos juntos, si se entró por "Ver todos los grupos juntos")
  return (
    <div>
      {tabsCuestionario}

      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap"}}>
        <button onClick={irACarpetas} style={{...btnPrimary, background:"#5a7078"}}>← Volver a carpetas</button>
        <div style={{fontSize:14, fontWeight:"bold"}}>
          {grupoActivo ? `📁 ${grupoActivo.curso} · ${grupoActivo.clase}` : "Todos los grupos"}
        </div>
        <div style={{fontSize:13, color:"#5a5248"}}>{loading ? "Cargando…" : `${filtered.length} respuestas`} · se actualiza cada 5s</div>
      </div>

      {alertas.length > 0 && (
        <div style={{background:"#f7e9e5", border:"1px solid #c2694a", borderRadius:4, padding:"10px 14px", marginBottom:20, fontSize:13}}>
          ⚠ {alertas.length} alumno/a(s) han indicado haber participado en conductas de exclusión/acoso hacia compañeros/as. Revisar de forma individual, protocolo de convivencia.
        </div>
      )}

      <h3 style={{fontSize:16, marginBottom:4}}>Media grupal por bloque</h3>
      <div style={{fontSize:12, color:"#8c6a4a", marginBottom:8}}>
        {cfg.tipo === "riasec"
          ? "Más alto = mayor interés/afinidad con ese tipo. No hay bloques \"buenos\" o \"malos\": es un mapa de intereses, no una escala de bienestar."
          : "En todos los bloques: más alto (cerca de 4) = más bienestar/protección. Más bajo (cerca de 1) = más riesgo."}
      </div>
      <div style={{background:"#fff", border:"1px solid #e0d8ca", borderRadius:4, padding:12, marginBottom:12}}>
        <select
          value={selected ? selected.clase+selected.codigo+selected.cuestionario : ""}
          onChange={e=>{
            const rec = filtered.find(r => (r.clase+r.codigo+r.cuestionario) === e.target.value);
            setSelected(rec || null);
          }}
          style={{padding:"6px 10px", fontFamily:"inherit", fontSize:13, marginBottom:10}}>
          <option value="">Solo media del grupo</option>
          {filtered.map(r => (
            <option key={r.clase+r.codigo+r.cuestionario} value={r.clase+r.codigo+r.cuestionario}>
              {r.nombre ? `${r.apellidos}, ${r.nombre}` : r.codigo} · {r.curso} {r.clase}
            </option>
          ))}
        </select>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={groupAvg.map(g => ({...g, alumno: selected ? (getScore(cfg,selected,g.key) ?? null) : null}))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
            <XAxis dataKey="bloque" tick={{fontSize:11}} />
            <YAxis domain={cfg.escala} />
            <Tooltip />
            {selected && <Legend wrapperStyle={{fontSize:12}} />}
            <Bar name="Media grupo" dataKey="media" radius={[3,3,0,0]}>
              {groupAvg.map(g => <Cell key={g.key} fill={COLORS[g.key]} />)}
            </Bar>
            {selected && <Line name={selected.nombre ? `${selected.nombre} ${selected.apellidos}` : selected.codigo} type="monotone" dataKey="alumno" stroke="#12414f" strokeWidth={2} dot={{r:4}} connectNulls />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <button onClick={()=>setVista("informeGrupo")} disabled={filtered.length===0} style={{...btnPrimary, marginBottom:28}}>
        Generar informe del grupo
      </button>

      <h3 style={{fontSize:16, marginBottom:8}}>Consulta individual</h3>
      <div style={{display:"flex", gap:20, flexWrap:"wrap"}}>
        <div style={{width:240, maxHeight:340, overflowY:"auto", border:"1px solid #e0d8ca", borderRadius:4}}>
          {filtered.map(r => {
            const esAlerta = tieneAlerta(r.scores);
            return (
              <div key={r.clase+r.codigo+r.cuestionario} onClick={()=>setSelected(r)}
                style={{padding:"8px 12px", cursor:"pointer", background: selected===r ? "#f0e8db" : "transparent", borderBottom:"1px solid #eee", fontSize:13}}>
                {esAlerta && <span style={{color:"#c2694a"}}>⚠ </span>}
                {r.nombre ? `${r.apellidos}, ${r.nombre}` : r.codigo} <span style={{color:"#8c6a4a"}}>· {r.curso} {r.clase}</span>
              </div>
            );
          })}
          {filtered.length===0 && <div style={{padding:12, fontSize:13, color:"#8c6a4a"}}>Sin respuestas aún.</div>}
        </div>
        <div style={{flex:1, minWidth:280, background:"#fff", border:"1px solid #e0d8ca", borderRadius:4, padding:12}}>
          {selected ? (
            <>
              <div style={{fontSize:14, marginBottom:8}}><strong>{selected.nombre ? `${selected.nombre} ${selected.apellidos}` : selected.codigo}</strong> · {selected.curso} {selected.clase}</div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={Object.keys(cfg.bloques).map(b=>({bloque:cfg.bloques[b], alumno:getScore(cfg,selected,b)||0, grupo: groupAvg.find(g=>g.key===b)?.media||0}))}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="bloque" tick={{fontSize:10}} />
                  <PolarRadiusAxis domain={cfg.escala} />
                  <Radar name="Alumno/a" dataKey="alumno" stroke="#c2694a" fill="#c2694a" fillOpacity={0.35} />
                  <Radar name="Media grupo" dataKey="grupo" stroke="#4a7a8c" fill="#4a7a8c" fillOpacity={0.15} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
              {cfg.tipo === "riasec" && selected.scores?.codigoHolland && (
                <div style={{marginTop:10, fontSize:13, background:"#eef5f2", border:"1px solid #4a8c6a", padding:10, borderRadius:3}}>
                  Código Holland: <strong>{selected.scores.codigoHolland}</strong>
                </div>
              )}
              {tieneAlerta(selected.scores) && (
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

function InformeIndividual({ r, groupAvg, cfg, onVolver, mostrarGrupoInicial }){
  const fecha = new Date().toLocaleDateString("es-ES", { year:"numeric", month:"long", day:"numeric" });
  const esAlertaConducta = Object.entries(r.scores||{}).some(([k,v]) => /^ALERTA_\d+$/.test(k) && v>=3);
  const dimensionesBajas = Object.entries(BLOQUES_ALERTA_BAJA).filter(([b]) => r.scores?.["ALERTA_BLOQUE_"+b] === true).map(([,label]) => label);
  const [mostrarGrupo, setMostrarGrupo] = useState(mostrarGrupoInicial ?? true);
  return (
    <div>
      <div className="no-print" style={{display:"flex", gap:10, marginBottom:20, alignItems:"center"}}>
        <button onClick={onVolver} style={{...btnPrimary, background:"#5a7078"}}>← Volver al panel</button>
        <button onClick={()=>window.print()} style={btnPrimary}>Imprimir / Guardar como PDF</button>
        <label style={{display:"flex", alignItems:"center", gap:6, fontSize:13, color:"#5a7078", cursor:"pointer"}}>
          <input type="checkbox" checked={mostrarGrupo} onChange={e=>setMostrarGrupo(e.target.checked)} />
          Comparar con la media del grupo
        </label>
      </div>

      <div style={{border:"1px solid #12414f", padding:24, background:"#fff"}}>
        <div style={{display:"flex", alignItems:"center", gap:12, borderBottom:"2px solid #12414f", paddingBottom:12, marginBottom:16}}>
          <img src="/logo.jpg" alt="" style={{height:44}} />
          <div>
            <div style={{fontSize:18, fontWeight:"bold"}}>Informe orientativo individual</div>
            <div style={{fontSize:12, color:"#5a7078"}}>Departamento de Orientación · Centro San Valero · {fecha}</div>
          </div>
        </div>

        <p style={{fontSize:12, color:"#5a7078", background:"#f4f7f8", padding:10, borderRadius:3}}>{cfg.tipo === "riasec" ? AVISO_RIASEC : AVISO_INFORME}</p>

        <table style={{fontSize:14, marginBottom:16}}>
          <tbody>
            <tr><td style={{paddingRight:12, color:"#5a7078"}}>Alumno/a</td><td>{r.nombre ? `${r.nombre} ${r.apellidos}` : r.codigo}</td></tr>
            <tr><td style={{paddingRight:12, color:"#5a7078"}}>Curso / Clase</td><td>{r.curso} {r.clase}</td></tr>
            <tr><td style={{paddingRight:12, color:"#5a7078"}}>Cuestionario</td><td>{r.cuestionario}</td></tr>
          </tbody>
        </table>

        {esAlertaConducta && (
          <div style={{background:"#f7e9e5", border:"1px solid #c2694a", padding:10, borderRadius:3, fontSize:13, marginBottom:16}}>
            ⚠ Ha indicado con frecuencia haber participado en excluir o meterse con algún compañero/a. Se recomienda seguimiento individual siguiendo el protocolo de convivencia del centro.
          </div>
        )}
        {dimensionesBajas.length > 0 && (
          <div style={{background:"#f7e9e5", border:"1px solid #c2694a", padding:10, borderRadius:3, fontSize:13, marginBottom:16}}>
            ⚠ Puntuación baja en: {dimensionesBajas.join(", ")}. Se recomienda valorar una conversación individual antes de compartir el informe.
          </div>
        )}

        {cfg.tipo === "riasec" ? (
          <InformeRIASECBody r={r} cfg={cfg} groupAvg={groupAvg} mostrarGrupo={mostrarGrupo} />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={Object.keys(cfg.bloques).map(b=>({bloque:cfg.bloques[b], alumno:getScore(cfg,r,b)||0, grupo: groupAvg.find(g=>g.key===b)?.media||0}))}>
                <PolarGrid />
                <PolarAngleAxis dataKey="bloque" tick={{fontSize:10}} />
                <PolarRadiusAxis domain={cfg.escala} />
                <Radar name="Alumno/a" dataKey="alumno" stroke="#c2694a" fill="#c2694a" fillOpacity={0.35} />
                {mostrarGrupo && <Radar name="Media grupo" dataKey="grupo" stroke="#4a7a8c" fill="#4a7a8c" fillOpacity={0.15} />}
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>

            <table style={{width:"100%", borderCollapse:"collapse", fontSize:13, marginTop:16, marginBottom:16}}>
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
                  const score = getScore(cfg,r,b);
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
          </>
        )}

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

// Cuerpo del informe individual específico del cuestionario RIASEC: código
// Holland de 3 letras, descripciones de los tipos dominantes, familias
// profesionales/profesiones/consejos para la combinación de los 2 tipos más
// altos, autoevaluación de habilidades y respuestas abiertas.
function InformeRIASECBody({ r, cfg, groupAvg, mostrarGrupo }){
  const s = r.scores || {};
  const ranking = s.ranking || ORDEN_RIASEC;
  const top3 = ranking.slice(0,3);
  const combo = s.top2Pair ? FAMILIAS_RIASEC[s.top2Pair] : null;

  return (
    <>
      <div style={{textAlign:"center", margin:"12px 0 20px"}}>
        <div style={{fontSize:12, color:"#8c6a4a"}}>Código Holland</div>
        <div style={{fontSize:32, fontWeight:"bold", letterSpacing:2, color:"#12414f"}}>{s.codigoHolland || "—"}</div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={ORDEN_RIASEC.map(b=>({bloque:cfg.bloques[b], alumno:s.final?.[b]||0, grupo: groupAvg.find(g=>g.key===b)?.media||0}))}>
          <PolarGrid />
          <PolarAngleAxis dataKey="bloque" tick={{fontSize:10}} />
          <PolarRadiusAxis domain={cfg.escala} />
          <Radar name="Alumno/a" dataKey="alumno" stroke="#c2694a" fill="#c2694a" fillOpacity={0.35} />
          {mostrarGrupo && <Radar name="Media grupo" dataKey="grupo" stroke="#4a7a8c" fill="#4a7a8c" fillOpacity={0.15} />}
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>

      <table style={{width:"100%", borderCollapse:"collapse", fontSize:13, marginTop:16, marginBottom:16}}>
        <thead>
          <tr style={{textAlign:"left", borderBottom:"1px solid #ccc"}}>
            <th style={{padding:"6px 4px"}}>Tipo</th>
            <th style={{padding:"6px 4px"}}>Puntuación (1-5)</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((t,i) => (
            <tr key={t} style={{borderBottom:"1px solid #eee", fontWeight: i<3 ? "bold" : "normal"}}>
              <td style={{padding:"6px 4px"}}>{cfg.bloques[t]} ({letraRiasec(t)})</td>
              <td style={{padding:"6px 4px"}}>{s.final?.[t] ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{fontSize:14, fontWeight:"bold", marginBottom:6}}>Tus tipos dominantes</div>
      {top3.map(t => (
        <div key={t} style={{fontSize:13, marginBottom:8}}>
          <strong>{cfg.bloques[t]} ({letraRiasec(t)}):</strong> {TIPOS_RIASEC_DESC[t]}
        </div>
      ))}

      {combo && (
        <div style={{background:"#f4f7f8", border:"1px solid #a9c1c7", borderRadius:4, padding:12, margin:"12px 0 16px"}}>
          <div style={{fontSize:13, marginBottom:8}}>{combo.desc}</div>
          <div style={{fontSize:13, marginBottom:4}}><strong>Familias profesionales afines:</strong> {combo.familias.join(", ")}</div>
          <div style={{fontSize:13, marginBottom:4}}><strong>Ejemplos de estudios/profesiones:</strong> {combo.profesiones.join(", ")}</div>
          <div style={{fontSize:13}}><strong>Para explorarlo:</strong> {combo.consejos.join(" ")}</div>
        </div>
      )}

      {s.habilidades && Object.values(s.habilidades).some(v=>v!=null) && (
        <>
          <div style={{fontSize:14, fontWeight:"bold", marginBottom:6}}>Autoevaluación de habilidades (cómo se ve el/la alumno/a, no puntúa en el perfil)</div>
          <table style={{width:"100%", borderCollapse:"collapse", fontSize:13, marginBottom:16}}>
            <tbody>
              {ORDEN_RIASEC.filter(t => s.habilidades[t] != null).map(t => (
                <tr key={t} style={{borderBottom:"1px solid #eee"}}>
                  <td style={{padding:"6px 4px"}}>{cfg.bloques[t]}</td>
                  <td style={{padding:"6px 4px"}}>{s.habilidades[t]} / 5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {Array.isArray(s.abiertas) && s.abiertas.some(a=>a && a.trim()) && (
        <>
          <div style={{fontSize:14, fontWeight:"bold", marginBottom:6}}>Respuestas abiertas</div>
          {cfg.datosAbiertos.map((pregunta,i) => s.abiertas[i] && s.abiertas[i].trim() ? (
            <div key={i} style={{fontSize:13, background:"#faf6ef", padding:10, borderRadius:3, marginBottom:8}}>
              <strong>{pregunta}</strong><br/>{s.abiertas[i]}
            </div>
          ) : null)}
        </>
      )}

      <div style={{fontSize:12, color:"#5a7078", background:"#eef5f2", border:"1px solid #4a8c6a", padding:10, borderRadius:3, marginTop:8}}>
        Recuerda: este perfil es una guía para explorar opciones, no una sentencia. Tus intereses pueden cambiar con el tiempo y la experiencia.
      </div>
    </>
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

        <p style={{fontSize:12, color:"#5a7078", background:"#f4f7f8", padding:10, borderRadius:3}}>{cfg.tipo === "riasec" ? AVISO_RIASEC : AVISO_INFORME} Este informe agrega datos de varios alumnos/as y contiene información identificable (nombre y apellidos) — uso exclusivo del equipo docente/orientación, no debe entregarse a familias.</p>

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
              <th style={{padding:"6px 4px"}}>Media del grupo ({cfg.escala[0]}-{cfg.escala[1]})</th>
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

        {cfg.tipo === "riasec" ? (
          <>
            <div style={{fontSize:14, fontWeight:"bold", marginBottom:6}}>Códigos Holland del grupo</div>
            {filtered.length === 0 ? (
              <div style={{fontSize:13, color:"#5a7078", marginBottom:16}}>Sin respuestas.</div>
            ) : (
              <ul style={{fontSize:13, marginBottom:16}}>
                {filtered.map(a => <li key={a.codigo+a.clase}>{a.nombre ? `${a.nombre} ${a.apellidos}` : a.codigo} · {a.scores?.codigoHolland || "—"}</li>)}
              </ul>
            )}
          </>
        ) : (
          <>
            <div style={{fontSize:14, fontWeight:"bold", marginBottom:6}}>Casos con alerta de convivencia ({alertas.length})</div>
            {alertas.length === 0 ? (
              <div style={{fontSize:13, color:"#5a7078", marginBottom:16}}>Ninguno en este grupo.</div>
            ) : (
              <ul style={{fontSize:13, marginBottom:16}}>
                {alertas.map(a => <li key={a.codigo+a.clase}>{a.nombre ? `${a.nombre} ${a.apellidos}` : a.codigo} · {a.curso} {a.clase}</li>)}
              </ul>
            )}
          </>
        )}

        <div style={{fontSize:11, color:"#8c9aa0", marginTop:20, borderTop:"1px solid #eee", paddingTop:8}}>
          Documento generado el {fecha}. Uso interno del centro.
        </div>
      </div>
    </div>
  );
}

const sliderStyle = {width:"100%"};
const CODIGOS_ENTORNO = Object.keys(FAMILIAS_RIASEC);

// Simulador de perfil profesional: busca (o introduce a mano) puntuaciones
// RIASEC + Big Five, deja fijar la importancia de 6 valores de trabajo y 5
// aptitudes técnicas, y calcula un índice de congruencia orientativo con
// cada uno de los 15 entornos/familias profesionales, mostrando los 3 más
// compatibles con el desglose de cada componente.
function Simulador({ secret }){
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [alumnoSel, setAlumnoSel] = useState(null);

  const [riasec, setRiasec] = useState({}); // {R_x: 1-5}
  const [bigfive, setBigfive] = useState({}); // {BF_x: 1-7}
  const valoresNeutro = () => Object.fromEntries(Object.keys(VALORES_RIASEC).map(k=>[k,3]));
  const aptitudesNeutro = () => Object.fromEntries(Object.keys(APTITUDES_RIASEC).map(k=>[k,3]));
  const [valores, setValores] = useState(valoresNeutro());
  const [aptitudes, setAptitudes] = useState(aptitudesNeutro());
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/respuestas?secret=${encodeURIComponent(secret)}`);
        const data = await res.json();
        setRecords(data.records || []);
      } catch(e) {}
      setLoading(false);
    })();
  }, [secret]);

  // Personas únicas (nombre+apellidos+curso+clase) que tienen al menos un
  // cuestionario RIASEC o BF respondido, filtradas por el texto de búsqueda.
  const personas = useMemo(() => {
    const map = new Map();
    records.filter(r => r.cuestionario === "RIASEC" || r.cuestionario === "BF").forEach(r => {
      const key = `${r.nombre}|||${r.apellidos}|||${r.curso}|||${r.clase}`;
      if (!map.has(key)) map.set(key, { nombre:r.nombre, apellidos:r.apellidos, curso:r.curso, clase:r.clase });
    });
    const q = busqueda.trim().toLowerCase();
    return [...map.values()].filter(p => !q || `${p.nombre} ${p.apellidos}`.toLowerCase().includes(q));
  }, [records, busqueda]);

  const elegirPersona = (p) => {
    setAlumnoSel(p);
    setResultado(null);
    const rRiasec = records.find(r => r.cuestionario==="RIASEC" && r.nombre===p.nombre && r.apellidos===p.apellidos && r.curso===p.curso && r.clase===p.clase);
    const rBf = records.find(r => r.cuestionario==="BF" && r.nombre===p.nombre && r.apellidos===p.apellidos && r.curso===p.curso && r.clase===p.clase);
    setRiasec(rRiasec?.scores?.final || {});
    setBigfive(rBf?.scores || {});
    // El Bloque 5 del RIASEC (si el alumno/a lo respondió) trae ya su propia
    // valoración de valores y aptitudes — se precarga, con neutro (3) donde
    // falte un dato.
    setValores({ ...valoresNeutro(), ...Object.fromEntries(Object.entries(rRiasec?.scores?.valores||{}).filter(([,v])=>v!=null)) });
    setAptitudes({ ...aptitudesNeutro(), ...Object.fromEntries(Object.entries(rRiasec?.scores?.aptitudes||{}).filter(([,v])=>v!=null)) });
  };

  const limpiar = () => { setAlumnoSel(null); setRiasec({}); setBigfive({}); setValores(valoresNeutro()); setAptitudes(aptitudesNeutro()); setResultado(null); };

  const calcular = () => {
    const bfDisponible = ["BF_O","BF_C","BF_E","BF_A","BF_ES"].every(k => bigfive[k] != null);
    const personBFNorm = {};
    if (bfDisponible) ["BF_O","BF_C","BF_E","BF_A","BF_ES"].forEach(k => { personBFNorm[k] = (bigfive[k]-4)/3; });
    const personValoresNorm = {};
    Object.keys(VALORES_RIASEC).forEach(k => { personValoresNorm[k] = ((valores[k]??3)-3)/2; });
    const personAptitudesNorm = {};
    Object.keys(APTITUDES_RIASEC).forEach(k => { personAptitudesNorm[k] = ((aptitudes[k]??3)-3)/2; });

    const filas = CODIGOS_ENTORNO.map(codigo2 => {
      const envVec = envVecRiasec(codigo2);
      const cR = congruenciaRiasec(riasec, envVec);
      const cBF = bfDisponible ? afinidadCoseno(personBFNorm, envPerfilBigFive(codigo2), ["BF_O","BF_C","BF_E","BF_A","BF_ES"]) : null;
      const cVal = afinidadCoseno(personValoresNorm, envPerfilValorAptitud(VALORES_RIASEC, codigo2), Object.keys(VALORES_RIASEC));
      const cApt = afinidadCoseno(personAptitudesNorm, envPerfilValorAptitud(APTITUDES_RIASEC, codigo2), Object.keys(APTITUDES_RIASEC));
      const pesos = bfDisponible ? {r:0.55,bf:0.20,v:0.15,a:0.10} : {r:0.75,bf:0,v:0.15,a:0.10};
      const indice = Math.round(100 * (pesos.r*cR + pesos.bf*(cBF||0) + pesos.v*cVal + pesos.a*cApt));
      return { codigo2, indice, cR, cBF, cVal, cApt, bfDisponible, combo: FAMILIAS_RIASEC[codigo2] };
    }).sort((a,b) => b.indice - a.indice);

    setResultado(filas.slice(0,3));
  };

  const riasecCompleto = ORDEN_RIASEC.every(t => riasec[t] != null);

  return (
    <div>
      <h3 style={{fontSize:16, marginBottom:4}}>Simulador de perfil profesional</h3>
      <div style={{fontSize:12, color:"#8c6a4a", marginBottom:16}}>{AVISO_SIMULADOR}</div>

      <div style={{display:"flex", gap:20, flexWrap:"wrap", marginBottom:20}}>
        <div style={{width:260}}>
          <div style={{fontSize:13, fontWeight:"bold", marginBottom:6}}>Buscar alumno/a (opcional)</div>
          <input style={inputStyle} placeholder="Nombre o apellidos..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} />
          <div style={{maxHeight:180, overflowY:"auto", border:"1px solid #e0d8ca", borderRadius:4}}>
            {loading ? <div style={{padding:10, fontSize:13}}>Cargando…</div> : personas.length===0 ? (
              <div style={{padding:10, fontSize:13, color:"#8c6a4a"}}>Sin coincidencias con RIASEC o Big Five respondidos.</div>
            ) : personas.map((p,i) => (
              <div key={i} onClick={()=>elegirPersona(p)}
                style={{padding:"8px 12px", cursor:"pointer", fontSize:13, borderBottom:"1px solid #eee", background: alumnoSel===p ? "#f0e8db" : "transparent"}}>
                {p.apellidos}, {p.nombre} <span style={{color:"#8c6a4a"}}>· {p.curso} {p.clase}</span>
              </div>
            ))}
          </div>
          {alumnoSel && (
            <button onClick={limpiar} style={{marginTop:8, background:"none", border:"none", color:"#8c6a4a", cursor:"pointer", fontSize:13}}>
              ← Quitar selección / modo manual
            </button>
          )}
        </div>

        <div style={{flex:1, minWidth:280}}>
          <div style={{fontSize:13, fontWeight:"bold", marginBottom:6}}>RIASEC (1-5) {alumnoSel && riasecCompleto && <span style={{color:"#4a8c6a", fontWeight:"normal"}}>· precargado del cuestionario</span>}</div>
          {ORDEN_RIASEC.map(t => (
            <div key={t} style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
              <div style={{width:110, fontSize:12}}>{BLOQUES_RIASEC[t]}</div>
              <input type="range" min="1" max="5" step="0.1" style={sliderStyle} value={riasec[t] ?? 3}
                onChange={e=>setRiasec(r=>({...r,[t]:+e.target.value}))} />
              <div style={{width:28, fontSize:12, textAlign:"right"}}>{(riasec[t] ?? 3).toFixed ? (riasec[t] ?? 3).toFixed(1) : riasec[t]}</div>
            </div>
          ))}
          {!riasecCompleto && <div style={{fontSize:11, color:"#c2694a", marginTop:4}}>Ajusta los 5 deslizadores o busca un/a alumno/a con RIASEC respondido.</div>}

          <div style={{fontSize:13, fontWeight:"bold", margin:"16px 0 6px"}}>Personalidad Big Five (1-7, opcional) {alumnoSel && Object.keys(bigfive).length>0 && <span style={{color:"#4a8c6a", fontWeight:"normal"}}>· precargado</span>}</div>
          {["BF_O","BF_C","BF_E","BF_A","BF_ES"].map(t => (
            <div key={t} style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
              <div style={{width:110, fontSize:12}}>{BLOQUES_BF[t]}</div>
              <input type="range" min="1" max="7" step="0.1" style={sliderStyle} value={bigfive[t] ?? ""}
                onChange={e=>setBigfive(b=>({...b,[t]:+e.target.value}))} placeholder="—" />
              <div style={{width:28, fontSize:12, textAlign:"right"}}>{bigfive[t]!=null ? Number(bigfive[t]).toFixed(1) : "—"}</div>
            </div>
          ))}
          <button onClick={()=>setBigfive({})} style={{marginTop:2, background:"none", border:"none", color:"#8c6a4a", cursor:"pointer", fontSize:12}}>Vaciar personalidad (no usarla en el cálculo)</button>

          <div style={{fontSize:13, fontWeight:"bold", margin:"16px 0 6px"}}>Valores de trabajo (importancia, 1-5, neutro=3) {alumnoSel && Object.keys(records.find(r=>r.cuestionario==="RIASEC"&&r.nombre===alumnoSel.nombre&&r.apellidos===alumnoSel.apellidos)?.scores?.valores||{}).length>0 && <span style={{color:"#4a8c6a", fontWeight:"normal"}}>· precargado del RIASEC (Bloque 5)</span>}</div>
          {Object.entries(VALORES_RIASEC).map(([k,v]) => (
            <div key={k} style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
              <div style={{width:170, fontSize:12}}>{v.label}</div>
              <input type="range" min="1" max="5" step="0.5" style={sliderStyle} value={valores[k]} onChange={e=>setValores(vv=>({...vv,[k]:+e.target.value}))} />
              <div style={{width:28, fontSize:12, textAlign:"right"}}>{valores[k]}</div>
            </div>
          ))}

          <div style={{fontSize:13, fontWeight:"bold", margin:"16px 0 6px"}}>Aptitudes técnicas autopercibidas (1-5, neutro=3) {alumnoSel && Object.keys(records.find(r=>r.cuestionario==="RIASEC"&&r.nombre===alumnoSel.nombre&&r.apellidos===alumnoSel.apellidos)?.scores?.aptitudes||{}).length>0 && <span style={{color:"#4a8c6a", fontWeight:"normal"}}>· precargado del RIASEC (Bloque 5)</span>}</div>
          {Object.entries(APTITUDES_RIASEC).map(([k,v]) => (
            <div key={k} style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
              <div style={{width:170, fontSize:12}}>{v.label}</div>
              <input type="range" min="1" max="5" step="0.5" style={sliderStyle} value={aptitudes[k]} onChange={e=>setAptitudes(aa=>({...aa,[k]:+e.target.value}))} />
              <div style={{width:28, fontSize:12, textAlign:"right"}}>{aptitudes[k]}</div>
            </div>
          ))}

          <button style={{...btnPrimary, marginTop:16}} onClick={calcular}>Calcular compatibilidad</button>
        </div>
      </div>

      {resultado && (
        <div>
          <h3 style={{fontSize:16, marginBottom:12}}>Los 3 entornos más compatibles</h3>
          {resultado.map((f,i) => (
            <div key={f.codigo2} style={{border:"1px solid #a9c1c7", borderRadius:4, padding:16, marginBottom:14, background:"#fff"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6}}>
                <div style={{fontSize:15, fontWeight:"bold"}}>{i+1}. Código {f.codigo2} — {f.combo.familias.join(" / ")}</div>
                <div style={{fontSize:20, fontWeight:"bold", color:"#12414f"}}>{f.indice}%</div>
              </div>
              <div style={{fontSize:13, marginBottom:8}}>{f.combo.desc}</div>
              <div style={{fontSize:12, color:"#5a7078", marginBottom:8}}>
                Desglose — RIASEC: {Math.round(f.cR*100)}%
                {f.bfDisponible ? ` · Personalidad: ${Math.round(f.cBF*100)}%` : " · Personalidad: no incluida"}
                {` · Valores: ${Math.round(f.cVal*100)}% · Aptitudes: ${Math.round(f.cApt*100)}%`}
              </div>
              <div style={{fontSize:13, marginBottom:4}}><strong>Ejemplos de estudios/profesiones:</strong> {f.combo.profesiones.join(", ")}</div>
              <div style={{fontSize:13}}><strong>Para explorarlo:</strong> {f.combo.consejos.join(" ")}</div>
            </div>
          ))}
          <div style={{fontSize:11, color:"#8c9aa0", marginTop:8}}>
            Índice orientativo, no una predicción de éxito ni una recomendación cerrada. Compártelo y coméntalo con la persona interesada.
          </div>
        </div>
      )}
    </div>
  );
}
