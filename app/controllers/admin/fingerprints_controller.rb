module Admin
  class FingerprintsController < InertiaController
    def new
      render inertia: "Admin/Fingerprint"
    end

    def create
      result = FingerprintDecoder.new(params.require(:file)).call

      render inertia: "Admin/Fingerprint", props: {
        result: result && {
          email: result.user.email,
          confidence: result.confidence,
          purchaseId: result.purchase&.id
        }
      }
    rescue FingerprintDecoder::Error => e
      render inertia: "Admin/Fingerprint", props: { error: e.message }
    end
  end
end
