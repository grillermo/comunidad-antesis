RailsAdmin.config do |config|
  config.asset_source = :vite

  config.excluded_models = %w[
    SolidQueue::Job
    SolidQueue::ScheduledExecution
    SolidQueue::ReadyExecution
    SolidQueue::ClaimedExecution
    SolidQueue::BlockedExecution
    SolidQueue::FailedExecution
    SolidQueue::RecurringExecution
    SolidQueue::RecurringTask
    SolidQueue::Pause
    SolidQueue::Process
    SolidQueue::Semaphore
  ]

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

  config.model "Comment" do
    list do
      field :id
      field :section_path
      field :user
      field :body
      field :hearts_count
      field :sticky
      field :approved
      field :deleted_at
      field :created_at
    end

    edit do
      field :body
      field :sticky
      field :approved
      field :deleted_at
    end
  end

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
