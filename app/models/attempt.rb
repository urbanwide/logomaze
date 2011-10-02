class Attempt < ActiveRecord::Base
  set_primary_key 'token'
  
  attr_accessible :name, :program
  
  validates_presence_of :token, :event_id
  validates_uniqueness_of :token
  validates :name, :presence => true,
                   :length => {:minimum => 3, :maximum => 254} 
  validates :name, :length => {:maximum => 5000}
  before_validation :set_token, :on => :create

  belongs_to :event

  protected
  def set_token
    # TODO: Ensure unique
    self.token = rand(36**5).to_s(36) if self.new_record? and self.token.blank?
  end 
end