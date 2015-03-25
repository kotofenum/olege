# particle-text
An HTML5 canvas font physics experiment and concept piece. It's also just really fun to play with.

## Setup/Installation

There are no additional dependencies (not even jquery) so all you need to do is include the script.

```html
<head>
   <!-- include the script -->
   <script src="js/particle-text.min.js"></script>
</head>
```

Then initialize it.

```javascript
var config = {
      canvas : 'canvas', // id of the canvas element 
      density: 8, // # of pixels a particle represents
      size: 6, // size of the particles
      font : {
        color : '#666666',
        size: 22,
        family: 'helvetica'
      }
    };

var pt1 = new ParticleText('Letters', config);
```

---

**Available Options**

```javascript

{
  canvas : 'canvas', // id of the canvas element 
  density: 8, // # of pixels a particle represents
  size: 6, // size of the particles
  font : {
      color : '#666666',
      size: 22,
      family: 'helvetica',
      weight: 'bold'
  },
  disableAnim : false // disables animations (ie. for mobile/while resizing)
}

```

**Available Methods**

* `init` initializes and sets up the canvas element (calls animate)
* `destroy` unbinds events and re-builds the canvas element
* `animate` initializes the animations
* `getOffset(element)` returns the {x,y} offset of a given element
