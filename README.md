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
    <a-scene background= "color:white;transparent:true">
	<a-assets>
		<a-asset-item id="moa" src="animation.moa"></a-asset-item>
	</a-assets>
      <a-entity
        scale = "1 1 1"
        aframe-modelica-model = "source:#moa;timeScale:0.2">
      </a-entity>
    </a-scene>
  </body>
</html>
```

## Examples
<a href="https://receptive-grill.glitch.me">Modelica.MiltiBody.Examples.Elementary.ForceAndTorque</a>
<a href="https://stump-allosaurus.glitch.me">Modelica.Mechanics.MultiBody.Examples.Elementary.DoublePendulum</a>
<a href="https://shocking-crown.glitch.me">Modelica.Mechanics.MultiBody.Examples.Elementary.HeatLosses</a>

## Modelica

ModelicaServices from
https://github.com/caepackages/modelica/
