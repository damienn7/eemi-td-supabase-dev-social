"use client";

import { ChangeEvent, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AvatarUpload({
  userId,
  initialAvatarUrl,
}: {
  userId: string;
  initialAvatarUrl: string | null;
}) {
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Seules les images sont autorisées.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("La taille maximale est de 2 Mo.");
      return;
    }

    setUploading(true);
    setError(null);

    const path = `${userId}/avatar.png`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = data?.publicUrl ?? null;

    if (!publicUrl) {
      setError("Impossible de générer l'URL de l'avatar.");
      setUploading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setUploading(false);
      return;
    }

    setAvatarUrl(publicUrl);
    setUploading(false);
  }

  async function handleDelete() {
    const path = `${userId}/avatar.png`;
    setUploading(true);
    setError(null);

    const { error: deleteError } = await supabase.storage.from("avatars").remove([path]);
    if (deleteError) {
      setError(deleteError.message);
      setUploading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setUploading(false);
      return;
    }

    setAvatarUrl(null);
    setUploading(false);
  }

  return (
    <div>
      <label style={{ display: "block", marginBottom: 12 }}>
        <span>Changer l&apos;avatar</span>
        <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
      </label>
      {uploading && <p>Traitement en cours…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {avatarUrl && (
        <button type="button" onClick={handleDelete} disabled={uploading} style={{ marginTop: 12 }}>
          Supprimer l&apos;avatar
        </button>
      )}
    </div>
  );
}
