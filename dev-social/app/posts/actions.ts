"use server";
 
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
 
export async function createPost(formData: FormData) {
  const content = formData.get("content");
 
  if (typeof content !== "string" || content.trim() === "") {
    throw new Error("Le contenu du post est vide.");
  }
 
  const supabase = await createClient();
 
  // On récupère l'utilisateur connecté pour renseigner author_id.
  // (L'auth est détaillée au chapitre 6 ; ici on suppose une session.)
  const {
    data: { user },
  } = await supabase.auth.getUser();
 
  if (!user) throw new Error("Tu dois être connecté pour publier.");
 
  const { error } = await supabase
    .from("posts")
    .insert({ author_id: user.id, content: content.trim() });
 
  if (error) throw new Error(error.message);
 
  // Rafraîchit le Server Component de la page : la liste se met à jour.
  revalidatePath("/posts");
}
 
export async function deletePost(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Identifiant manquant.");
 
  const supabase = await createClient();
 
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
 
  revalidatePath("/posts");
}