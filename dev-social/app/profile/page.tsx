import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AvatarUpload from "../components/AvatarUpload";
import { Alert, Avatar, formatDate } from "../components/ui";
 
export default async function ProfilePage() {
  const supabase = await createClient();
 
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
 
  if (userError || !user) {
    redirect("/login?redirectTo=/profile");
  }
 
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();
 
  if (profileError) {
    return (
      <main id="contenu-principal" className="page page--narrow">
        <header className="page-header">
          <p className="eyebrow">Profil</p>
          <h1>Mon profil</h1>
          <p className="lead">Gère tes informations visibles sur DevSocial.</p>
        </header>
        <Alert>Impossible de charger votre profil : {profileError.message}</Alert>
      </main>
    );
  }
 
  const { count: postsCount } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id);
 
  return (
    <main id="contenu-principal" className="page page--narrow">
      <header className="page-header">
        <p className="eyebrow">Profil</p>
        <h1>Mon profil</h1>
        <p className="lead">Gère tes informations visibles sur DevSocial.</p>
      </header>

      <section className="section-card profile-grid" aria-labelledby="profile-title">
        <div className="stack stack--tight">
          <Avatar src={profile?.avatar_url} name={profile?.username ?? "utilisateur"} size="lg" />
        </div>
        <div className="stack">
          <div className="stack stack--tight">
            <h2 id="profile-title">{profile?.username ?? "Utilisateur DevSocial"}</h2>
            <p className="muted">{user.email}</p>
          </div>

          <dl className="meta-list">
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Nom d&apos;utilisateur</dt>
              <dd>{profile?.username ?? "Non renseigné"}</dd>
            </div>
            <div>
              <dt>Membre depuis</dt>
              <dd>{formatDate(user.created_at)}</dd>
            </div>
            <div>
              <dt>Nombre de posts</dt>
              <dd>{postsCount ?? 0}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section-card stack" aria-labelledby="avatar-title">
        <div className="stack stack--tight">
          <h2 id="avatar-title">Avatar</h2>
          <p className="muted">
            Utilise une image nette et reconnaissable. Les formats image standards sont acceptés.
          </p>
        </div>
        <AvatarUpload userId={user.id} initialAvatarUrl={profile?.avatar_url ?? null} />
      </section>
    </main>
  );
}
