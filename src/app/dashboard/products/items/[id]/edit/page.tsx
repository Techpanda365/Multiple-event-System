import { EditItemClient } from "./edit-item-client";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditItemClient productId={id} />;
}
