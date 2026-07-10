import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/userModel";
import NavBar from "@/components/Nav";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connectDb();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await User.findById(session.user.id).select("-password").lean();
  if (!user || (user as any).role !== "admin") redirect("/unauthorized");

  const plainUser = JSON.parse(JSON.stringify(user));

  return (
    <>
      <NavBar user={plainUser} />
      <div className="pt-[64px]">{children}</div>
    </>
  );
}
