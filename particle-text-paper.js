
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
         this.vx = params.vx || 0;
         this.vy = params.vy || 0;
         this.point = params.point;
         this.origin = params.point;
         this.path = params.path;
         this.scale = params.scale;
         this.symbol = null;

         this.init();
    };

    // draw the particle symbol
    this.Particle.prototype.init = function() {
        var parent = this.parent;

        var symbol = new parent.paper.Symbol(this.path);
        this.symbol = symbol.place(this.point);
        this.symbol.scale(this.scale, this.scale);
    };

    // update the particle physics
    this.Particle.prototype.update = function() {
        // update this particle
        var self = this;
        var parent = self.parent;

        // set position based 
        // on current velocity
        self.symbol.position.x += self.vx;
        self.symbol.position.y += self.vy;

        /*
        var mouse = {};
        mouse.x = parent.mouse.pos.x;
        mouse.y = parent.mouse.pos.y;
        mouse.dx = self.symbol.position.x - mouse.x;
        mouse.dy = self.symbol.position.y - mouse.y;
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
        */
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
    var gridSize = params.density || 9;
    var size = params.size || gridSize/3;
    var scale = params.scale || self.word.fontSize / gridSize / 72;
    var fontSize = self.word.fontSize;

    self.word = new self.paper.PointText(self.word);
    self.raster = self.word.rasterize();

    // font size 100 = 322 x 120
    self.raster.size = new self.paper.Size(self.raster.width*scale, self.raster.height*scale);
    self.raster.visible = false;

    // re-calculate width with % padding
    var scaledW = self.raster.width * gridSize;
    var scaledH = self.raster.height * gridSize;
    var whRation = scaledH/scaledW;
    var width = params.width || scaledW + (scaledW * whRation);
    var height = params.height  || scaledH + (scaledH * whRation);

    self.canvas.width = width;
    self.canvas.height = height;

    // setup default path
    var path = new parent.paper.Path.Circle({
        center: new self.paper.Point(0,0),
        radius: 1,
        fillColor: self.word.fillColor
    });

    for (var y = 0; y < self.raster.height; y++) {
        for(var x = 0; x < self.raster.width; x++) {

            // Get the color of the pixel:
            var color = self.raster.getPixel(x, y);

            if( (color.green == 0 && color.red == 0 && color.blue == 0) || color.alpha == .4)
                continue;
    
            var center = new self.paper.Point(x, y);
            var point = new self.paper.Point(center.x*gridSize,center.y*gridSize);
            
            // Create a particle symbol
            self.particles.push(new self.Particle(self, {
                point : point,
                scale : size * color.alpha,
                path : path
            }));
            
        }
    }

    // remove the placeholders
    self.raster.remove();
    self.word.remove();

    // reposition
    self.paper.view.viewSize = new self.paper.Size(width, height);
    self.paper.project.activeLayer.position = new self.paper.Point(self.paper.view.center);

    // setup animation events
    self.paper.view.onFrame = self.animate.bind(this);

    console.log('PARTICLE TEXT');
    console.log('-------------')
    console.log('# fontSize:', fontSize);
    console.log('# gridSize:', gridSize);
    console.log('# size:', size);
    console.log('# scale:', scale);
    console.log('# total particles:', self.particles.length);
};
