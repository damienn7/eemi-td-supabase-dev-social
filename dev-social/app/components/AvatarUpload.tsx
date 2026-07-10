"use client";

import { ChangeEvent, useId, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Alert } from "./ui";

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
  const [fileName, setFileName] = useState<string | null>(null);
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Vous devez être connecté pour modifier votre avatar.");
      return;
    }

    if (user.id !== userId) {
      setError("Vous ne pouvez modifier que votre propre avatar.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Seules les images sont autorisées.");
      return;
    }

    setUploading(true);
    setError(null);

    const path = `${user.id}/avatar.png`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Erreur upload Storage:", uploadError);
      setError(`Erreur upload Storage : ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("Erreur update profile:", updateError);
      setError(`Erreur mise à jour profil : ${updateError.message}`);
      setUploading(false);
      return;
    }

    setAvatarUrl(publicUrl);
    setFileName(null);
    setUploading(false);
  }

  async function handleDelete() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Vous devez être connecté pour modifier votre avatar.");
      return;
    }

    if (user.id !== userId) {
      setError("Vous ne pouvez modifier que votre propre avatar.");
      return;
    }

    const path = `${user.id}/avatar.png`;
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
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setUploading(false);
      return;
    }

    setAvatarUrl(null);
    setFileName(null);
    setUploading(false);
  }

  return (
    <div className="form">
      <div className="form-group">
        <label className="label" htmlFor={inputId}>
          Changer l&apos;avatar
        </label>
        <input
          id={inputId}
          className="file-input"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        />
        <p id={helpId} className="field-help">
          Choisis une image depuis ton appareil. L&apos;envoi commence après la sélection.
        </p>
      </div>

      {fileName ? (
        <p className="field-help" aria-live="polite">
          Fichier sélectionné : {fileName}
        </p>
      ) : null}

      {uploading ? (
        <p className="badge" role="status" aria-live="polite">
          Traitement en cours...
        </p>
      ) : null}

      {error ? (
        <Alert id={errorId} tone="error">
          {error}
        </Alert>
      ) : null}

      {avatarUrl ? (
        <button
          className="button button--danger"
          type="button"
          onClick={handleDelete}
          disabled={uploading}
        >
          Supprimer l&apos;avatar
        </button>
      ) : null}
    </div>
  );
}
