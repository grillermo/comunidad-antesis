class CreateComments < ActiveRecord::Migration[8.0]
  def change
    create_table :comments do |t|
      t.string :section_path, null: false
      t.references :user, null: false, foreign_key: true
      t.text :body, null: false
      t.text :body_html
      t.string :ancestry, collation: "C"
      t.integer :hearts_count, null: false, default: 0
      t.boolean :sticky, null: false, default: false
      t.boolean :approved, null: false, default: false
      t.datetime :deleted_at
      t.timestamps
    end

    add_index :comments, [ :section_path, :ancestry ]
    add_index :comments, :ancestry
  end
end
