import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Alert, EmptyState, formatDateTime } from "../components/ui";
import { PostForm } from "./post-form";
import { DeletePostForm } from "./delete-post-form";
 
export default async function PostsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?redirectTo=/posts");
  }
 
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, author_id, content, created_at")
    .order("created_at", { ascending: false })
    .limit(20);
 
  // On vérifie TOUJOURS error avant d'utiliser data.
  if (error) {
    return (
      <main id="contenu-principal" className="page">
        <header className="page-header">
          <p className="eyebrow">Posts</p>
          <h1>Fil DevSocial</h1>
          <p className="lead">Publie et gère tes derniers posts.</p>
        </header>
        <Alert>Impossible de charger les posts : {error.message}</Alert>
      </main>
    );
  }
 
  return (
    <main id="contenu-principal" className="page">
      <header className="page-header">
        <p className="eyebrow">Posts</p>
        <h1>Fil DevSocial</h1>
        <p className="lead">Publie et gère tes derniers posts.</p>
      </header>
 
      <section className="section-card stack" aria-labelledby="posts-create-title">
        <h2 id="posts-create-title">Nouveau post</h2>
        <PostForm />
      </section>
 
      <section className="stack" aria-labelledby="posts-list-title">
        <div className="split">
          <div className="stack stack--tight">
            <h2 id="posts-list-title">Derniers posts</h2>
            <p className="muted">Les 20 publications les plus récentes.</p>
          </div>
          <span className="badge">
            {posts.length} post{posts.length > 1 ? "s" : ""}
          </span>
        </div>

        {posts.length === 0 ? (
          <EmptyState title="Aucun post publié">
            Ton premier post apparaîtra ici après publication.
          </EmptyState>
        ) : (
          <ul className="post-list">
            {posts.map((post) => (
              <li key={post.id}>
                <article className="post-card">
                  <p className="post-content">{post.content}</p>
                  <p className="meta">
                    <time dateTime={post.created_at}>{formatDateTime(post.created_at)}</time>
                  </p>

                  {user?.id === post.author_id ? (
                    <div className="post-actions">
                      <DeletePostForm postId={post.id} />
                    </div>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
