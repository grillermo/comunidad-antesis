export default function ApprovalError({ message }) {
  return (
    <main className="mx-auto max-w-lg p-8 text-center">
      <h1 className="text-2xl font-bold">{message}</h1>
      <p className="mt-4">El enlace expiró o no es válido.</p>
    </main>
  );
}
