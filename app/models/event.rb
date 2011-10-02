class Event < ActiveRecord::Base
  set_primary_key 'token'

  attr_accessible :name, :email, :instructions

  before_validation :set_token, :set_key, :on => :create

  has_many :attempts

  validates_presence_of :token, :key
  validates_uniqueness_of :token, :key
  validates :email, :presence => true, 
                    :length => {:minimum => 3, :maximum => 254},
                    :format => {:with => /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i}
  validates :name, :presence => true,
                   :length => {:minimum => 3, :maximum => 254} 
  validates :instructions, :length => { :maximum => 2000 }

  protected
  def set_token
    # TODO: ensure unique
    self.token = rand(36**5).to_s(36) if self.new_record? and self.token.blank?
  end
  def set_key
    # TODO: Ensure unique
    self.key = rand(36**5).to_s(36) if self.new_record? and self.key.blank?
  end
  
end
