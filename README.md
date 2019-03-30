# aframe-modelica-model

## NPM

```
npm i aframe-modelica-model
```

```javascript
// main.js
require('aframe-modelica-model');
```

## Browserify

```
browserify main.js -o bundle.js
```

## HTML

```html
<html>
  <head>
  </head>
    <script src="bundle.js"></script>  
  <body>
    <a-scene background= "color:white">
      <a-entity
        scale = "1 1 1"
        aframe-modelica-model = "moaFile:/tests/engine/animation.moa;timeScale:0.05">
      </a-entity>
    </a-scene>
  </body>
</html>
```

## Modelica

ModelicaServices from
https://github.com/caepackages/modelica/
