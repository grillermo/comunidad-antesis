class CreatePurchases < ActiveRecord::Migration[8.0]
  def change
    create_table :purchases do |t|
      t.string :stripe_session_id, null: false
      t.string :email, null: false
      t.references :user, foreign_key: true
      t.datetime :fulfilled_at

      t.timestamps
    end
    add_index :purchases, :stripe_session_id, unique: true
  end
end
