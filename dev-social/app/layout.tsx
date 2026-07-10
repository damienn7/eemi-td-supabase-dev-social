import { ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ActiveNavLink } from "./components/ActiveNavLink";
import { SignoutButton } from "./components/SignoutButton";
import "./globals.css";

export const metadata = {
  title: "DevSocial",
  description: "Mini réseau social pour publier, aimer et commenter des posts.",
};
 
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
 
  return (
    <html lang="fr">
      <body>
        <a className="skip-link" href="#contenu-principal">
          Aller au contenu principal
        </a>
        <header className="site-header">
          <div className="site-header__inner">
            <Link className="brand" href={user ? "/" : "/login"}>
              DevSocial
            </Link>
            <nav className="main-nav" aria-label="Navigation principale">
              {user ? (
                <>
                  <ActiveNavLink href="/">Accueil</ActiveNavLink>
                  <ActiveNavLink href="/feed">Fil</ActiveNavLink>
                  <ActiveNavLink href="/posts">Posts</ActiveNavLink>
                  <ActiveNavLink href="/profile">Profil</ActiveNavLink>
                  <SignoutButton />
                </>
              ) : (
                <>
                  <ActiveNavLink href="/login">Connexion</ActiveNavLink>
                  <ActiveNavLink href="/register">Inscription</ActiveNavLink>
                </>
              )}
            </nav>
          </div>
        </header>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
