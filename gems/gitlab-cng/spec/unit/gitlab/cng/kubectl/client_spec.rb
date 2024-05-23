# frozen_string_literal: true

RSpec.describe Gitlab::Cng::Kubectl::Client do
  subject(:client) { described_class.new("gitlab") }

  let(:command_status) { instance_double(Process::Status, success?: true) }
  let(:resource) { Gitlab::Cng::Kubectl::Resources::Configmap.new("config", "some", "value") }

  before do
    allow(Open3).to receive(:popen2e).and_return(["cmd-output", command_status])
  end

  it "creates namespace" do
    expect(client.create_namespace).to eq("cmd-output")
    expect(Open3).to have_received(:popen2e).with({}, *%w[kubectl create namespace gitlab])
  end

  it "creates custom resource" do
    expect(client.create_resource(resource)).to eq("cmd-output")
    expect(Open3).to have_received(:popen2e).with({}, *%w[kubectl apply -n gitlab -f -])
  end
end
