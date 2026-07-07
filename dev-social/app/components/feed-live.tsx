"use client";
 
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
 
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
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <p>{post.content}</p>
          <time>{new Date(post.created_at).toLocaleString("fr-FR")}</time>
        </li>
      ))}
    </ul>
  );
}