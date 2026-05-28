import { requireAdminOrRedirect } from "@/lib/get-user";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminOrRedirect();

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <AdminSidebar />
      <div className="md:pl-60">
        <main className="container mx-auto px-4 py-6 md:px-8 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
