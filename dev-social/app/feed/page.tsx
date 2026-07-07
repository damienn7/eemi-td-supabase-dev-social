import { createClient } from "@/utils/supabase/server";
import { FeedLive } from "../components/feed-live";
 
export default async function FeedPage() {
  const supabase = await createClient();
 
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .order("created_at", { ascending: false });
 
  if (error) throw error;
 
  return (
    <main>
      <h2>Fil d&apos;actualité</h2>
      <FeedLive initialPosts={posts ?? []} />
    </main>
  );
}