import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PostForm } from "./posts/post-form";
import { LikeForm } from "./components/like-form";
import { Alert, Avatar, EmptyState, formatDateTime } from "./components/ui";
 
type PostWithRelations = {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
  likes: {
    post_id: string;
    user_id: string;
  }[];
  comments: {
    id: string;
    post_id: string;
  }[];
};
 
export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?redirectTo=/");
  }

  const loadFeedWithoutEmbeds = async (): Promise<{
    posts: PostWithRelations[];
    error: unknown;
  }> => {
    const { data: fallbackPosts, error: postsError } = await supabase
      .from("posts")
      .select("id, author_id, content, created_at")
      .order("created_at", { ascending: false });

    if (postsError) {
      console.error("Erreur chargement feed fallback posts:", postsError);
      return { posts: [], error: postsError };
    }

    const postRows = (fallbackPosts ?? []) as Pick<
      PostWithRelations,
      "id" | "author_id" | "content" | "created_at"
    >[];

    if (postRows.length === 0) {
      return { posts: [], error: null };
    }

    const authorIds = [...new Set(postRows.map((post) => post.author_id))];
    const postIds = postRows.map((post) => post.id);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", authorIds);

    if (profilesError) {
      console.error("Erreur chargement feed fallback profiles:", profilesError);
      return { posts: [], error: profilesError };
    }

    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("post_id, user_id")
      .in("post_id", postIds);

    if (likesError) {
      console.error("Erreur chargement feed fallback likes:", likesError);
      return { posts: [], error: likesError };
    }

    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("id, post_id")
      .in("post_id", postIds);

    if (commentsError) {
      console.error("Erreur chargement feed fallback comments:", commentsError);
      return { posts: [], error: commentsError };
    }

    const profilesById = new Map(
      ((profiles ?? []) as NonNullable<PostWithRelations["author"]>[]).map((profile) => [
        profile.id,
        profile,
      ])
    );

    const likesByPostId = new Map<string, PostWithRelations["likes"]>();
    for (const like of (likes ?? []) as PostWithRelations["likes"]) {
      const postLikes = likesByPostId.get(like.post_id) ?? [];
      postLikes.push(like);
      likesByPostId.set(like.post_id, postLikes);
    }

    const commentsByPostId = new Map<string, PostWithRelations["comments"]>();
    for (const comment of (comments ?? []) as PostWithRelations["comments"]) {
      const postComments = commentsByPostId.get(comment.post_id) ?? [];
      postComments.push(comment);
      commentsByPostId.set(comment.post_id, postComments);
    }

    return {
      posts: postRows.map((post) => ({
        ...post,
        author: profilesById.get(post.author_id) ?? null,
        likes: likesByPostId.get(post.id) ?? [],
        comments: commentsByPostId.get(post.id) ?? [],
      })),
      error: null,
    };
  };

  const { data: posts, error } = await supabase
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
        post_id
      )
    `)
    .order("created_at", { ascending: false });

  let typedPosts = (posts ?? []) as unknown as PostWithRelations[];

  if (error) {
    console.error("Erreur chargement feed avec jointures explicites:", error);
    const fallbackResult = await loadFeedWithoutEmbeds();

    if (fallbackResult.error) {
      return (
        <main id="contenu-principal" className="page">
          <header className="page-header">
            <p className="eyebrow">Mini réseau social</p>
            <h1>DevSocial</h1>
            <p className="lead">Publie, lis et échange avec la communauté.</p>
          </header>
          <Alert>Impossible de charger le fil d&apos;actualité pour le moment.</Alert>
        </main>
      );
    }

    typedPosts = fallbackResult.posts;
  }
 
  return (
    <main id="contenu-principal" className="page">
      <header className="page-header">
        <p className="eyebrow">Mini réseau social</p>
        <h1>DevSocial</h1>
        <p className="lead">
          Un fil clair pour publier, aimer et suivre les conversations de la communauté.
        </p>
      </header>
 
      <section className="section-card stack" aria-labelledby="create-post-title">
        <h2 id="create-post-title">Publier un post</h2>
        <PostForm />
      </section>
 
      <section className="stack" aria-labelledby="feed-title">
        <div className="split">
          <div className="stack stack--tight">
            <h2 id="feed-title">Fil d&apos;actualité</h2>
            <p className="muted">Les publications les plus récentes apparaissent en premier.</p>
          </div>
          <span className="badge">
            {typedPosts.length} post{typedPosts.length > 1 ? "s" : ""}
          </span>
        </div>
        {typedPosts.length === 0 ? (
          <EmptyState title="Aucun post pour l&apos;instant">
            Publie le premier message pour lancer la conversation.
          </EmptyState>
        ) : (
          <ul className="post-list">
            {typedPosts.map((post: PostWithRelations) => {
              const likesCount = post.likes.length;
              const commentsCount = post.comments.length;
              const likedByMe = post.likes.some((like) => like.user_id === user.id);
              const authorName = post.author?.username ?? "Utilisateur inconnu";
              const avatarUrl = post.author?.avatar_url;
 
              return (
                <li key={post.id}>
                  <article className="post-card" aria-labelledby={`post-${post.id}-author`}>
                    <div className="post-header">
                      <Avatar src={avatarUrl} name={authorName} />
                      <div>
                        <h3 id={`post-${post.id}-author`}>{authorName}</h3>
                        <p className="meta">
                          <time dateTime={post.created_at}>{formatDateTime(post.created_at)}</time>
                        </p>
                      </div>
                    </div>
 
                    <p className="post-content">{post.content}</p>
 
                    <div className="post-actions" aria-label="Actions du post">
                      <LikeForm postId={post.id} likedByMe={likedByMe} likesCount={likesCount} />
                      <span className="badge">
                        {commentsCount} commentaire{commentsCount > 1 ? "s" : ""}
                      </span>
                      <Link className="button button--secondary button--compact" href={`/post/${post.id}`}>
                        Voir le post
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
