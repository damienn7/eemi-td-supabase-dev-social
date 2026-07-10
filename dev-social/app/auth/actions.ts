"use server";
 
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

function getSafeRedirectPath(value: FormDataEntryValue | null) {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/";
}
 
export async function signup(formData: FormData) {
  const supabase = await createClient();
 
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
 
  const { error } = await supabase.auth.signUp({ email, password });
 
  if (error) {
    redirect("/register?error=" + encodeURIComponent(error.message));
  }
 
  revalidatePath("/", "layout");
  redirect("/login?message=Vérifie tes emails pour confirmer ton compte");
}

export async function login(formData: FormData) {
  const supabase = await createClient();
 
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));
 
  const { error } = await supabase.auth.signInWithPassword({ email, password });
 
  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }
 
  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
 
  revalidatePath("/", "layout");
  redirect("/login");
}
