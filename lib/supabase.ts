import { createClient } from '@supabase/supabase-js';

// .env.local se hamari keys nikal kar connection bana rahe hain
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);