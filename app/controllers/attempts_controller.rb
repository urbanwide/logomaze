class AttemptsController < ApplicationController
  
  before_filter :assert_event
  
  def new
    @attempt = Attempt.new
    render :template => 'attempts/new', :layout => 'attempt'
  end

  def create
   @attempt = @event.attempts.build(params[:attempt])
    respond_to do |format|
      if @attempt.save
        format.html { redirect_to event_attempt_path(@event, @attempt) }
      else
        format.html { render :template => "attempts/new", :layout => 'attempt' }
      end
    end
  end

  def show
    @attempt = @event.attempts.find(params[:id])
  end

  def search
    @attempt = Attempt.new
  end

  def retrieve
    @attempt = @event.attempts.find_by_token(params[:attempt][:id])
    if @attempt
      redirect_to event_attempt_path(@event, @attempt)
    else
      flash[:error] = "Unable to find your attempt"
      redirect_to event_path(@event)
    end
  end

  def program
    @attempt = @event.attempts.find(params[:id])
    render :text =>  @attempt.program
  end

  def edit
    @attempt = @event.attempts.find(params[:id])
    render :template => 'attempts/edit', :layout => 'attempt'
  end

  def update
    @attempt = @event.attempts.find(params[:id])
    protected_fields = [:completed]
    unless params[:attempt].key?(:key) and @attempt.event.key == params[:attempt].delete(:key)
       protected_fields.each { |field| params[:attempt].delete(field) }
    end
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
