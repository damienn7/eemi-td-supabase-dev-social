import { createClient } from "@/utils/supabase/server";
 
export default async function Page() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .order("created_at", { ascending: false });
 
  if (error) throw error;
  return <pre>{JSON.stringify(posts, null, 2)}</pre>;
}