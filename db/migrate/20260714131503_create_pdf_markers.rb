class CreatePdfMarkers < ActiveRecord::Migration[8.0]
  def change
    create_table :pdf_markers do |t|
      t.integer :page, null: false
      t.decimal :x, precision: 6, scale: 5, null: false
      t.decimal :y, precision: 6, scale: 5, null: false

      t.timestamps
    end
    add_index :pdf_markers, :page
  end
end
