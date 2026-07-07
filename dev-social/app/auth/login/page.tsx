import { login } from "../actions";
 
export default function LoginPage() {
  return (
    <form action={login}>
      <h1>Connexion</h1>
 
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />
 
      <label htmlFor="password">Mot de passe</label>
      <input id="password" name="password" type="password" required />
 
      <button type="submit">Se connecter</button>
    </form>
  );
}