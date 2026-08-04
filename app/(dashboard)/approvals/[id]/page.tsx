import { ApprovalDetailClientPage } from "@/components/approvals/detail-client-page";

export const dynamic = "force-dynamic";

type ApprovalDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApprovalDetailPage({ params }: ApprovalDetailPageProps) {
  const { id } = await params;
  return <ApprovalDetailClientPage id={id} />;
}
