
// 
// particleText
//  - build a word on canvas that is made up of
//    tons of tiny rad gravitational particles
// 
// @author Michael Roth <mroth@highbridgecreative.com>
// @version v0.0.1
//
var ParticleText = function(params) {

    /**
     * globals
     */
    // global paper object
    this.paper = null;
    // global mouse object
    this.mouse = null;
    // canvas
    this.canvas = null;
    // word
    this.word = params.word;
    // rasterized word
    this.raster = null;

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
         this.vx = params.vx;
         this.vy = params.vy;
         this.origPoint = params.point;
         this.radius = params.size / 2;
         this.color = params.color;
    };

    // draw the particle
    this.Particle.prototype.draw = function() {
        // draw this particle
    };

    // update the particle physics
    this.Particle.prototype.update = function() {
        // update this particle
    };

    // initialize
    this.init(params);
};

//
// animate
//  - animate 
ParticleText.prototype.animate = function(){


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
    self.mouse.onMouseMove = function(e){
        self.mouse.pos = e.point;
    };

    // setup text 
    var gridSize = 12;
    var spacing = 1.2;

    self.word = new self.paper.PointText(self.word);
    self.raster = self.word.rasterize(72);
    self.raster.size = new self.paper.Size(self.raster.height*.75, self.raster.height*.75);

    for (var y = 0; y < self.raster.height; y++) {
        for(var x = 0; x < self.raster.width; x++) {

            // Get the color of the pixel:
            var color = self.raster.getPixel(x, y);
            
            if(color.alpha > 0) {
                var radius = gridSize / 2 / spacing;
                var center = new self.paper.Point(x, y);

                // TODO why .6?
                var pos = new self.paper.Point(center.x + self.word.point.x, center.y+ (self.word.point.y*.6));
                var pos = new self.paper.Point(pos.x+50,pos.y);
                
                // Create a circle shaped path:
                var path = new self.paper.Path.Circle({
                    center: pos,
                    radius: gridSize / 2 / spacing,
                    fillColor: 'black'
                });
                //console.log(path.position);
            }
            
        }
    }

    self.raster.remove();
    self.word.remove();

    // setup animation events
    self.paper.view.onFrame = self.animate;

    //console.log(self);
};
