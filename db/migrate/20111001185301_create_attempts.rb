class CreateAttempts < ActiveRecord::Migration
  def change
    create_table :attempts, :id => false do |t|
      t.string :token, :primary => true, :limit => 5
      t.string :event_id
      t.string :name
      t.text :program
      t.datetime :completed_at, :default => nil

      t.timestamps
    end
  end
end
