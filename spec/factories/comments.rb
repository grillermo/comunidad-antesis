FactoryBot.define do
  factory :comment do
    user
    section_path { "el-origen-del-color/introduccion" }
    body { "Un comentario" }
  end
end
