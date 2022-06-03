# frozen_string_literal: true

require 'spec_helper'

RSpec.describe Types::WorkItems::Widgets::HierarchyType do
  it 'exposes the expected fields' do
    expected_fields = %i[parent children type]

    expect(described_class).to have_graphql_fields(*expected_fields)
  end
end
