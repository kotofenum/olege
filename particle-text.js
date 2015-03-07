
/* 
 * width
 *  - String width hack 
 *  (because measureText sucks)
 * 
 * @param {string} font
 */
String.prototype.width = function(font) {
  var f = font || '12px arial',
      o = document.createElement('div'),
      t = document.createTextNode(this);
      o.appendChild(t);
      o.style.position = 'absolute'; 
      o.style.float = 'left';
      o.style['white-space'] = 'nowrap';
      o.style.visibility = 'hidden';
      o.style.font = f;
      document.body.appendChild(o);
      var w = o.clientWidth;
      o.parentNode.removeChild(o);
  return w;
};

// 
// particleText
//  - build a word on canvas that is made up of
//    tons of tiny rad gravitational particles
// 
// @author Michael Roth <mroth@highbridgecreative.com>
// @version v0.0.1
//
var particleText = (function() {

    // data
    var data = {
        density: 150,
        letters: [],
        width: null,
        height: null,
        canvas: null,
        ctx: null,
        mousePos: {
            x: 9999,
            y: 9999,
            d2c: 0
        },
        time: null,
        text : {
            width : 0,
            height : 0,
            center : 0
        }
    };

    /**
     * Letter
     *  - creates a letter object at position x,y
     *    letters are comprised of x number of particles
     *
     * @param {object} params {
     *    text, x, y, width, height, color
     * }
     */
    var Letter = function(params) {
        this.width = params.width;
        this.height = params.height;
        this.text = params.text;
        this.density = params.density;
        this.x = params.x;
        this.y = params.y;
        this.pixels = [];
        this.particles = [];
        this.color = params.color || '#00BCA3';
        this.particleMax = params.max || 4;

        this.alphas = 0;

        // setup letter
        data.ctx.fillStyle = this.color;
        data.ctx.fillText(this.text, this.x, this.y);
        var imageData = data.ctx.getImageData(this.x, (this.y-this.height), this.width , this.height);
        data.ctx.clearRect(this.x, (this.y-this.height), this.width, this.height);

        // build bounding polygon
        var pixelData = imageData.data;
        var len = pixelData.length;
        for (var i = 0; i < len; i += 4) {

                var pixel = {
                    r : pixelData[i],
                    g : pixelData[i+1],
                    b : pixelData[i+2],
                    a : pixelData[i+3]
                };

                // setup array if not yet created
                var x = (i / 4) % this.width;
                var y = Math.floor((i / 4) / this.width);

                if(typeof(this.pixels[y]) == 'undefined') {
                    this.pixels[y] = [];
                }
                this.pixels[y][x] = pixel;
        }

        // create the particles
        for(var y = 0, yLen=this.pixels.length; y<yLen; y++) {
            for(var x = 0, xLen=this.pixels[y].length; x<xLen; x++) {

                // white pixel?
                if(this.checkPixel(y,x))
                    continue;

                this.particles.push(new Particle({
                    parent : this.text,
                    color : this.color,
                    size : 7 * (this.pixels[y][x].a/255),
                    x : this.x + (x*7), 
                    y : this.y + (y*7)
                }));
               
            }
        }

    };

    //  check if a pixel is white
    Letter.prototype.checkPixel = function(y, x) {
        if(!this.pixels[y]) return true;

        var pixel = this.pixels[y][x];

        if(typeof(pixel) == 'undefined' ) return true;
        return pixel.a == 0;

    };

    /**
     * particle
     *  - creates a particle object with x,y / vx,vy
     *    particles have gravity of k to the mouse and v
     *    back to their original starting position.
     *
     * @param {int} size
     * @param {int} x
     * @param {int} y
     * @param {int} vx
     * @param {int} vy
     */
    var Particle = function(params) {
        this.parent = params.parent;
        this.x = params.x;
        this.y = params.y;
        this.origX = params.x;
        this.origY = params.y;
        this.size = params.size;
        this.color = params.color;
        this.vx = params.vx || 0;
        this.vy = params.vy || 0;
    };

    // draw the particle
    Particle.prototype.draw = function() {
        data.ctx.beginPath();
        data.ctx.arc(this.x, this.y, this.size/2, 0, 2 * Math.PI, false);
        //data.ctx.rect(this.x, this.y, this.size, this.size)
        data.ctx.fillStyle = this.color;
        data.ctx.fill();
    };

    // update the particle physics
    Particle.prototype.update = function() {
        var self = this;

        // set position based 
        // on current velocity
        self.y += self.vy;
        self.x += self.vx;

        // TODO variation?
        //var variation = Math.random();
        var mouseForce = 15; // * variation;
        var originForce = 0.2; // * variation;
        var friction = 0.09; //* variation;
        var vMax = Math.random()* (5-2)+2;

        // --- target positions --- //
        var dx = data.text.center.x-data.mousePos.x;
        var dy = data.text.center.y-data.mousePos.y;
        data.mousePos.d2c = Math.sqrt(Math.pow(dx, 2)+Math.pow(dy, 2));

        if (data.mousePos.d2c > 250 + (125-Math.abs(dy)) ) {
            // origin
            if (self.x > self.origX) {
                self.vx -= originForce;
            } else {
                self.vx += originForce;
            }
            if (self.y > self.origY) {
                self.vy -= originForce;
            } else {
                self.vy += originForce;
            }
        } else {
            //  mouse
            var mouse = {};
            mouse.x = data.mousePos.x;
            mouse.y = data.mousePos.y;
            mouse.dx = self.x - mouse.x;
            mouse.dy = self.y - mouse.y;
            mouse.radius = Math.sqrt(Math.pow(mouse.dx, 2) + Math.pow(mouse.dy, 2));
            mouse.dTotal = Math.abs(mouse.dx) + Math.abs(mouse.dy);
            mouse.accX = ((Math.abs(mouse.dx) * 2) / mouse.dTotal) * (1 / mouse.radius) * mouseForce;
            mouse.accY = ((Math.abs(mouse.dy) * 2) / mouse.dTotal) * (1 / mouse.radius) * mouseForce;

            // apply acceleration
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

            // slow/stop (square around mouse)
            if (mouse.radius < 20) {
                self.vx = (self.vx * -1) * .8;
                self.vy = (self.vy * -1) * .8;
            }
        }

        // --- max velocity --- //
        if (self.vx > 0) {
            self.vx = (self.vx > vMax) ? vMax : self.vx;
        } else {
            self.vx = (self.vx < (vMax * -1)) ? (vMax * -1) : self.vx;
        }
        if (self.vy > 0) {
            self.vy = (self.vy > vMax) ? vMax : self.vy;
        } else {
            self.vy = (self.vy < (vMax * -1)) ? (vMax * -1) : self.vy;
        }

        //  --- friction --- //
        if (self.vx > 0) {
            self.vx -= friction;
        } else if (self.vx < 0) {
            self.vx += friction;
        }
        if (self.vy > 0) {
            self.vy -= friction;
        } else if (self.vy < 0) {
            self.vy += friction;
        }

        // --- collisions --- //
        // bottom
        var colDamp = 0.3;
        if (self.y > (data.canvas.height - self.radius)) {
            self.y = data.canvas.height - self.radius - 2;
            self.vy *= -1;
            self.vy *= (1 - colDamp);
        }
        // top
        if (self.y < (self.radius)) {
            self.y = self.radius + 2;
            self.vy *= -1;
            self.vy *= (1 - colDamp);
        }
        // right
        if (self.x > (data.canvas.width - self.radius)) {
            self.x = data.canvas.width - self.radius - 2;
            self.vx *= -1;
            self.vx *= (1 - colDamp);
        }
        // left
        if (self.x < (self.radius)) {
            self.x = self.radius + 2;
            self.vx *= -1;
            self.vx *= (1 - colDamp);
        }
    };

    // ---- helper functions ----- //

    /*
     * updateMousePos
     *  - get current mouse pos
     *
     * @param {object} e
     */
    var updateMousePos = function(e) {
        var rect = data.canvas.getBoundingClientRect();
        // return relative mouse position
        data.mousePos.x = e.clientX - rect.left;
        data.mousePos.y = e.clientY - rect.top;
        return data.mousePos;
    };

    /*
     * animate
     *  - animate the whole shebang
     *
     * @param {string} word
     */
    var animate = function(word) {
        // TODO make sure we are in
        // viewport otherwise pause (to save resources)

        // update time
        var date = new Date();
        data.time = date.getTime();

        // ---- update ---- //
        var len = data.letters.length;
        while (len > 0) {
            var letter = data.letters[len - 1];
            var particleLen = letter.particles.length;
            // update particles
            while (particleLen > 0) {
                letter.particles[particleLen - 1].update();
                particleLen--;
            }
            len--;
        }

        // ---- clear ---- //
        data.ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);

        // ---- re-render ---- //
        var len = data.letters.length;
        while (len > 0) {
            var letter = data.letters[len - 1];
            var particleLen = letter.particles.length;
            // draw particles
            while (particleLen > 0) {
                letter.particles[particleLen - 1].draw();
                particleLen--;
            }
            len--;
        }

        // --- request new frame --- //
        requestAnimFrame(function anim(){
            animate(word);
        });
    };

    /*
     * requestAnimFrame
     *  - x-browser requestAnimationFrame
     *
     * @param {function} callback
     */
    var requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame 
            || window.webkitRequestAnimationFrame 
            || window.mozRequestAnimationFrame 
            || window.oRequestAnimationFrame 
            || window.msRequestAnimationFrame 
            || function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    /* 
     * init
     *  - initialize the science
     *
     * @param {int} x
     * @param {int} y
     * @param {string} word
     * @param {string} font
     */
    var init = function(x, y, word, font) {

        // setup canvas
        data.x = x;
        data.y = y;
        data.width = window.innerWidth;
        data.height = window.innerHeight;
        data.canvas = document.getElementById('canvas');
        data.canvas.width = data.width;
        data.canvas.height = data.height;
        data.ctx = data.canvas.getContext('2d');
        data.ctx.font = font;

        var tLen = x;
        var len = word.length;
        var height = parseInt((font.split(' ')[1]).replace('px',''));
        for (var i = 0; i < len; i++) {
            var w = word[i].width(font);
            tLen += w*7;
            data.letters.push(new Letter({
                color : '#00BCA3',
                density : data.density,
                text : word[i],
                width : w,
                height: height,
                x : tLen,
                y : y
            }));
        }

        // save the text dimensions / center coordinate
        data.text.width = tLen-data.x;
        data.text.height = height;
        data.text.center = { 
            x : data.x+(data.text.width/2)+80, 
            y : data.y+(data.text.height/2)+10
        };

        // bind events
        var mousemove = function(e) {
            var pos = updateMousePos(e);
            data.mousePos.x = pos.x;
            data.mousePos.y = pos.y;
        };
        var mouseout = function(e) {
            data.mousePos.x = 9999;
            data.mousePos.y = 9999;
        };
        data.canvas.removeEventListener('mousemove', mousemove);
        data.canvas.addEventListener('mousemove', mousemove);
        data.canvas.removeEventListener('mouseout', mouseout);
        data.canvas.addEventListener('mouseout', mouseout);

        // start
        var date = new Date();
        data.startTime = date.getTime();
        animate(word);
    };
    

    // make available in scope
    return init;

})();
