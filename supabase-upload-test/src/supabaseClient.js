import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gnhrkwwlwruxaaysxopk.supabase.co"; // URL de votre instance Supabase.
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduaHJrd3dsd3J1eGFheXN4b3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2NzY2MzMsImV4cCI6MjA0NzI1MjYzM30.-xyWEinFsMgGW7Y7UchJLrc96BXcORCeJFhCmKdGT1k"; // Clé publique (anonyme).

export const supabase = createClient(supabaseUrl, supabaseKey);
