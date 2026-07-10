import { signout } from "@/app/auth/actions";
 
export function SignoutButton() {
  return (
    <form className="nav-form" action={signout}>
      <button className="button button--ghost button--compact" type="submit">
        Se déconnecter
      </button>
    </form>
  );
}
