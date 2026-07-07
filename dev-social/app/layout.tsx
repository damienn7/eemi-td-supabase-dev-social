import { ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { SignoutButton } from "./components/SignoutButton";
 
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
        <header style={{ padding: 16, borderBottom: "1px solid #ddd", marginBottom: 24 }}>
          <nav style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/">Accueil</Link>
            <Link href="/feed">Fil</Link>
            <Link href="/posts">Posts</Link>
            <Link href="/profile">Profil</Link>
            {user ? (
              <SignoutButton />
            ) : (
              <>
                <Link href="/auth/login">Connexion</Link>
                <Link href="/auth/signup">Inscription</Link>
              </>
            )}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}