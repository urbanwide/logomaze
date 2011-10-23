/* 
 * Singleton object representative canvas plane
 *
 */


function Turtle (canvasElement, canvasElementArrow) {

    // canvas element (jQuery)
    this.canvasElement = null;    
    this.canvas = null;
    this.canvasArrow = null;
    this.extraArrowCanvas = false;
    
    // real position of zero point
    this.xReal = -249;
    this.yReal = 180
    
    // position of zero point
    this.x0 = 0;
    this.y0 = 0;

    // actual position
    this.x = this.xReal;
    this.y = this.yReal;
    
    // angle of rotate
    this.angle = 0;
    // pen is down
    this.pen = true;
    // turtle is visible
    this.visible = true;
    

    // Draw turtle
    this.draw = function() {
        if (!this.visible) {
            return false;
        }
        // size of turtle
        var size = 15;
        // helper variables
        var k2 = size*2/3;
        var k1 = size/3;
        // convert to radian
        var rad = this.angle * Math.PI / 180;
        // rotate turtle on zero point
        var A = Vector.rotate(0, -3*k2/2, rad);
        var B = Vector.rotate(k2, k1, rad);
        var C = Vector.rotate(-k2, k1, rad);        

        if(this.extraArrowCanvas) {
            this.canvasArrow.canvas.width = this.canvasArrow.canvas.width;
            this.canvasArrow.translate(this.x0, this.y0);
        }
        this.canvasArrow.save();
        this.canvasArrow.strokeStyle = "#339933";
        this.canvasArrow.lineWidth = 2;
        this.canvasArrow.beginPath();
        // move turtle to this.x and this.y position
        this.canvasArrow.moveTo(this.x+A.x, this.y+A.y);
        this.canvasArrow.lineTo(this.x+B.x, this.y+B.y);
        this.canvasArrow.lineTo(this.x+C.x, this.y+C.y);
        this.canvasArrow.closePath();
        this.canvasArrow.stroke();
        this.canvasArrow.restore();
    }    

    this.right = function(angle) {
        this.angle = (this.angle + angle) % 360;
    }
    
    this.left = function(angle) {
        this.right(-1*angle);
    }

    this.forward = function(step) {
    	// Convert to a healthy amount of movement onscreen
    	step = Math.ceil(step * 50);
        var rad = this.angle * Math.PI / 180;
        var ox = this.x;
        var oy = this.y;
        this.x = this.x + step * Math.sin(rad);
        this.y = this.y - step * Math.cos(rad);
        if(this.pen == true) {
            this.canvas.beginPath();
            this.canvas.moveTo(ox, oy);
            this.canvas.lineTo(this.x, this.y);
            this.canvas.closePath();
            this.canvas.stroke();
        }
    }
    
    this.back = function(step) {
        this.forward(-1*step);
    }

    this.clean = function() {
        this.canvas.canvas.width = this.canvas.canvas.width;
        this.canvas.translate(this.x0, this.y0);
         if(this.extraArrowCanvas) {
            this.canvasArrow.canvas.width = this.canvasArrow.canvas.width;
            this.canvasArrow.translate(this.x0, this.y0);
        }
    }

    this.penup = function() {
        this.pen = false;        
    }

    this.pendown = function() {
        this.pen = true;
    }

    this.home = function() {
        this.x=this.xReal; this.y=this.yReal;
    }

    this.hide = function() {
        this.visible = false;
    }

    this.show = function() {
        this.visible = true;
    }

    if (canvasElement.jquery != null) {
        this.canvas = canvasElement[0].getContext("2d");
    }else{
        this.canvas = canvasElement.getContext("2d");
        canvasElement = $(canvasElement);
    }
    this.canvasElement = canvasElement;

    if (canvasElementArrow != null) {
        if (canvasElementArrow.jquery != null) {
            canvasElementArrow = canvasElementArrow[0];
        }
        this.canvasArrow = canvasElementArrow.getContext("2d");
        this.extraArrowCanvas = true;
    } else {
        this.canvasArrow = this.canvas;
    }
    this.x0 = Math.ceil(this.canvasElement.width() / 2);
    this.y0 = Math.ceil(this.canvasElement.height() / 2);
    this.clean();
    
}