import Link from "next/link";
import { signup } from "@/app/auth/actions";
import { Alert } from "../components/ui";

function getFriendlyAuthError(value: string | string[] | undefined) {
  const message = Array.isArray(value) ? value[0] : value;

  if (!message) return null;

  const normalized = message.toLowerCase();

  if (normalized.includes("email signups are disabled")) {
    return "L'inscription par email est désactivée dans Supabase.";
  }

  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "Un compte existe déjà avec cet email.";
  }

  return "Une erreur est survenue. Vérifie tes informations puis réessaie.";
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { error } = await searchParams;
  const errorMessage = getFriendlyAuthError(error);

  return (
    <main id="contenu-principal" className="page page--auth">
      <form className="form form-card" action={signup}>
        <div className="stack stack--tight">
          <p className="eyebrow">Nouveau compte</p>
          <h1>Inscription</h1>
          <p className="muted">Crée un compte pour publier et commenter.</p>
        </div>

        {errorMessage ? <Alert>{errorMessage}</Alert> : null}

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
            autoComplete="new-password"
            minLength={6}
            required
          />
          <p className="field-help">Utilise au moins 6 caractères.</p>
        </div>

        <button className="button" type="submit">
          S&apos;inscrire
        </button>

        <p className="auth-switch">
          Déjà un compte ? <Link href="/login">Se connecter</Link>
        </p>
      </form>
    </main>
  );
}
