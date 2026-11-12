import { notFound } from "next/navigation";
import FacilityForm from "@/components/FacilityForm";
import { api } from "@/libs/api";
import { requireUser } from "@/libs/auth";
import type { Facility } from "@/types";

export default async function EditFacilityPage({ params }: PageProps<"/admin/facilities/[id]/edit">) {
  await requireUser("admin");
  const { id } = await params;
  const result = await api<Facility>(`/facilities/${id}`);
  if (!result.ok) {
    if (result.status === 0) throw new Error(result.error);
    notFound();
  }
  return <FacilityForm facility={result.data} />;
}
