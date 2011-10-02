class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events, :id => false do |t|
      t.string :token, :primary => true, :limit => 5
      t.string :key, :limit => 5, :unique => true
      t.string :name
      t.string :email
      t.text :instructions
      t.boolean :active, :default => true

      t.timestamps
    end
  end
end
