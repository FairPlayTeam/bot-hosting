"use client";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) return <p>Chargement...</p>;

  return (
    <div className="main">
      <p>test, id : {id}</p>
    </div>
  );
}
