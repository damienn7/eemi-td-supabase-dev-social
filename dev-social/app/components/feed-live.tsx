"use client";
 
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { EmptyState, formatDateTime } from "./ui";
 
type Post = {
  id: string;
  content: string;
  created_at: string;
};
 
export function FeedLive({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
 
  useEffect(() => {
    const supabase = createClient();
 
    const channel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          const nouveau = payload.new as Post;
          // On ajoute le nouveau post EN HAUT du fil.
          setPosts((actuels) => [nouveau, ...actuels]);
        }
      )
      .subscribe();
 
    // IMPORTANT : nettoyer l'abonnement quand le composant est démonté.
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
 
  return (
    <ul className="post-list" aria-live="polite">
      {posts.length === 0 ? (
        <li>
          <EmptyState title="Aucun post en direct">
            Les prochaines publications apparaîtront ici automatiquement.
          </EmptyState>
        </li>
      ) : null}
      {posts.map((post) => (
        <li key={post.id}>
          <article className="post-card">
            <p className="post-content">{post.content}</p>
            <p className="meta">
              <time dateTime={post.created_at}>{formatDateTime(post.created_at)}</time>
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}
