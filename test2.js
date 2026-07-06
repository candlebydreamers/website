import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yuvvdvquyvitvfipmllv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1dnZkdnF1eXZpdHZmaXBtbGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzkzMTksImV4cCI6MjA5NTU1NTMxOX0.DJ7VN-WeH3knSOCY1hgO89HsI9Tptopgj3K-YEAmCbs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Checking if insert works...");
  const { error } = await supabase.from('jar_categories').insert({ name: 'Test' });
  console.log("Error:", error);
}

test();
