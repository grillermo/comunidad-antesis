class AddLastManualPathToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :last_manual_path, :string
  end
end
