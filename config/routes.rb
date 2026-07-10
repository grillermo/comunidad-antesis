Rails.application.routes.draw do
  devise_for :users
  root "landing#index"

  resources :newsletter_emails, only: [:create]

  get "/health", to: "health#show"

  # Reveal health status on /up for load balancers and uptime monitors.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*.
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
end
