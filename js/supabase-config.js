import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ezrkcbfnqvrdjhxzpopk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cmtjYmZucXZyZGpoeHpwb3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTkyMTgsImV4cCI6MjA4ODc5NTIxOH0.KZNRbZcxQ0Sgmw5c6RH6uKauBoHgO-4inqllbXGIGT4';

export const supabase = createClient(supabaseUrl, supabaseKey);
