class Attempt < ActiveRecord::Base
  
  include Retryable
  class TokenExists < StandardError; end
  
  set_primary_key 'token'
  
  attr_accessible :name, :program
  
  validates_presence_of :token, :event_id
  validates_uniqueness_of :token
  validates :name, :presence => true,
                   :length => {:minimum => 3, :maximum => 254} 
  validates :name, :length => {:maximum => 5000}
  before_validation :set_token, :on => :create

  belongs_to :event

  def completed=(value)
    if value
      self.completed_at = Time.now 
    else
      self.completed_at = nil
    end
  end

  protected
  def set_token
    retryable(:tries => 10, :on => TokenExists) do
      t = rand(36**5).to_s(36) 
      self.token = t if self.new_record? and self.token.blank? 
      raise Attempt::TokenExists if Attempt.find_by_token(t)
    end
  end 
end
