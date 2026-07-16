class AddAutoLoginOnReturnToPurchases < ActiveRecord::Migration[8.0]
  def change
    add_column :purchases, :auto_login_on_return, :boolean, default: false, null: false
  end
end
