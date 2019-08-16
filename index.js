require('aframe')
var ModelicaShapeGeometry = require('three-modelica-shape').ModelicaShapeGeometry(AFRAME.THREE)
var getModelicaShapeMaterial = require('three-modelica-shape').getModelicaShapeMaterial(AFRAME.THREE)
var getModelicaShapeScale = require('three-modelica-shape').getModelicaShapeScale(AFRAME.THREE)
var STLLoader = require('three-stl-loader')(AFRAME.THREE)

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

  AFRAME.registerComponent('aframe-modelica-model', {
    schema: {
	  source: {type: 'selector'},
      modelicaPath: {default: './assets/'},
      filePath: {default: './'},
      timeScale: {default: -0.1},
      startTime: {default: 0.0},
      wireframe: {default: false}
    },

    process: function (moa) {
      var lines = moa.split('\n');
      var index = 0;
      var shape = '';
      var state = '';
      var shapeData = {};
      
      var shapeTypes = ['box', 'cylinder', 'pipe', 'gearwheel', 'spring', 'beam', 'cone', 'pipecylinder', 'sphere'];
      var keys = ['x', 'y', 'z', 'alpha', 'beta', 'gamma', 'length', 'width', 'height', 'red', 'green', 'blue', 'specular', 'transparency', 'extra'];
      
      var root = this.el.object3D;

      function parseDataVector (data) {
        var vecString = data.substring(1, data.length - 3).split(",")
        var vec = [];
        for(var j = 0; j < vecString.length; j++)
        {
          vec.push(parseFloat(vecString[j]));
        }
        return vec;
      };
      
      function isCadShape(c) {
        if (c.endsWith('.stl') || c.endsWith('.dxf')) {
          return true;
        }
      
        var numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        for ( var i = 0; i < c.length; i++) {
          if (numbers.indexOf(c[i]) == -1) {
            return false;
          }
        }
        return true;
      };
                  
      for( var i = 0; i < lines.length; i++)
      {
        var line = lines[i];
        if (i == 0) {
          this.header = JSON.parse(line.replace(new RegExp("'", 'g'), '"'));
        } else {
       
          index += 1;
          if (line.startsWith("'")) {          
            // save previous shape
            if ('shape' in shapeData) {     
              if (state == 'shape') {
                var moShape = this.generateShapeMesh(shapeData);              
                root.add( moShape );
                this.processShape(shapeData, moShape);
              } else if (state == 'cad') {
                var loader = new STLLoader();
                var transparency = 0.0;
                var material = getModelicaShapeMaterial('box', shapeData['red'][0],shapeData['green'][0], shapeData['blue'][0], transparency, shapeData['specular'][0], shapeData['extra'][0], this.data.wireframe);  
                
                path = shapeData['shape'];
                path = path.replace('modelica://', this.data.modelicaPath);
                path = path.replace('file://', this.data.filePath);
                path = path.replace('.dxf', '.stl');
                
                loader.load( path,
                function ( geometry ) {
                  var cadShape = new THREE.Mesh( geometry, material );
                  var shapeData = this['shape'];
                  var self = this['self']
                  
                  self.setFramePosition (cadShape, shapeData);
                  self.setFrameOrientation (cadShape, shapeData);

                  if (shapeData['extra'][0] > 0.5) {
                    cadShape.scale.set(shapeData['length'][0], shapeData['width'][0], shapeData['height'][0]);
                  }
                  
                  root.add( cadShape );
                  self.processShape(shapeData, cadShape);
                  
                  }.bind({'self': this, 'shape': shapeData}))
              } else if (state == 'surface') {
                //this.surfaces.push(shapeData);
              }              
            }
            
            index = 0;
            shape = line.substring(1, line.length - 2);
           
            if ( shapeTypes.indexOf(shape) > -1 || shape.startsWith('THREE.')) {
              state = 'shape';
              shapeData = {'shape': shape};
            } else if (isCadShape(shape)) {
              state = 'cad';
              shapeData = {'shape': shape}
            }
            else if (shape == 'surface') {
              state = 'surface';
              shapeData = {'shape': shape}
            } else {
              state = '';
              shapeData = {};              
            }
          }
          
          if (i == 2) {
            // simulation time vector
            this.time = parseDataVector (line);
          }
          
          if (index > 1 && (state == 'shape' || state == 'cad')) {
            var key = keys[index - 2];
            shapeData[key] = parseDataVector (line);
          }
        }
      }
      
      if ('shape' in shapeData) {     
        if (state == 'shape') {
          var moShape = this.generateShapeMesh(shapeData);              
          root.add( moShape );
          this.processShape(shapeData, moShape);
        } else if (state == 'cad') {
          var loader = new STLLoader();
          var transparency = 0.0;
          var material = getModelicaShapeMaterial('box', shapeData['red'][0],shapeData['green'][0], shapeData['blue'][0], transparency, shapeData['specular'][0], shapeData['extra'][0], this.data.wireframe);  
          
          path = shapeData['shape'];
          path = path.replace('modelica://', this.data.modelicaPath);
          path = path.replace('file://', this.data.filePath);
          path = path.replace('.dxf', '.stl');
          
          loader.load( path,
          function ( geometry ) {
            var cadShape = new THREE.Mesh( geometry, material );
            var shapeData = this['shape'];
            var self = this['self']
            
            self.setFramePosition (cadShape, shapeData); 
            self.setFrameOrientation (cadShape, shapeData);
            
            if (shapeData['extra'][0] > 0.5) {
              cadShape.scale.set(shapeData['length'][0], shapeData['width'][0], shapeData['height'][0]);
            }
            
            root.add( cadShape );
            self.processShape(shapeData, cadShape);
            
            }.bind({'self': this, 'shape': shapeData}))
        } else if (state == 'surface') {
          //this.surfaces.push(shapeData);
        }              
      }

      this.animate = true;
    },
    
    generateShapeMesh: function (shape) {
      var geometry = new ModelicaShapeGeometry (shape['shape'], shape['length'][0], shape['width'][0], shape['height'][0], shape['extra'][0]);
      var transparency = 0.0; // currently not supported in MSL
      var material = getModelicaShapeMaterial(shape['shape'], shape['red'][0],shape['green'][0], shape['blue'][0], transparency, shape['specular'][0], shape['extra'][0], this.data.wireframe);  
      var moShape = new THREE.Mesh( geometry, material );
      this.setFramePosition (moShape, shape);
      this.setFrameOrientation (moShape, shape);
      var scale = getModelicaShapeScale(shape['shape'], shape['length'][0], shape['width'][0], shape['height'][0]);
      moShape.scale.set(scale.x, scale.y, scale.z);
      return moShape;
    },
    
    getFrameData: function (vec, frame) {
      if (vec.length == 0 || frame < 0) {
        return vec[0];
      } else if (frame >= this.time.length) {
        return vec[vec.length - 1];
      }
      return vec[Math.max(frame - this.time.length + vec.length, 0)];
    }, 

    hasKeyFrame: function (shape, channels) {
      for ( var i = 0; i < channels.length; i += 1) {
        if (shape[channels[i]].length > 1) {
          return true;
        }
      }
      return false;
    },

    processShape: function(shapeData, mesh) {
      // var position
      if (this.hasKeyFrame(shapeData, ['x','y','z'])) {
        this.varPosition.push([shapeData, mesh]);
      }

      // var orientation
      if (this.hasKeyFrame(shapeData, ['alpha','beta','gamma'])) {
        this.varOrientation.push([shapeData, mesh]);
      }

      // var material
      if (this.hasKeyFrame(shapeData, ['red','green','blue', 'specular'])) {
        this.varMaterial.push([shapeData, mesh]);
      }

      // var shape
      if (this.hasKeyFrame(shapeData, ['length', 'width', 'height', 'extra'])) {
        this.varShape.push([shapeData, mesh]);
      }
    },
    
    setFrame: function (frame) {
      if (this.animate && frame < this.time.length ) {
        // update orientation
        for( var i = 0; i < this.varOrientation.length; i++)
        {
          var data = this.varOrientation[i];
          this.setFrameOrientation (data[1], data[0], frame);
        }
      
        // update position
        for( var i = 0; i < this.varPosition.length; i++)
        {
          var data = this.varPosition[i];
          this.setFramePosition (data[1], data[0], frame);
        }
        
        // update material
        for( var i = 0; i < this.varMaterial.length; i++)
        {
          var data = this.varMaterial[i];
          this.setFrameMaterial (data[1], data[0], frame);
        }

        // update shape
        for( var i = 0; i < this.varShape.length; i++)
        {
          var data = this.varShape[i];
          this.setFrameShape (data[1], data[0], frame);
        }
      }  else {
        console.log("frame out of range: " + frame)
      }       
    },

    setFrameOrientation: function (mesh, shape, frame) {
      f = frame || 0;
    
      // new orientation
      var alpha = this.getFrameData(shape['alpha'], f);
      var beta = this.getFrameData(shape['beta'], f);
      var gamma = this.getFrameData(shape['gamma'], f);
      mesh.setRotationFromEuler(new THREE.Euler(alpha, beta, gamma, 'ZYX'));
    },
    
    setFrameMaterial: function (mesh, shape, frame) {
      f = frame || 0;
      var transparency = 0.0;

      // new material
      var red = this.getFrameData(shape['red'], f);
      var green = this.getFrameData(shape['green'], f);
      var blue = this.getFrameData(shape['blue'], f);
      var specular = this.getFrameData(shape['specular'], f);
      var extra = this.getFrameData(shape['extra'], f);
      mesh.material = getModelicaShapeMaterial(shape['shape'], red, green, blue, transparency, specular, extra, this.data.wireframe);  
    },
    
    setFrameShape: function (mesh, shape, frame) {
      f = frame || 0;
      var length = this.getFrameData(shape['length'], f);
      var width = this.getFrameData(shape['width'], f);
      var height = this.getFrameData(shape['height'], f);
      var extra = this.getFrameData(shape['extra'], f);
      mesh.geometry = new ModelicaShapeGeometry (shape['shape'], length, width, height, extra);
      var scale = getModelicaShapeScale(shape['shape'], length, width, height);
      mesh.scale.set(scale.x, scale.y, scale.z);
    },

    setFramePosition: function (mesh, shape, frame) {
      f = frame || 0;
      
      // new position
      var x = this.getFrameData(shape['x'], f);
      var y = this.getFrameData(shape['y'], f);
      var z = this.getFrameData(shape['z'], f);
      mesh.position.set(x, y, z);
    },

    init: function () {
      this.header = {};
      
      // new
      this.varPosition = [];
      this.varOrientation = [];
      this.varMaterial = [];
      this.varShape = []; 
      this.animate = false;

	  if (this.data.source !== null) {
        this.process(this.data.source.data);
      }
    },

    play: function () {
      this.animate = true;
    },

    pause: function () {
      this.animate = false;
    },

    remove: function () {
      this.el.removeObject3D('mesh');
    },

    tick: function (time) {
      if ( this.animate ) {
        var simulationTime = (time - this.data.startTime);
        
        var timeElapsedNormalized = ( time * 0.001 - this.data.startTime ) * this.data.timeScale / (this.time[this.time.length - 1] - this.time[0]) % 1

        if ( timeElapsedNormalized < 0.0) {
          timeElapsedNormalized += 1.0;
        }
        
        var f = Math.round((this.time.length - 1) * timeElapsedNormalized);
        this.setFrame (f);
      }
    },
  });
  
