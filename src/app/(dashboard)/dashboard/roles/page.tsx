import Link from "next/link";

export default function RolesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Roles & Permissions</h1>
      <p className="mt-4">Manage roles and permissions for your team.</p>
      <Link href="/dashboard" className="mt-6 inline-block text-primary hover:underline">
        ← Back to Dashboard
      </Link>
    </div>
  );
}