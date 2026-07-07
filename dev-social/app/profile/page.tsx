import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import AvatarUpload from "../components/AvatarUpload";
 
export default async function ProfilePage() {
  const supabase = await createClient();
 
  const {
    data: { user },
  } = await supabase.auth.getUser();
 
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user!.id)
    .single();
 
  return (
    <div>
      <h1>{profile?.username}</h1>
      {user && <AvatarUpload userId={user.id} />}
      {profile?.avatar_url && (
        <Image
          src={profile.avatar_url}
          alt={`Avatar de ${profile.username}`}
          width={96}
          height={96}
          style={{ borderRadius: "50%" }}
        />
      )}
    </div>
  );
}