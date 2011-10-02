class AttemptsController < ApplicationController
  
  before_filter :assert_event
  
  
  def new
    @attempt = Attempt.new
    render :template => 'attempts/new', :layout => 'attempt'
  end

  def create
   @attempt = @event.attempts.create(params[:attempt])
    respond_to do |format|
      if !@attempt.nil?
        format.html { redirect_to event_attempt_path(@event, @attempt) }
      else
        format.html { render :action => "new" }
      end
    end    
  end

  def show
    @attempt = @event.attempts.find(params[:id])
  end

  def program
    @attempt = @event.attempts.find(params[:attempt_id])
    render :text =>  @attempt.program
  end

  def edit
    @attempt = @event.attempts.find(params[:id])
    render :template => 'attempts/edit', :layout => 'attempt'    
  end

  def update
   @attempt = @event.attempts.find(params[:id])
    respond_to do |format|
      if @attempt.update_attributes(params[:attempt])
        format.html { redirect_to event_attempt_path(@event, @attempt) }
      else
        format.html { render :action => "edit" }
      end
    end      
  end

  protected
  def assert_event
    @event = Event.find(params[:event_id])
  end

end
