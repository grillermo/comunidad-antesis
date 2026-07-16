require "rails_helper"

RSpec.describe "Accesos", type: :request do
  let(:user) { create(:user) }

  it "signs the user in with a valid token and redirects to the manual" do
    token = user.signed_id(purpose: :purchase_login, expires_in: 2.days)

    get "/acceso/#{token}"

    expect(response).to redirect_to("/manual-del-color-vivo")

    follow_redirect!
    expect(response).to have_http_status(:ok)
  end

  it "redirects to the reader's last manual section when present" do
    user.update_column(:last_manual_path, "color-cotidiano/velas")
    token = user.signed_id(purpose: :purchase_login, expires_in: 2.days)

    get "/acceso/#{token}"

    expect(response).to redirect_to("/manual-del-color-vivo/color-cotidiano/velas")
  end

  it "rejects an expired token with an alert" do
    token = user.signed_id(purpose: :purchase_login, expires_in: 2.days)

    travel_to 3.days.from_now do
      get "/acceso/#{token}"
    end

    expect(response).to redirect_to("/users/sign_in")
    expect(flash[:alert]).to eq("El enlace ha expirado. Recupera tu acceso con tu correo.")
  end

  it "rejects a token with the wrong purpose with the same alert" do
    token = user.signed_id(purpose: :other, expires_in: 2.days)

    get "/acceso/#{token}"

    expect(response).to redirect_to("/users/sign_in")
    expect(flash[:alert]).to eq("El enlace ha expirado. Recupera tu acceso con tu correo.")
  end

  it "rejects garbage tokens with the same alert" do
    get "/acceso/not-a-token"

    expect(response).to redirect_to("/users/sign_in")
    expect(flash[:alert]).to eq("El enlace ha expirado. Recupera tu acceso con tu correo.")
  end

  it "rejects tokens for missing users with the same alert" do
    token = user.signed_id(purpose: :purchase_login, expires_in: 2.days)
    user.destroy!

    get "/acceso/#{token}"

    expect(response).to redirect_to("/users/sign_in")
    expect(flash[:alert]).to eq("El enlace ha expirado. Recupera tu acceso con tu correo.")
  end
end
