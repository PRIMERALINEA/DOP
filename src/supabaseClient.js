import { createClient } from '@supabase/supabase-js';

// Estas dos claves son publicas por diseño (solo permiten INSERT, no lectura).
// Se definen en Vercel como variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
