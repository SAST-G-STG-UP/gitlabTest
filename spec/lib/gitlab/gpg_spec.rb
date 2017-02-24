require 'rails_helper'

describe Gitlab::Gpg do
  describe '.fingerprints_from_key' do
    it 'returns the fingerprint' do
      expect(
        described_class.fingerprints_from_key(GpgHelpers::User1.public_key)
      ).to eq [GpgHelpers::User1.fingerprint]
    end

    it 'returns an empty array when the key is invalid' do
      expect(
        described_class.fingerprints_from_key('bogus')
      ).to eq []
    end
  end

  describe '.emails_from_key' do
    it 'returns the emails' do
      expect(
        described_class.emails_from_key(GpgHelpers::User1.public_key)
      ).to eq GpgHelpers::User1.emails
    end

    it 'returns an empty array when the key is invalid' do
      expect(
        described_class.emails_from_key('bogus')
      ).to eq []
    end
  end
end

describe Gitlab::Gpg::CurrentKeyChain, :gpg do
  describe '.emails' do
    it 'returns the emails' do
      Gitlab::Gpg::CurrentKeyChain.add(GpgHelpers::User2.public_key)

      expect(
        described_class.emails(GpgHelpers::User2.fingerprint)
      ).to match_array GpgHelpers::User2.emails
    end
  end

  describe '.add', :gpg do
    it 'stores the key in the keychain' do
      expect(GPGME::Key.find(:public, GpgHelpers::User1.fingerprint)).to eq []

      Gitlab::Gpg::CurrentKeyChain.add(GpgHelpers::User1.public_key)

      expect(GPGME::Key.find(:public, GpgHelpers::User1.fingerprint)).not_to eq []
    end
  end

  describe '.remove', :gpg do
    it 'removes the key from the keychain' do
      Gitlab::Gpg::CurrentKeyChain.add(GpgHelpers::User1.public_key)
      expect(GPGME::Key.find(:public, GpgHelpers::User1.fingerprint)).not_to eq []

      Gitlab::Gpg::CurrentKeyChain.remove(GpgHelpers::User1.fingerprint)

      expect(GPGME::Key.find(:public, GpgHelpers::User1.fingerprint)).to eq []
    end
  end
end
