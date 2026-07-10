"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

type CommentActionResult = {
  error?: string;
  success?: true;
};

export async function createComment(formData: FormData): Promise<CommentActionResult> {
  const postId = formData.get("postId");
  const content = formData.get("content");

  if (typeof postId !== "string" || postId.trim() === "") {
    return {
      error: "Identifiant de post invalide.",
    };
  }

  if (typeof content !== "string" || content.trim() === "") {
    return {
      error: "Le commentaire ne peut pas être vide.",
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

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    content: content.trim(),
  });

  if (error) {
    console.error("Erreur création commentaire:", error);
    return {
      error: "Impossible de publier le commentaire.",
    };
  }

  revalidatePath(`/post/${postId}`);
  revalidatePath("/");
  revalidatePath("/feed");

  return {
    success: true,
  };
}
