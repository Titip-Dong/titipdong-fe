import { useGetCurrentUser } from "@/api/generated/endpoints/auth/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

const roleLabel = { buyer: "Pembeli", jastiper: "Jastiper", admin: "Admin" } as const;

export function Component() {
  const { data: user, isPending } = useGetCurrentUser();

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 px-4 py-10">
      <h1 className="text-4xl font-bold">Profil</h1>
      {isPending || !user ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : (
        <dl className="divide-y rounded-2xl border bg-card">
          {[
            ["Nama", user.name],
            ["Email", user.email],
            ["Peran", roleLabel[user.role]],
            ["Bergabung", formatDate(user.createdAt)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 p-4">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
