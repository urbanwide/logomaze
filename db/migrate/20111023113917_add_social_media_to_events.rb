class AddSocialMediaToEvents < ActiveRecord::Migration
  def change
    add_column :events, :flickr_group_id, :string
    add_column :events, :twitter_account, :string
  end
end
