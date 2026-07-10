class LandingController < InertiaController
  def index
    render inertia: "Landing", props: {
      subscribed: flash[:subscribed] || false,
      alreadySubscribed: flash[:already_subscribed] || false,
      source: params[:source]
    }
  end
end
