RailsAdmin.config do |config|
  config.asset_source = :vite

  ### Popular gems integration
  config.authenticate_with do
    warden.authenticate! scope: :user
  end
  config.authorize_with do
    unless current_user&.admin?
      redirect_to main_app.root_path
    end
  end
  config.current_user_method(&:current_user)

  config.actions do
    dashboard
    index
    new
    export
    bulk_delete
    show
    edit
    delete
  end
end
