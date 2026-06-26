import { createClient } from "@/utils/supabase/server";
 
export default async function FeedPage() {
  const supabase = await createClient();
 
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      content,
      created_at,
      author:profiles!posts_author_id_fkey(username, avatar_url),
      likes(count),
      comments(content, created_at, author:profiles(username))
      `
    )
    .order("created_at", { ascending: false });
 
  if (error) throw error;
 
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <p>
            <strong>{post.author?.username}</strong> : {post.content}
          </p>
          <small>
            {post.likes[0]?.count ?? 0} like(s) ·{" "}
            {post.comments.length} commentaire(s)
          </small>
          <ul>
            {post.comments.map((comment, index) => (
              <li key={index}>
                {comment.author?.username} : {comment.content}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}