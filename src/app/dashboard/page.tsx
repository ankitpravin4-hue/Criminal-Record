import { DashboardView } from "@/components/DashboardView";

export default function DashboardPage({
  searchParams,
}: {
  searchParams: { case?: string };
}) {
  return <DashboardView initialCaseId={searchParams.case} />;
}
