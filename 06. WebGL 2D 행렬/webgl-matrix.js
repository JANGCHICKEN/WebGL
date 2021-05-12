function start() {
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector('#canvas');
  /** @type {WebGLRenderingContext} */
  var gl = canvas.getContext('webgl');
  if (!gl) {
    return;
  }

  var program = webglUtils.createProgramFromScripts(gl, ['vertex-shader-2d', 'fragment-shader-2d']);

  // lookup attribute
  var positionLocation = gl.getAttribLocation(program, 'a_position');

  // lookup uniform
  var resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  var matrixLocation = gl.getUniformLocation(program, 'u_matrix');
  var colorLocation = gl.getUniformLocation(program, 'u_color');

  // create positionBuffer
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  setGeometry(gl);

  var translation = [100, 150];
  var angleInRadians = 0;
  var scale = [1, 1];
  var color = [Math.random(), Math.random(), Math.random(), 1];

  drawScene();

  webglLessonsUI.setupSlider('#x', { value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider('#y', { value: translation[1], slide: updatePosition(1), max: gl.canvas.height });
  webglLessonsUI.setupSlider('#angle', { slide: updateAngle, max: 360 });
  webglLessonsUI.setupSlider('#scaleX', { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01 });
  webglLessonsUI.setupSlider('#scaleY', { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01 });

  function updatePosition(index) {
    return function (event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updateAngle(event, ui) {
    var angleInDegrees = 360 - ui.value;
    angleInRadians = (angleInDegrees * Math.PI) / 180;
    drawScene();
  }

  function updateScale(index) {
    return function (event, ui) {
      scale[index] = ui.value;
      drawScene();
    };
  }

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform4fv(colorLocation, color);

    var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
    console.log(matrix)
    // matrix = m3.translate(matrix, translation[0], translation[1]);
    // matrix = m3.rotate(matrix, angleInRadians);
    // matrix = m3.scale(matrix, scale[0], scale[1]);

    // var matrix = m3.identity();

    // for (var i = 0; i < 5; i++) {
    //   matrix = m3.multiply(matrix, translationMatrix);
    //   matrix = m3.multiply(matrix, rotationMatrix);
    //   matrix = m3.multiply(matrix, scaleMatrix);
    //   matrix = m3.multiply(matrix, moveOriginMatrix);

    gl.uniformMatrix3fv(matrixLocation, false, matrix);

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 18;
    gl.drawArrays(primitiveType, offset, count);
    // }
  }
}

var m3 = {
  identity: function () {
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  },

  translate: function (m, tx, ty) {
    return m3.multiply(m, m3.translation(tx, ty));
  },

  rotate: function (m, angleInRadians) {
    return m3.multiply(m, m3.rotation(angleInRadians));
  },

  scale: function (m, sx, sy) {
    return m3.multiply(m, m3.scaling(sx, sy));
  },

  projection: function (width, height) {
    return [2 / width, 0, 0, 0, -2 / height, 0, -1, 1, 1];
  },

  translation: function (tx, ty) {
    return [1, 0, 0, 0, 1, 0, tx, ty, 1];
  },

  rotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [c, -s, 0, s, c, 0, 0, 0, 1];
  },

  scaling: function (sx, sy) {
    return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
  },

  multiply: function (a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];
    return [b00 * a00 + b01 * a10 + b02 * a20, b00 * a01 + b01 * a11 + b02 * a21, b00 * a02 + b01 * a12 + b02 * a22, b10 * a00 + b11 * a10 + b12 * a20, b10 * a01 + b11 * a11 + b12 * a21, b10 * a02 + b11 * a12 + b12 * a22, b20 * a00 + b21 * a10 + b22 * a20, b20 * a01 + b21 * a11 + b22 * a21, b20 * a02 + b21 * a12 + b22 * a22];
  },
};

function setGeometry(gl) {
  // gl.bufferData(
  //   gl.ARRAY_BUFFER, 
  //   new Float32Array([
  //     0, 0, 30, 
  //     0, 0, 150, 
  //     0, 150, 30, 
      
  //     0, 30, 150, 
  //     30, 0, 100, 
  //     0, 30, 30, 
      
  //     30, 30, 100, 
  //     0, 100, 30, 
  //     30, 60, 67, 
      
  //     60, 30, 90, 
  //     30, 90, 67, 
  //     60, 67, 90
  //   ]), 
  //   gl.STATIC_DRAW);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    60, 30, 90, 
    30, 90, 67, 
    60, 67, 90]), gl.STATIC_DRAW);
}
