import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY);

async function check() {
  const { data, error } = await supabase.from('diagnostic_results').select('*').limit(5);
  console.log("Diag Sample:", data);
  console.log("Diag Error:", error);

  const { count } = await supabase.from('diagnostic_results').select('*', { count: 'exact', head: true });
  console.log("Total diagnostic results:", count);
  
  const { count: countNoScore } = await supabase.from('diagnostic_results').select('*', { count: 'exact', head: true }).is('overall_score', null);
  console.log("Total without overall_score:", countNoScore);
}
check();
