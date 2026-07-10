"use server";
 
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

type PostActionResult = {
  error?: string;
  success?: true;
};
 
export async function createPost(formData: FormData): Promise<PostActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: "Vous devez être connecté pour publier un post.",
    };
  }

  const content = String(formData.get("content") ?? "").trim();
 
  if (!content) {
    return {
      error: "Le contenu du post ne peut pas être vide.",
    };
  }
 
  const { error } = await supabase
    .from("posts")
    .insert({ author_id: user.id, content });
 
  if (error) {
    console.error("Erreur création post:", error);
    return {
      error: "Impossible de publier le post.",
    };
  }
 
  revalidatePath("/");
  revalidatePath("/posts");

  return {
    success: true,
  };
}
 
export async function deletePost(formData: FormData): Promise<PostActionResult> {
  const id = formData.get("id");
  if (typeof id !== "string" || id.trim() === "") {
    return {
      error: "Identifiant de post invalide.",
    };
  }
 
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: "Vous devez être connecté pour supprimer un post.",
    };
  }
 
  const { data: deletedPost, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Erreur suppression post:", error);
    return {
      error: "Impossible de supprimer ce post.",
    };
  }

  if (!deletedPost) {
    return {
      error: "Vous ne pouvez supprimer que vos propres posts.",
    };
  }
 
  revalidatePath("/");
  revalidatePath("/posts");

  return {
    success: true,
  };
}
