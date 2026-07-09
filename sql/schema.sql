create table respuestas_orientacion (
  id bigint generated always as identity primary key,
  codigo text not null,
  clase text not null,
  scores jsonb not null,
  libre text,
  created_at timestamptz default now(),
  unique (codigo, clase)
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
