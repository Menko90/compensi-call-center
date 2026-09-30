import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://greretgslhovwbptsoyl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_nUHJiKWq82SFrUTmrKfuww__ISLwVGc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
