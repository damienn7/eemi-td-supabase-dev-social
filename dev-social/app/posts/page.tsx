import { createClient } from "@/utils/supabase/server";
import { PostForm } from "./post-form";
import { deletePost } from "./actions";
 
export default async function PostsPage() {
  const supabase = await createClient();
 
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .order("created_at", { ascending: false })
    .limit(20);
 
  // On vérifie TOUJOURS error avant d'utiliser data.
  if (error) {
    return <p>Impossible de charger les posts : {error.message}</p>;
  }
 
  return (
    <main>
      <h1>Fil DevSocial</h1>
 
      <PostForm />
 
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <p>{post.content}</p>
            <time>{new Date(post.created_at).toLocaleString("fr-FR")}</time>
 
            <form action={deletePost}>
              <input type="hidden" name="id" value={post.id} />
              <button type="submit">Supprimer</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}