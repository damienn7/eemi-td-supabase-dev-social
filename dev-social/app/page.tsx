import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { PostForm } from "./posts/post-form";
import { toggleLike } from "./actions/post";
 
type PostWithRelations = {
  id: string;
  content: string;
  created_at: string;
  author?: {
    username?: string | null;
    avatar_url?: string | null;
  }[];
  likes?: { user_id: string }[];
  comments?: { id: string }[];
};
 
export default async function HomePage() {
  const supabase = await createClient();
 
  const {
    data: { user },
  } = await supabase.auth.getUser();
 
  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      id,
      content,
      created_at,
      author:profiles(username, avatar_url),
      likes(user_id),
      comments(id)
    `)
    .order("created_at", { ascending: false });
 
  if (error) {
    return <p>Impossible de charger le fil d&apos;actualité : {error.message}</p>;
  }
 
  return (
    <main style={{ padding: 16 }}>
      <header style={{ marginBottom: 24 }}>
        <h1>DevSocial</h1>
        <p>Bienvenue sur le mini réseau social.</p>
      </header>
 
      {user ? (
        <section style={{ marginBottom: 24 }}>
          <h2>Publier un post</h2>
          <PostForm />
        </section>
      ) : (
        <section style={{ marginBottom: 24 }}>
          <p>
            <Link href="/auth/login">Connecte-toi</Link> pour publier, commenter et liker.
          </p>
        </section>
      )}
 
      <section>
        <h2>Fil d&apos;actualité</h2>
        {posts?.length === 0 ? (
          <p>Aucun post pour l&apos;instant.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, maxWidth: 780 }}>
            {posts.map((post: PostWithRelations) => {
              const likesCount = post.likes?.length ?? 0;
              const commentsCount = post.comments?.length ?? 0;
              const likedByMe = user
                ? post.likes?.some((like) => like.user_id === user.id)
                : false;
 
              return (
                <li
                  key={post.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 16,
                    padding: 18,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        overflow: "hidden",
                        background: "#f0f0f0",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {post.author?.[0]?.avatar_url ? (
                        <img
                          src={post.author[0].avatar_url!}
                          alt={`Avatar de ${post.author[0]?.username ?? "l'auteur"}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ color: "#666", fontSize: 12 }}>Aucune image</span>
                      )}
                    </div>
                          <div>
                      <strong>{post.author?.[0]?.username ?? "Auteur inconnu"}</strong>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {new Date(post.created_at).toLocaleString("fr-FR")}
                      </div>
                    </div>
                  </div>
 
                  <p style={{ whiteSpace: "pre-wrap", marginBottom: 16 }}>{post.content}</p>
 
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    {user ? (
                      <form action={toggleLike}>
                        <input type="hidden" name="postId" value={post.id} />
                        <button type="submit">
                          {likedByMe ? "Je n'aime plus" : "J'aime"} ({likesCount})
                        </button>
                      </form>
                    ) : (
                      <Link href="/auth/login">Connecte-toi pour liker</Link>
                    )}
                    <span>{commentsCount} commentaire{commentsCount > 1 ? "s" : ""}</span>
                    <Link href={`/post/${post.id}`}>Voir le post</Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
