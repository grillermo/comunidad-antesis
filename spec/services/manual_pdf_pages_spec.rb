require "rails_helper"

RSpec.describe ManualPdfPages do
  around do |example|
    Dir.mktmpdir do |dir|
      @cache_dir = Pathname.new(dir)
      example.run
    end
  end

  it "exposes the manual's page count" do
    expect(described_class::PAGE_COUNT).to eq(136)
  end

  it "exposes the page aspect ratio (height / width)" do
    expect(described_class.aspect_ratio).to be_within(0.001).of(1.543)
  end

  it "renders a page to a cached PNG on first request" do
    path = described_class.new(1, cache_dir: @cache_dir).path

    expect(path).to eq(@cache_dir.join("page-001.png"))
    expect(path).to exist
    expect(path.binread[0, 8]).to eq("\x89PNG\r\n\x1A\n".b)
  end

  it "serves the cached file without re-rendering" do
    cached = @cache_dir.join("page-002.png")
    cached.binwrite("fake png")
    expect(Open3).not_to receive(:capture3)

    path = described_class.new(2, cache_dir: @cache_dir).path

    expect(path.binread).to eq("fake png")
  end

  it "raises Error when pdftoppm fails" do
    status = instance_double(Process::Status, success?: false, exitstatus: 1)
    allow(Open3).to receive(:capture3).and_return([ "", "boom", status ])

    expect {
      described_class.new(3, cache_dir: @cache_dir).path
    }.to raise_error(ManualPdfPages::Error, /boom/)
  end

  it "raises Error when pdftoppm cannot be launched" do
    allow(Open3).to receive(:capture3).and_raise(Errno::ENOENT, "pdftoppm")

    expect {
      described_class.new(3, cache_dir: @cache_dir).path
    }.to raise_error(ManualPdfPages::Error, /launched/)
  end

  it "reports cache filesystem errors accurately" do
    invalid_cache_dir = @cache_dir.join("not-a-directory")
    invalid_cache_dir.binwrite("occupied")

    expect {
      described_class.new(3, cache_dir: invalid_cache_dir).path
    }.to raise_error(ManualPdfPages::Error, /cache filesystem error/i)
  end
end
