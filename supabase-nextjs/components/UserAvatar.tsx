import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/server";

const UserAvatar = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex items-center space-x-3">
      <h1 className="text-sm">{user?.email}</h1>
      <Avatar>
        {user && (
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        )}

        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default UserAvatar;
