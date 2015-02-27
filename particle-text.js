
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
            y: 9999
        },
        time: null
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
        this.color = params.color;
        this.width = params.width;
        this.height = params.height;
        this.text = params.text;
        this.density = params.density;
        this.x = params.x;
        this.y = params.y;
        this.pixels = [];
        this.particles = [];

        // setup letter
        data.ctx.fillStyle = this.color;
        data.ctx.fillText(this.text, this.x, this.y);
        var imageData = data.ctx.getImageData(this.x, (this.y-this.height), this.width , this.height);
        data.ctx.clearRect(this.x, (this.y-this.height), this.width, this.height);
  
        // build bounding polygon
        var pixelData = imageData.data;
        var len = pixelData.length;
        for (var i = len; i >= 0; i -= 4) {
            if (pixelData[i+2] > 0 && pixelData[i+2] != 255) {
                var pixel = {
                    x: (i / 4) % this.width,
                    y: Math.floor((i / 4) / this.width)
                };
                this.pixels.push(pixel);
            }
        }

        // enter the pixels
        for(var i = 0; i<this.pixels.length; i++) {
            var size = Math.random()*15;
            i = Math.round(i+size);
            if(i >= (this.pixels.length-1)) return;

            // TODO fill bounding polygon instead
            // of spacing out indexes by size
            this.particles.push(new Particle({
                parent : this.text,
                color : '#00BCA3',
                size: size, 
                x: this.x+this.pixels[i].x, 
                y: this.y+this.pixels[i].y, 
                vx : 0, 
                vy : 0
            }));
        }

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
        this.vx = params.vx;
        this.vy = params.vy;
        this.origX = params.x;
        this.origY = params.y;
        this.radius = params.size / 2;
        this.color = params.color;
    };

    // draw the particle
    Particle.prototype.draw = function() {
        data.ctx.beginPath();
        //data.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        data.ctx.rect(this.x, this.y, this.radius, this.radius)
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

        var variation = Math.random();
        var mouseForce = 10 * variation;
        var originForce = 0.07 * variation;
        var friction = 0.04 * variation;
        var vMax = 5;

        // --- target positions --- //
        if (data.mousePos.x == 9999 || data.mousePos.y == 9999) {
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
            if (mouse.dx > -30 && mouse.dx < 30 && mouse.dy > -30 && mouse.dy < 30) {
                self.vx = self.vx * .01;
                self.vy = self.vy * .01;
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
        // get canvas position
        var obj = data.canvas;
        var top = 0;
        var left = 0;
        while (obj.tagName != 'BODY') {
            top += obj.offsetTop;
            left += obj.offsetLeft;
            obj = obj.offsetParent;
        }
        // return relative mouse position
        data.mousePos.x = e.clientX - left + window.pageXOffset;
        data.mousePos.y = e.clientY - top + window.pageYOffset;
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
        data.width = window.innerWidth;
        data.height = window.innerHeight;
        data.canvas = document.getElementById('canvas');
        data.canvas.width = data.width;
        data.canvas.height = data.height;
        data.ctx = data.canvas.getContext('2d');
        data.ctx.font = font;

        var tLen = x;
        var len = word.length;
        var height = (font.split(' ')[1]).replace('px','');
        for (var i = 0; i < len; i++) {
            var w = word[i].width(font);
            tLen += w;
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
