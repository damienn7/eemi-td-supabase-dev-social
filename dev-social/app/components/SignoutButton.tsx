import { signout } from "@/app/auth/actions";
 
export function SignoutButton() {
  return (
    <form action={signout}>
      <button type="submit">Se déconnecter</button>
    </form>
  );
}