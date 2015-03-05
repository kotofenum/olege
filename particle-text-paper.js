
// 
// particleText
//  - build a word on canvas that is made up of
//    tons of tiny rad gravitational particles
// 
// @author Michael Roth <mroth@highbridgecreative.com>
// @version v0.0.1
//
var ParticleText = function(params) {

    /*
     * globals
     */
    // word
    this.word = params.word;
    // global paper object
    this.paper = null;
    // global mouse object
    this.mouse = null;
    // canvas
    this.canvas = null;
    // rasterized word
    this.raster = null;
    // word particles array
    this.particles = [];

    /*
     * particle
     *  - creates a particle object with x,y / vx,vy
     *    particles have gravity of k to the mouse and v
     *    back to their original starting position.
     * 
     * @param {namespace} parent
     * @param {object} params {
     *  @param {object} point
     *  @param {int} size
     *  @param {int} vx
     *  @param {int} vy
     * }
     */
    this.Particle = function(parent, params) {
         this.parent = parent;
         this.point = params.point;
         this.vx = params.vx || 0;
         this.vy = params.vy || 0;
         this.origin = params.point;
         this.size = params.size;
         this.color = params.color;
         this.path = null;

         this.init();
    };

    // draw the particle
    this.Particle.prototype.init = function() {
        var parent = this.parent;

        this.path = new parent.paper.Path.Rectangle({
            center: this.point,
            size: this.size,
            fillColor: this.color
        });

    };

    // update the particle physics
    this.Particle.prototype.update = function() {
        // update this particle
        var self = this;
        var parent = self.parent;

        // set position based 
        // on current velocity
        self.path.position.x += self.vy;
        self.path.position.y += self.vx;

        var mouse = {};
        mouse.x = parent.mouse.pos.x;
        mouse.y = parent.mouse.pos.y;
        mouse.dx = self.path.position.x - mouse.x;
        mouse.dy = self.path.position.y - mouse.y;
        mouse.radius = Math.sqrt(Math.pow(mouse.dx, 2) + Math.pow(mouse.dy, 2));
        mouse.dTotal = Math.abs(mouse.dx) + Math.abs(mouse.dy);
        mouse.accX = ((Math.abs(mouse.dx) * 2) / mouse.dTotal) * (1 / mouse.radius) * .2;
        mouse.accY = ((Math.abs(mouse.dy) * 2) / mouse.dTotal) * (1 / mouse.radius) * .2;

        if (mouse.dx < 0) {
            self.vx += mouse.accX;
        } else {
            self.vx -= mouse.accX;
        }
        if (mouse.dy < 0) {
            self.vy += mouse.accY;
        } else {
            self.vy -= mouse.accY;
        }

    };

    // initialize
    this.init(params);
};

//
// animate
//  - animate 
ParticleText.prototype.animate = function(){
    var len = this.particles.length;
    for(var i = 0; i< len; i++){
        this.particles[i].update();
    }
};

//
// init
//  - initialize class
ParticleText.prototype.init = function(params){
    var self = this;

    // setup canvas
    self.canvas = document.getElementById(params.canvas);
    self.canvas.width = params.width;
    self.canvas.height = params.height;
    self.paper = new paper.PaperScope();

    // setup paper
    self.paper.setup(self.canvas);

    // setup mouse
    self.mouse = new self.paper.Tool();
    self.mouse.pos = {};
    self.mouse.pos.x = 0;
    self.mouse.pos.y = 0;
    self.mouse.onMouseMove = function(e){
        self.mouse.pos = e.point;
    };

    // setup text 
    var gridSize = 5;
    var spacing = 1;

    self.word = new self.paper.PointText(self.word);
    self.raster = self.word.rasterize(10);
    self.raster.visible = false;

    for (var y = 0; y < self.raster.height; y++) {
        for(var x = 0; x < self.raster.width; x++) {

            // Get the color of the pixel:
            var color = self.raster.getPixel(x, y);
            
            if(color.alpha > 0) {
                var size = gridSize / 2 / spacing;
                var center = new self.paper.Point(x, y);
                var point = new self.paper.Point(center.x*gridSize,center.y*gridSize);
                
                // Create a particle
                self.particles.push(new self.Particle(self, {
                    point : point,
                    size : 5*color.alpha,
                    color : self.word.fillColor
                }));
            }
            
        }
    }

    // remove the placeholders
    self.raster.remove();
    self.word.remove();

    // reposition
    self.paper.project.activeLayer.position = new self.paper.Point(self.word.point.x, self.word.point.y);

    // setup animation events
    self.paper.view.onFrame = self.animate.bind(this);
};
