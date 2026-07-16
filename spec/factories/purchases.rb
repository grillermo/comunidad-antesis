FactoryBot.define do
  factory :purchase do
    sequence(:stripe_session_id) { |n| "cs_test_#{n}" }
    sequence(:email) { |n| "buyer#{n}@example.com" }
    user
  end
end
