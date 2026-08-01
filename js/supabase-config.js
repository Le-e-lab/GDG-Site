import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ihmsyiczhhxmupouipnu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlobXN5aWN6aGh4bXVwb3VpcG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTU2OTgsImV4cCI6MjEwMTE3MTY5OH0.iMHLil0BryMFGzYjt3rN3gzOTM7B8J8Whkt5240omxU';

export const supabase = createClient(supabaseUrl, supabaseKey);
