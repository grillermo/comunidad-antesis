class WelcomeController < InertiaController
  def index
    render inertia: "Welcome", props: {
      message: "comunidad-antesis Inertia"
    }
  end
end
