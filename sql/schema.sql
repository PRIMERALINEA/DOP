-- Esquema actualizado el 2026-09-17 para reflejar el estado real de la tabla
-- en producción (nombre, apellidos, curso y cuestionario se añadieron con
-- ALTER TABLE tras detectar que el insert de App.jsx fallaba por columnas
-- inexistentes; ver también el cambio de unique(codigo, clase) a
-- unique(codigo, clase, cuestionario) para permitir varios cuestionarios
-- por alumno/a).
create table respuestas_orientacion (
  id bigint generated always as identity primary key,
  codigo text not null,
  nombre text,
  apellidos text,
  clase text not null,
  curso text,
  cuestionario text,
  scores jsonb not null,
  libre text,
  created_at timestamptz default now(),
  unique (codigo, clase, cuestionario)
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
