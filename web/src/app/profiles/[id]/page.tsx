import ProfileDetailClient from "./ProfileDetailClient";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default async function ProfileDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  return <ProfileDetailClient id={params.id} />;
}
