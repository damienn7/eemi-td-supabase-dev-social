"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

type PostActionResult = {
  error?: string;
  success?: true;
};

export async function toggleLike(formData: FormData): Promise<PostActionResult> {
  const postId = formData.get("postId");
  if (typeof postId !== "string") {
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
      error: "Vous devez être connecté pour effectuer cette action.",
    };
  }

  const { data: existingLike, error: selectError } = await supabase
    .from("likes")
    .select("user_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (selectError) {
    console.error("Erreur lecture like:", selectError);
    return {
      error: "Impossible de vérifier ce like.",
    };
  }

  if (existingLike) {
    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Erreur suppression like:", deleteError);
      return {
        error: "Impossible de retirer ce like.",
      };
    }
  } else {
    const { error: insertError } = await supabase
      .from("likes")
      .insert({ post_id: postId, user_id: user.id });

    if (insertError) {
      console.error("Erreur création like:", insertError);
      return {
        error: "Impossible d'ajouter ce like.",
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath(`/post/${postId}`);

  return {
    success: true,
  };
}
