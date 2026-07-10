import Link from "next/link";
import { login } from "@/app/auth/actions";
import { Alert } from "../components/ui";

function getSafeRedirectPath(value: string | string[] | undefined) {
  const redirectTo = Array.isArray(value) ? value[0] : value;

  if (redirectTo?.startsWith("/") && !redirectTo.startsWith("//")) {
    return redirectTo;
  }

  return "/";
}

function getFriendlyAuthError(value: string | string[] | undefined) {
  const message = Array.isArray(value) ? value[0] : value;

  if (!message) return null;

  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email ou mot de passe incorrect.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Confirme ton email avant de te connecter.";
  }

  if (normalized.includes("email logins are disabled")) {
    return "La connexion par email est désactivée dans Supabase.";
  }

  return "Une erreur est survenue. Vérifie tes informations puis réessaie.";
}

function getMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
    redirectTo?: string | string[];
  }>;
}) {
  const { error, message, redirectTo } = await searchParams;
  const safeRedirectTo = getSafeRedirectPath(redirectTo);
  const errorMessage = getFriendlyAuthError(error);
  const statusMessage = getMessage(message);

  return (
    <main id="contenu-principal" className="page page--auth">
      <form className="form form-card" action={login}>
        <div className="stack stack--tight">
          <p className="eyebrow">Bienvenue</p>
          <h1>Connexion</h1>
          <p className="muted">Connecte-toi pour accéder au fil DevSocial.</p>
        </div>
        <input type="hidden" name="redirectTo" value={safeRedirectTo} />

        {errorMessage ? <Alert>{errorMessage}</Alert> : null}
        {statusMessage ? <Alert tone="success">{statusMessage}</Alert> : null}

        <div className="form-group">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            className="input"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="password">
            Mot de passe
          </label>
          <input
            className="input"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        <button className="button" type="submit">
          Se connecter
        </button>

        <p className="auth-switch">
          Pas encore de compte ? <Link href="/register">Créer un compte</Link>
        </p>
      </form>
    </main>
  );
}
