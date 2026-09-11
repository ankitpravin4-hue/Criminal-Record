import { redirect } from "next/navigation";

export default function LiveGraphAliasPage({
  searchParams,
}: {
  searchParams: { case?: string };
}) {
  const query = searchParams.case ? `?case=${encodeURIComponent(searchParams.case)}` : "";
  redirect(`/dashboard${query}`);
}
