Rails.application.routes.draw do
  devise_for :users,
    skip: [ :registrations ],
    controllers: { sessions: "users/sessions" }

  authenticate :user, ->(user) { user.admin? } do
    mount RailsAdmin::Engine => "/antesis-admin", as: "rails_admin"
  end

  root "landing#index"

  get "/manual-del-color-vivo", to: "manual#index", as: :manual
  Manual.walk do |_node, path|
    get "/manual-del-color-vivo/#{path.join('/')}",
        to: "manual#show",
        defaults: { component: path.join("/") }
  end

  resources :newsletter_emails, only: [:create]

  get "/health", to: "health#show"

  # Reveal health status on /up for load balancers and uptime monitors.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*.
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
end
