function start() {
  var image = new Image();
  image.src = './assets/cat.jpg';
  image.onload = function () {
    render(image);
  };
}

function render(image) {
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById('c');

  /** @type {WebGLRenderingContext} */
  var gl = canvas.getContext('webgl');
  if (!gl) {
    alert('webgl 없음');
  }

  var program = webglUtils.createProgramFromScripts(gl, ['vertex-shader-2d', 'fragment-shader-2d']);

  var positionLocation = gl.getAttribLocation(program, 'a_position');
  // Texture 좌표가 필요한 곳을 탐색
  var texcoordLocation = gl.getAttribLocation(program, 'a_texCoord');

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangle(gl, 0, 0, image.width, image.height);

  // 사각형의 texture 좌표 제공
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), gl.STATIC_DRAW);

  // Texture 생성
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 어떤 크기의 이미지도 렌더링할 수 있도록 매개변수 설정
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Texture에 이미지 업로드
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  var resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  var textureSizeLocation = gl.getUniformLocation(program, 'u_textureSize');
  var kernelLocation = gl.getUniformLocation(program, 'u_kernel[0]');
  var kernelWeightLocation = gl.getUniformLocation(program, 'u_kernelWeight');

  // Define several convolution kernels
  var kernels = {
    normal: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    gaussianBlur: [0.045, 0.122, 0.045, 0.122, 0.332, 0.122, 0.045, 0.122, 0.045],
    gaussianBlur2: [1, 2, 1, 2, 4, 2, 1, 2, 1],
    gaussianBlur3: [0, 1, 0, 1, 1, 1, 0, 1, 0],
    unsharpen: [-1, -1, -1, -1, 9, -1, -1, -1, -1],
    sharpness: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    sharpen: [-1, -1, -1, -1, 16, -1, -1, -1, -1],
    edgeDetect: [-0.125, -0.125, -0.125, -0.125, 1, -0.125, -0.125, -0.125, -0.125],
    edgeDetect2: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
    edgeDetect3: [-5, 0, 0, 0, 0, 0, 0, 0, 5],
    edgeDetect4: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
    edgeDetect5: [-1, -1, -1, 2, 2, 2, -1, -1, -1],
    edgeDetect6: [-5, -5, -5, -5, 39, -5, -5, -5, -5],
    sobelHorizontal: [1, 2, 1, 0, 0, 0, -1, -2, -1],
    sobelVertical: [1, 0, -1, 2, 0, -2, 1, 0, -1],
    previtHorizontal: [1, 1, 1, 0, 0, 0, -1, -1, -1],
    previtVertical: [1, 0, -1, 1, 0, -1, 1, 0, -1],
    boxBlur: [0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111],
    triangleBlur: [0.0625, 0.125, 0.0625, 0.125, 0.25, 0.125, 0.0625, 0.125, 0.0625],
    emboss: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
  };
  var initialSelection = 'edgeDetect2';

  var ui = document.querySelector('#ui');
  var select = document.createElement('select');
  for (var name in kernels) {
    var option = document.createElement('option');
    option.value = name;
    if (name === initialSelection) {
      option.selected = true;
    }
    option.appendChild(document.createTextNode(name));
    select.appendChild(option);
  }
  select.onchange = function (event) {
    drawWithKernel(this.options[this.selectedIndex].value);
  };
  ui.appendChild(select);
  drawWithKernel(initialSelection);

  function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]), gl.STATIC_DRAW);
  }

  function computeKernelWeight(kernel) {
    var weight = kernel.reduce(function (prev, curr) {
      return prev + curr;
    });
    return weight <= 0 ? 1 : weight;
  }

  function drawWithKernel(name) {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
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

    gl.enableVertexAttribArray(texcoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);

    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(textureSizeLocation, image.width, image.height);
    gl.uniform1fv(kernelLocation, kernels[name]);
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernels[name]));

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }
}

// This is needed if the images are not on the same domain
// NOTE: The server providing the images must give CORS permissions
// in order to be able to use the image with WebGL. Most sites
// do NOT give permission.
// See: https://webglfundamentals.org/webgl/lessons/webgl-cors-permission.html
function requestCORSIfNotSameOrigin(img, url) {
  if (new URL(url, window.location.href).origin !== window.location.origin) {
    img.crossOrigin = '';
  }
}
