import { createClient } from '@supabase/supabase-js';

// Esta función corre en el servidor de Vercel, nunca en el navegador.
// SUPABASE_SERVICE_ROLE_KEY y PANEL_SECRET solo existen como variables de entorno
// del proyecto en Vercel (no van en el código ni en el repositorio).
export default async function handler(req, res) {
  const secret = req.query.secret;

  if (!secret || secret !== process.env.PANEL_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('respuestas_orientacion')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ records: data });
}
