"use client";
 
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
 
export default function AvatarUpload({ userId }: { userId: string }) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
 
    setUploading(true);
    setError(null);
 
    // On range chaque avatar dans un dossier au nom de l'utilisateur.
    const path = `${userId}/avatar.png`;
 
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
 
    if (error) {
      setError(error.message);
    } else {
      console.log("Fichier uploadé :", data.path);
    }
 
    setUploading(false);
 
    // 1. Construire l'URL publique du fichier fraîchement uploadé.
    const {
        data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);
    
    // 2. Enregistrer cette URL dans le profil.
    const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", userId);
    
    if (updateError) setError(updateError.message);
  }
 
  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
      {uploading && <p>Envoi en cours…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}