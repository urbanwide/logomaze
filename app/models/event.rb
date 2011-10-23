class Event < ActiveRecord::Base
  
  include Retryable
  class TokenExists < StandardError; end
  class KeyExists < StandardError; end
  
  set_primary_key 'token'

  attr_accessible :name, :email, :instructions, :flickr_group_id, :twitter_account

  before_validation :set_token, :set_key, :on => :create

  has_many :attempts

  validates_presence_of :token, :key
  validates_uniqueness_of :token, :key
  validates :email, :presence => true, 
                    :length => {:minimum => 3, :maximum => 254},
                    :format => {:with => /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i}
  validates :name, :presence => true,
                   :length => {:minimum => 3, :maximum => 254} 
  validates :twitter_account, :length => {:minimum => 0, :maximum => 254}
  validates :flickr_group_id, :length => {:minimum => 0, :maximum => 254}
  validates :instructions, :length => { :maximum => 2000 }

  protected
  def set_token
    retryable(:tries => 10, :on => TokenExists) do
      t = rand(36**5).to_s(36) 
      self.token = t if self.new_record? and self.token.blank? 
      raise Event::TokenExists if Event.find_by_token(t)
    end
  end
  def set_key
    retryable(:tries => 10, :on => KeyExists) do
      k = rand(36**5).to_s(36) 
      self.key = k if self.new_record? and self.key.blank? 
      raise Event::KeyExists if Event.find_by_key(k)
    end
  end
  
end
