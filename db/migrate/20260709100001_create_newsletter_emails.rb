class CreateNewsletterEmails < ActiveRecord::Migration[8.0]
  def change
    create_table :newsletter_emails do |t|
      t.string :email, null: false
      t.string :source

      t.timestamps
    end

    add_index :newsletter_emails, :email, unique: true
  end
end
