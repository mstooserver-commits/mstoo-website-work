import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">This MSTOO page does not exist or the listing was removed.</p>
      <Link href="/" className="btn-primary mt-6 inline-flex">
        Back home
      </Link>
    </div>
  );
}
