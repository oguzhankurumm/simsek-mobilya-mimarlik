import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-user";
import { ProfileForm } from "@/components/commerce/profile-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  return (
    <div className="text-sm">
      <h2 className="mb-4 text-base font-semibold">Profilim</h2>
      <ProfileForm
        initial={{
          name: user.name,
          email: user.email,
          phone: user.phone,
        }}
      />
    </div>
  );
}
