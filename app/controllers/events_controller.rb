class EventsController < ApplicationController

  before_filter :assert_event, :only => [:show, :worksheet, :congratulations, :edit, :presentation, :counter]

  def new
    @event = Event.new
  end

  def dashboard
    @count = @event.attempts.find(:all, :conditions => ['completed_at IS NOT NULL']).count
    render :template => 'events/show', :layout => 'dashboard'
  end

  def congratulations
  end

  def presentation
    render :template => 'events/presentation', :layout => false
  end

  def counter
    render :text => @event.attempts.find(:all, :conditions => ['completed_at IS NOT NULL']).count
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
  end

  def update
    @event = Event.find_by_token(params[:id], :conditions => { :key => params[:event].delete(:key) })
    params[:event].delete(:email) if params[:event][:email].blank?
    respond_to do |format|
      if !@event.nil? && @event.update_attributes!(params[:event])
        flash[:notice] = 'Your details were successfully updated.'
        format.html { redirect_to event_path(@event) }
      else
        flash[:error] = 'Please specify your key'
        @event = Event.find(params[:id])
        format.html { render :action => "edit" }
      end
    end    
  end

  protected
  def assert_event
    @event = Event.find(params[:id])
  end

end
