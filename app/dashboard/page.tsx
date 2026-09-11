import { DashboardView } from "@/components/DashboardView";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const params = await searchParams;
  return <DashboardView initialCaseId={params.case} />;
}
