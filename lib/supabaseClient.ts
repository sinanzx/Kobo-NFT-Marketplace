import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://amwbrqoncbfpicyxvuar.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2JycW9uY2JmcGljeXh2dWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTU3MjAsImV4cCI6MjA3OTQzMTcyMH0.0u7yPK0LHm826ovuIG3egX341W63gzCPI2sRh-41W48';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
