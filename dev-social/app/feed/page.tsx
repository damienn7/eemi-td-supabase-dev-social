import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Alert } from "../components/ui";
import { FeedLive } from "../components/feed-live";
 
export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?redirectTo=/feed");
  }
 
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .order("created_at", { ascending: false });
 
  if (error) {
    return (
      <main id="contenu-principal" className="page page--narrow">
        <header className="page-header">
          <p className="eyebrow">Temps réel</p>
          <h1>Fil d&apos;actualité</h1>
          <p className="lead">Les nouveaux posts s&apos;affichent automatiquement.</p>
        </header>
        <Alert>Impossible de charger le fil d&apos;actualité pour le moment.</Alert>
      </main>
    );
  }
 
  return (
    <main id="contenu-principal" className="page page--narrow">
      <header className="page-header">
        <div className="split">
          <div className="stack stack--tight">
            <p className="eyebrow">Temps réel</p>
            <h1>Fil d&apos;actualité</h1>
            <p className="lead">Les nouveaux posts s&apos;affichent automatiquement.</p>
          </div>
          <span className="live-indicator" aria-label="Synchronisation active">
            En direct
          </span>
        </div>
      </header>
      <FeedLive initialPosts={posts ?? []} />
    </main>
  );
}
