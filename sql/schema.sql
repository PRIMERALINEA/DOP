-- Esquema actualizado el 2026-09-17.
-- Historial relevante:
-- 1) nombre, apellidos, curso y cuestionario se añadieron con ALTER TABLE
--    tras detectar que el insert de App.jsx fallaba por columnas inexistentes.
-- 2) El correo (codigo) pasó a ser opcional en el formulario, así que ya no
--    puede ser la clave de unicidad (dos alumnos sin correo en la misma
--    clase/cuestionario tendrían el mismo valor). La unicidad ahora es
--    nombre + apellidos + clase + curso + cuestionario. Si dos alumnos de la
--    misma clase tienen nombre y apellidos idénticos, el segundo envío
--    chocará: es una limitación conocida y aceptada al hacer el correo
--    opcional.
create table respuestas_orientacion (
  id bigint generated always as identity primary key,
  codigo text,
  nombre text not null,
  apellidos text not null,
  clase text not null,
  curso text not null,
  cuestionario text not null,
  scores jsonb not null,
  libre text,
  created_at timestamptz default now(),
  unique (nombre, apellidos, clase, curso, cuestionario)
);

alter table respuestas_orientacion enable row level security;

-- Permite que el alumnado inserte respuestas sin login (formulario público).
create policy "insertar_respuestas_publicas"
on respuestas_orientacion for insert
to anon
with check (true);

-- No se crea ninguna policy de SELECT para "anon":
-- por defecto con RLS activado, eso bloquea la lectura pública.
-- El panel de orientación lee los datos únicamente a través de
-- la función serverless /api/respuestas.js, que usa la service_role key
-- (con privilegios totales) y solo se ejecuta en el servidor de Vercel.
