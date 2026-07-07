import { createClient } from "@/utils/supabase/server";
import { SignoutButton } from "./components/SignoutButton";
 
export default async function Page() {
  const supabase = await createClient();
 
  const {
    data: { user },
  } = await supabase.auth.getUser();
 
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .order("created_at", { ascending: false });
 
  if (error) throw error;
  return <>
    {user ? <>
      <p>Connecté : {user.email}</p>
      <SignoutButton />
    </> : <p>Visiteur anonyme</p>}
      <pre>{JSON.stringify(posts, null, 2)}</pre>
    </>;
}