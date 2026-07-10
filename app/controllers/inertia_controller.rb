# frozen_string_literal: true

class InertiaController < ApplicationController
  inertia_share user: -> { Current.user&.as_json(only: [ :id, :email, :role ]) }
end
