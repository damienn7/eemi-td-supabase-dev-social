"use client";

import { useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert } from "../../components/ui";
import { createComment } from "./actions";

type FormState = {
  error?: string;
  success?: true;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" type="submit" disabled={pending}>
      {pending ? "Envoi en cours..." : "Publier le commentaire"}
    </button>
  );
}

export function CommentForm({ postId }: { postId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<FormState>({});
  const contentId = useId();
  const errorId = `${contentId}-error`;

  return (
    <form
      className="form"
      ref={formRef}
      action={async (formData) => {
        const result = await createComment(formData);
        setState(result);

        if (result.success) {
          formRef.current?.reset();
        }
      }}
    >
      <input type="hidden" name="postId" value={postId} />
      <div className="form-group">
        <label className="label" htmlFor={contentId}>
          Ton commentaire
        </label>
        <textarea
          id={contentId}
          className="textarea"
          name="content"
          rows={4}
          required
          aria-describedby={state.error ? errorId : undefined}
        />
      </div>
      {state.error ? (
        <Alert id={errorId} tone="error">
          {state.error}
        </Alert>
      ) : null}
      {state.success ? <Alert tone="success">Commentaire publié.</Alert> : null}
      <div className="form-actions">
        <SubmitButton />
      </div>
    </form>
  );
}
