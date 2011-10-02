class EventsController < ApplicationController
  def index
  end

  def new
    @event = Event.new
  end

  def show
    @event = Event.find(params[:id])
  end
  
  def congratulations
    @event = Event.find(params[:id])
  end

  def create
   @event =  Event.new(params[:event])
    respond_to do |format|
      if @event.save
        format.html { render :template => 'events/congratulations' }
      else
        format.html { render :action => "new" }
      end
    end
  end

  def edit
    @event = Event.find(params[:id])
  end

  def update
    @event = Event.find_by_token(params[:id], :conditions => { :key => params[:event].delete(:key) })
    respond_to do |format|
      if !@event.nil? && @event.update_attributes(params[:event])
        flash[:notice] = 'Your details were successfully updated.'
        format.html { redirect_to event_path(@event) }
      else
        flash[:error] = 'Please specify your key'
        @event = Event.find(params[:id])
        format.html { render :action => "edit" }
      end
    end    
  end

end
