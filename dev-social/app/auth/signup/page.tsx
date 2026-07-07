import { signup } from "../actions";
 
export default function SignupPage() {
  return (
    <form action={signup}>
      <h1>Inscription</h1>
 
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />
 
      <label htmlFor="password">Mot de passe</label>
      <input id="password" name="password" type="password" required />
 
      <button type="submit">S'inscrire</button>
    </form>
  );
}