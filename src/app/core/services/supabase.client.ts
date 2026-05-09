import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  'https://omzunhtuogcaakfyxzxm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tenVuaHR1b2djYWFrZnl4enhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMTUwMjQsImV4cCI6MjA5Mzg5MTAyNH0.0JKRfV4T31PJxKiq8z2k2RoBJpu4jgYLmH18efQbGcc',
);
