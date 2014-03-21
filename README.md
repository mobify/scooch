# Scooch

A mobile-first content and image carousel.

## Usage

```html
    <!-- include scooch.css -->
    <link rel="stylesheet" href="scooch.css">
    <link rel="stylesheet" href="scooch-style.css">

    <!-- the viewport -->
    <div class="scooch">
      <!-- the slider -->
      <div class="scooch__inner">
        <!-- the items -->
        <div class="scooch__item scooch--active">
          <img src="image1.jpg">
        </div>
        <div class="scooch__item">
          <img src="image2.jpg">
        </div>
        <div class="scooch__item">
          <img src="image3.jpg">
        </div>
      </div>
      <!-- the controls -->
      <div class="scooch__controls scooch--bulleted">
        <a href="#" data-scooch-slide="prev" class="scooch__control scooch--prev">Previous</a>
        <a href="#" data-scooch-slide="1" class="scooch__control scooch--bullet scooch--active">1</a>
        <a href="#" data-scooch-slide="2" class="scooch__control scooch--bullet">2</a>
        <a href="#" data-scooch-slide="3" class="scooch__control scooch--bullet">3</a>
        <a href="#" data-scooch-slide="next" class="scooch__control scooch--next">Next</a>
      </div>
    </div>

    <!-- include zepto.js or jquery.js -->
    <script src="zepto.js"></script>
    <!-- include scooch.js -->
    <script src="scooch.js"></script>
    <!-- construct the carousel -->
    <script>$('.scooch').scooch()</script>
```


## Classes

By default, items are left aligned and their width is determined by
their content width and/or any styling that restricts their width.

To change the styling of the items, add the following classes to the
`.scooch` element:


| Class       | Description                                            |
|-------------|---------------------------------------------------------
| `.scooch--fluid`  | Causes the width of items to resize to match the viewport width. |
| `.scooch--center` | Causes the items to be center aligned, not left aligned (the default). |




## Methods

### .scooch(options)

Constructs the carousel with options.

```javascript
    $('.scooch').scooch({
          dragRadius: 10
        , moveRadius: 20
        , classPrefix: undefined
        , classNames: {
            outer: "carousel"
          , inner: "carousel-inner"
          , item: "item"
          , center: "center"
          , touch: "has-touch"
          , dragging: "dragging"
          , active: "active"
        }
    });
```

### .scooch('next')

Moves the carousel one item to the right.

    $('.scooch').scooch('next');

### .scooch('prev')

Moves the carousel one item to the left.

    $('.scooch').scooch('prev');

### .scooch('move', x)

Moves the carousel to a index `x` (1-based).

    $('.scooch').scooch('move', 1);

### .scooch('unbind')

Removes event handlers bound on the carousel.

    $('.scooch').scooch('unbind');

### .scooch('bind')

Binds the event handlers on the carousel.

    $('.scooch').scooch('bind');

### .scooch('refresh')

Re-initialize carousel after new slides were added or removed

    $('.scooch').scooch('refresh');

### .scooch('destroy')

Removes the carousel and its event handlers from the DOM.

    $('.scooch').scooch('destroy');


## Events

The viewport emits the following events:

| Name          | Arguments                 | Description                               |
|---------------|---------------------------|-------------------------------------------|
| beforeSlide   | previousIndex, newIndex   | Fired before the carousel moves.          |
| afterSlide    | previousIndex, newIndex   | Fired after the carousel begins moving.   |

## Browser Compatibility

### Mobile Browsers

The following mobile browsers are fully supported:

| Browser           | Version |
|-------------------|---------|
| Mobile Safari     | 3.1.3+  |
| Android Browser   | 2.1+    |
| Android Chrome    | 1.0+    |
| Android Firefox   | 1.0+    |

The following mobile browsers have degraded support:

| Browser           | Version |
|-------------------|---------|
| Windows Phone     | 7.5     |

### Desktop Browsers

The follow desktop browsers are fully supported:

| Browser           | Version |
|-------------------|---------|
| Safari            | 4.0+    |
| Firefox           | 4.0+    |
| Chrome            | 12.0+   |
| Opera             | 12.0+   |
| Internet Explorer | 10.0+   |

The following desktop browsers have degraded support:

| Browser           | Version |
|-------------------|---------|
| Internet Explorer | 8.0,9.0 |
| Firefox           | 3.5,3.6 |

## Building
### Requirements
* [node.js 0.8.x/npm](http://nodejs.org/download/)

### Steps
1. `npm install -g grunt-cli`
2. `npm install`
3. `grunt`

The build directory will be populated with minified versions of the css and 
javascript files and a .zip of the original source files (for distribution and
use with whatever build system you might use).
