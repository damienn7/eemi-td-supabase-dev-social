"use client";

import { useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { toggleLike } from "../actions/post";
import { Alert } from "./ui";

type FormState = {
  error?: string;
  success?: true;
};

function LikeButton({
  likedByMe,
  likesCount,
}: {
  likedByMe: boolean;
  likesCount?: number;
}) {
  const { pending } = useFormStatus();
  const countLabel = typeof likesCount === "number" ? ` (${likesCount})` : "";

  return (
    <button className="button button--secondary button--compact" type="submit" disabled={pending}>
      {pending
        ? "Mise à jour..."
        : `${likedByMe ? "Retirer mon like" : "J'aime ce post"}${countLabel}`}
    </button>
  );
}

export function LikeForm({
  postId,
  likedByMe,
  likesCount,
}: {
  postId: string;
  likedByMe: boolean;
  likesCount?: number;
}) {
  const [state, setState] = useState<FormState>({});
  const errorId = useId();

  return (
    <form
      className="form"
      action={async (formData) => {
        const result = await toggleLike(formData);
        setState(result);
      }}
    >
      <input type="hidden" name="postId" value={postId} />
      <LikeButton likedByMe={likedByMe} likesCount={likesCount} />
      {state.error ? (
        <Alert id={errorId} tone="error">
          {state.error}
        </Alert>
      ) : null}
    </form>
  );
}
