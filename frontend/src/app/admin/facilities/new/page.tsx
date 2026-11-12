import FacilityForm from "@/components/FacilityForm";
import { requireUser } from "@/libs/auth";

export default async function NewFacilityPage() {
  await requireUser("admin");
  return <FacilityForm />;
}
