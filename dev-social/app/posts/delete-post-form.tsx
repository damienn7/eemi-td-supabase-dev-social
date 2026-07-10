"use client";

import { useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert } from "../components/ui";
import { deletePost } from "./actions";

type FormState = {
  error?: string;
  success?: true;
};

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button button--danger button--compact" type="submit" disabled={pending}>
      {pending ? "Suppression..." : "Supprimer le post"}
    </button>
  );
}

export function DeletePostForm({ postId }: { postId: string }) {
  const [state, setState] = useState<FormState>({});
  const errorId = useId();

  return (
    <form
      className="form"
      action={async (formData) => {
        const result = await deletePost(formData);
        setState(result);
      }}
    >
      <input type="hidden" name="id" value={postId} />
      <DeleteButton />
      {state.error ? (
        <Alert id={errorId} tone="error">
          {state.error}
        </Alert>
      ) : null}
    </form>
  );
}
