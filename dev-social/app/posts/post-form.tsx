"use client";
 
import { useRef } from "react";
import { createPost } from "./actions";
 
export function PostForm() {
  const formRef = useRef<HTMLFormElement>(null);
 
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createPost(formData);
        formRef.current?.reset();
      }}
    >
      <textarea
        name="content"
        required
        placeholder="Contenu du post"
        rows={3}
      />
      <button type="submit">Publier</button>
    </form>
  );
}