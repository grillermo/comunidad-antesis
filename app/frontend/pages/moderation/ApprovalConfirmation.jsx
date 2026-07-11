export default function ApprovalConfirmation({ section }) {
  return (
    <main className="mx-auto max-w-lg p-8 text-center">
      <h1 className="text-2xl font-bold">Comentario aprobado</h1>
      <p className="mt-4">
        El comentario en <code>{section}</code> quedó aprobado.
      </p>
    </main>
  );
}
