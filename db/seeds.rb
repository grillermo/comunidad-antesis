# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

if ENV["ADMIN_EMAIL"].present? && ENV["ADMIN_PASSWORD"].present?
  User.find_or_create_by!(email: ENV.fetch("ADMIN_EMAIL")) do |u|
    u.password = ENV.fetch("ADMIN_PASSWORD")
    u.role = :admin
  end
  puts "Seeded admin #{ENV.fetch('ADMIN_EMAIL')}"
else
  puts "Skipping admin seed (set ADMIN_EMAIL and ADMIN_PASSWORD to enable)"
end
