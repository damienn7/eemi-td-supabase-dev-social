import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { LikeForm } from "../../components/like-form";
import { Alert, Avatar, EmptyState, formatDateTime } from "../../components/ui";
import { CommentForm } from "./comment-form";

type AuthorProfile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

type CommentWithAuthor = {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  author: AuthorProfile | null;
};

type PostWithRelations = {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  author: AuthorProfile | null;
  likes: {
    post_id: string;
    user_id: string;
  }[];
  comments: CommentWithAuthor[];
};

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/login?redirectTo=${encodeURIComponent(`/post/${id}`)}`);
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      id,
      author_id,
      content,
      created_at,
      author:profiles!posts_author_id_fkey(
        id,
        username,
        avatar_url
      ),
      likes(
        post_id,
        user_id
      ),
      comments(
        id,
        post_id,
        content,
        created_at,
        author:profiles!comments_author_id_fkey(
          id,
          username,
          avatar_url
        )
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Erreur chargement post:", error);
    return (
      <main id="contenu-principal" className="page page--narrow">
        <header className="page-header">
          <Link className="button button--ghost button--compact" href="/">
            Retour au fil
          </Link>
          <div className="stack stack--tight">
            <p className="eyebrow">Discussion</p>
            <h1>Détail du post</h1>
          </div>
        </header>
        <Alert>Impossible de charger le post pour le moment.</Alert>
      </main>
    );
  }

  if (!post) {
    return (
      <main id="contenu-principal" className="page page--narrow">
        <header className="page-header">
          <Link className="button button--ghost button--compact" href="/">
            Retour au fil
          </Link>
          <div className="stack stack--tight">
            <p className="eyebrow">Discussion</p>
            <h1>Détail du post</h1>
          </div>
        </header>
        <EmptyState title="Post introuvable">
          Ce post a peut-être été supprimé ou n&apos;existe plus.
        </EmptyState>
      </main>
    );
  }

  const typedPost = post as unknown as PostWithRelations;
  const authorName = typedPost.author?.username ?? "Utilisateur inconnu";
  const avatarUrl = typedPost.author?.avatar_url;
  const likesCount = typedPost.likes.length;
  const likedByMe = typedPost.likes.some((like) => like.user_id === user.id);

  return (
    <main id="contenu-principal" className="page page--narrow">
      <div className="page-header">
        <Link className="button button--ghost button--compact" href="/">
          Retour au fil
        </Link>
        <div className="stack stack--tight">
          <p className="eyebrow">Discussion</p>
          <h1>Détail du post</h1>
        </div>
      </div>

      <article className="post-card" aria-labelledby="post-title">
        <div className="post-header">
          <Avatar src={avatarUrl} name={authorName} />
          <div>
            <h2 id="post-title">{authorName}</h2>
            <p className="meta">
              <time dateTime={typedPost.created_at}>{formatDateTime(typedPost.created_at)}</time>
            </p>
          </div>
        </div>

        <p className="post-content">{typedPost.content}</p>
        <div className="post-actions" aria-label="Actions du post">
          <LikeForm postId={typedPost.id} likedByMe={likedByMe} likesCount={likesCount} />
          <span className="badge">
            {typedPost.comments.length} commentaire{typedPost.comments.length > 1 ? "s" : ""}
          </span>
        </div>
      </article>

      <section className="stack" aria-labelledby="comments-title">
        <div className="split">
          <div className="stack stack--tight">
            <h2 id="comments-title">Commentaires</h2>
            <p className="muted">Les réponses de la communauté.</p>
          </div>
          <span className="badge">
            {typedPost.comments.length} commentaire{typedPost.comments.length > 1 ? "s" : ""}
          </span>
        </div>
        {typedPost.comments.length ? (
          <ul className="comment-list">
            {typedPost.comments.map((comment) => (
              <li key={comment.id}>
                <article className="comment-card">
                  <div className="comment-header">
                    <Avatar
                      src={comment.author?.avatar_url}
                      name={comment.author?.username ?? "Anonyme"}
                      size="sm"
                    />
                    <div>
                      <h3>{comment.author?.username ?? "Anonyme"}</h3>
                      <p className="meta">
                        <time dateTime={comment.created_at}>{formatDateTime(comment.created_at)}</time>
                      </p>
                    </div>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Aucun commentaire">
            Ajoute le premier commentaire pour ouvrir la discussion.
          </EmptyState>
        )}
      </section>

      <section className="section-card stack" aria-labelledby="comment-form-title">
        <h2 id="comment-form-title">Ajouter un commentaire</h2>
        <CommentForm postId={typedPost.id} />
      </section>
    </main>
  );
}
