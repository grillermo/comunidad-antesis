Rails.application.routes.draw do
  devise_for :users,
    skip: [ :registrations ],
    controllers: {
      sessions: "users/sessions",
      passwords: "users/passwords"
    }

  authenticate :user, ->(user) { user.admin? } do
    mount RailsAdmin::Engine => "/antesis-admin", as: "rails_admin"
  end

  authenticate :user, ->(user) { user.admin? } do
    get "/anotate", to: "anotate#show"
    get "/anotate/pages/:page", to: "anotate/pages#show", as: :anotate_page
    resources :pdf_markers, only: [ :create, :destroy ], path: "anotate/markers"
  end

  root "landing#index"

  get "generate-pdf", to: "generated_pdfs#show"
  get "/acceso/:token", to: "accesos#show", as: :acceso

  get "/manual-del-color-vivo", to: "manual#index", as: :manual
  Manual.walk do |_node, path|
    get "/manual-del-color-vivo/#{path.join('/')}",
        to: "manual#show",
        defaults: { component: path.join("/") }
  end

  resources :comments, only: [ :create, :update, :destroy ]
  post "comments/:comment_id/heart", to: "hearts#create", as: :comment_heart

  namespace :moderation do
    get "comments/approve/:token", to: "approvals#show", as: :comment_approval
  end

  resources :newsletter_emails, only: [ :create ]

  post "/webhooks/stripe", to: "webhooks/stripe#create"
  post "/checkout", to: "checkouts#create"
  get "/gracias-por-tu-compra", to: "gracias#show", as: :gracias_por_tu_compra

  get "/health", to: "health#show"

  # Reveal health status on /up for load balancers and uptime monitors.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*.
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
end
