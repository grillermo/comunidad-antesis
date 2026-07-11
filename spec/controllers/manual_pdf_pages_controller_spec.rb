require "rails_helper"

RSpec.describe ManualPdfPagesController, type: :controller do
  subject(:controller_instance) { described_class.new }

  let(:success) { instance_double(Process::Status, success?: true) }

  describe "page parsing" do
    it "rejects values that are not strict integers" do
      expect { controller_instance.send(:parse_page, "5oops") }
        .to raise_error(ActionController::RoutingError, "page out of range")
    end

    it "rejects integers outside pages 1 through 136" do
      expect { controller_instance.send(:parse_page, "137") }
        .to raise_error(ActionController::RoutingError, "page out of range")
    end
  end

  describe "source PDF selection" do
    it "selects the only 136-page PDF instead of the lexically first PDF" do
      allow(Dir).to receive(:glob).and_return([ "/project/a.pdf", "/project/manual.pdf" ])
      allow(Open3).to receive(:capture3).with("pdfinfo", "/project/a.pdf")
        .and_return([ "Pages: 62\n", "", success ])
      allow(Open3).to receive(:capture3).with("pdfinfo", "/project/manual.pdf")
        .and_return([ "Pages: 136\n", "", success ])

      expect(controller_instance.send(:source_pdf)).to eq("/project/manual.pdf")
    end

    it "fails clearly when no PDF has 136 pages" do
      allow(Dir).to receive(:glob).and_return([ "/project/other.pdf" ])
      allow(Open3).to receive(:capture3).and_return([ "Pages: 62\n", "", success ])

      expect { controller_instance.send(:source_pdf) }
        .to raise_error(ActionController::RoutingError, /could not find the 136-page source PDF/)
    end

    it "fails clearly when multiple PDFs have 136 pages" do
      allow(Dir).to receive(:glob).and_return([ "/project/one.pdf", "/project/two.pdf" ])
      allow(Open3).to receive(:capture3).and_return([ "Pages: 136\n", "", success ])

      expect { controller_instance.send(:source_pdf) }
        .to raise_error(ActionController::RoutingError, /multiple 136-page source PDFs/)
    end

    it "turns a missing pdfinfo executable into a controlled routing error" do
      allow(Dir).to receive(:glob).and_return([ "/project/manual.pdf" ])
      allow(Open3).to receive(:capture3).and_raise(Errno::ENOENT, "pdfinfo")

      expect { controller_instance.send(:source_pdf) }
        .to raise_error(ActionController::RoutingError, "pdfinfo unavailable")
    end

    it "fails closed when pdfinfo exits unsuccessfully" do
      failure = instance_double(Process::Status, success?: false)
      allow(Dir).to receive(:glob).and_return([ "/project/manual.pdf" ])
      allow(Open3).to receive(:capture3).and_return([ "", "failure", failure ])

      expect { controller_instance.send(:source_pdf) }
        .to raise_error(ActionController::RoutingError, "pdfinfo failed")
    end

    it "fails closed when pdfinfo omits the page count" do
      allow(Dir).to receive(:glob).and_return([ "/project/manual.pdf" ])
      allow(Open3).to receive(:capture3).and_return([ "Title: Manual\n", "", success ])

      expect { controller_instance.send(:source_pdf) }
        .to raise_error(ActionController::RoutingError, "pdfinfo did not report a page count")
    end
  end

  describe "rasterization" do
    it "turns a missing pdftoppm executable into a controlled routing error" do
      allow(controller_instance).to receive(:source_pdf).and_return("/project/manual.pdf")
      allow(Open3).to receive(:capture2).and_raise(Errno::ENOENT, "pdftoppm")

      expect { controller_instance.send(:rasterize, 5, described_class::CACHE_DIR.join("5.png")) }
        .to raise_error(ActionController::RoutingError, "pdftoppm unavailable")
    end

    it "publishes a completed PNG atomically from a temporary output" do
      Dir.mktmpdir do |dir|
        png = Pathname(dir).join("5.png")
        allow(controller_instance).to receive(:source_pdf).and_return("/project/manual.pdf")
        allow(Open3).to receive(:capture2) do |*argv|
          prefix = argv.last
          File.binwrite("#{prefix}.png", "complete png")
          [ "", success ]
        end

        controller_instance.send(:rasterize, 5, png)

        expect(png.binread).to eq("complete png")
        expect(Dir.glob(Pathname(dir).join(".*.png"))).to be_empty
      end
    end

    it "fails closed when pdftoppm reports success without producing a PNG" do
      Dir.mktmpdir do |dir|
        png = Pathname(dir).join("5.png")
        allow(controller_instance).to receive(:source_pdf).and_return("/project/manual.pdf")
        allow(Open3).to receive(:capture2).and_return([ "", success ])

        expect { controller_instance.send(:rasterize, 5, png) }
          .to raise_error(ActionController::RoutingError, "pdftoppm produced no PNG")
      end
    end
  end
end
