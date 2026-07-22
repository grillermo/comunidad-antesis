class AddFingerprintCodeToUsers < ActiveRecord::Migration[8.0]
  def up
    add_column :users, :fingerprint_code, :bigint
    add_index :users, :fingerprint_code, unique: true

    User.reset_column_information
    User.find_each do |user|
      next if user.fingerprint_code.present?

      user.update_column(:fingerprint_code, User.generate_fingerprint_code)
    end

    change_column_null :users, :fingerprint_code, false
  end

  def down
    remove_column :users, :fingerprint_code
  end
end
