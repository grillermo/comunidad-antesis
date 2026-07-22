import { useForm } from "@inertiajs/react"

export default function Fingerprint({ result, error }) {
  const { setData, post, processing } = useForm({ file: null })

  function handleSubmit(e) {
    e.preventDefault()
    post("/antesis-admin/fingerprint", { forceFormData: true })
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-xl font-semibold mb-4">Decode PDF fingerprint</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => setData("file", e.target.files[0])}
        />
        <button type="submit" disabled={processing} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded">
          Decode
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result === null && <p className="mt-4">No fingerprint detected.</p>}

      {result && (
        <dl className="mt-4">
          <dt className="font-medium">Email</dt>
          <dd>{result.email}</dd>
          <dt className="font-medium mt-2">Confidence</dt>
          <dd>{result.confidence.toFixed(2)}</dd>
          <dt className="font-medium mt-2">Purchase</dt>
          <dd>{result.purchaseId ?? "none"}</dd>
        </dl>
      )}
    </div>
  )
}
