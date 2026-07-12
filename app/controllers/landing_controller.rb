class LandingController < InertiaController
  def index
    render inertia: "Landing", props: {
      subscribed: flash[:subscribed] || false,
      alreadySubscribed: flash[:already_subscribed] || false,
      source: params[:source],
      manualPath: Manual.url_for(Current.user&.last_manual_path) || manual_path
    }
  end
end
