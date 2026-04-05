import { redirect } from "next/navigation";

export default function ExecucaoPage({ params }: { params: { id: string } }) {
  redirect(`/casamento/${params.id}/planejar`);
}
