import { redirect } from "next/navigation";

export default async function LiveGraphAliasPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const params = await searchParams;
  const query = params.case ? `?case=${encodeURIComponent(params.case)}` : "";
  redirect(`/dashboard${query}`);
}
