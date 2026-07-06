import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yuvvdvquyvitvfipmllv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1dnZkdnF1eXZpdHZmaXBtbGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzkzMTksImV4cCI6MjA5NTU1NTMxOX0.DJ7VN-WeH3knSOCY1hgO89HsI9Tptopgj3K-YEAmCbs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Fetching current jar categories...");
  const { data: initial, error: fetchErr } = await supabase.from('jar_categories').select('*');
  console.log("Initial fetch:", initial, "Error:", fetchErr);

  console.log("\nAttempting to insert test category...");
  const { data: insertData, error: insertErr } = await supabase.from('jar_categories').insert({ name: 'Test Jar ' + Date.now() }).select();
  console.log("Insert result:", insertData, "Error:", insertErr);

  console.log("\nFetching again...");
  const { data: final, error: finalErr } = await supabase.from('jar_categories').select('*');
  console.log("Final fetch:", final);
}

test();
