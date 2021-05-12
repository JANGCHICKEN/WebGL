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
  var texcoordLocation = gl.getAttribLocation(program, 'a_texCoord');

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangle(gl, 0, 0, image.width, image.height);

  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), gl.STATIC_DRAW);

  function createAndSetupTexture(gl) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Texture를 설정하여 어떤 크기의 이미지도 랜더링할 수 있도록 하고 픽셀로 작업한다.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
  }

  // Texture를 만들고 이미지를 넣는다.
  var originalImageTexture = createAndSetupTexture(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // Texture 2개 만들고 framebuffer에 첨부한다.
  var textures = [];
  var framebuffers = [];
  for (var ii = 0; ii < 2; ++ii) {
    var texture = createAndSetupTexture(gl);
    textures.push(texture);

    // 이미지와 같은 크기로 texture 만들기
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // Framebuffer 설정
    var fbo = gl.createFramebuffer();
    framebuffers.push(fbo);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    // Texture 첨부
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  }

  // lookup uniform
  var resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  var textureSizeLocation = gl.getUniformLocation(program, 'u_textureSize');
  var kernelLocation = gl.getUniformLocation(program, 'u_kernel[0]');
  var kernelWeightLocation = gl.getUniformLocation(program, 'u_kernelWeight');
  var filpYLocation = gl.getUniformLocation(program, 'u_flipY');

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

  var effects = [
    { name: 'gaussianBlur3', on: true },
    { name: 'gaussianBlur3', on: true },
    { name: 'gaussianBlur3', on: true },
    { name: 'sharpness' },
    { name: 'sharpness' },
    { name: 'sharpness' },
    { name: 'sharpen' },
    { name: 'sharpen' },
    { name: 'sharpen' },
    { name: 'unsharpen' },
    { name: 'unsharpen' },
    { name: 'unsharpen' },
    { name: 'emboss', on: true },
    { name: 'edgeDetect' },
    { name: 'edgeDetect' },
    { name: 'edgeDetect3' },
    { name: 'edgeDetect3' },
  ];

  // Setup a ui.
  var ui = document.querySelector('#ui');
  var table = document.createElement('table');
  var tbody = document.createElement('tbody');
  for (var ii = 0; ii < effects.length; ++ii) {
    var effect = effects[ii];
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    var chk = document.createElement('input');
    chk.value = effect.name;
    chk.type = 'checkbox';
    if (effect.on) {
      chk.checked = 'true';
    }
    chk.onchange = drawEffects;
    td.appendChild(chk);
    td.appendChild(document.createTextNode('≡ ' + effect.name));
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  ui.appendChild(table);
  $(table).tableDnD({ onDrop: drawEffects });

  drawEffects();

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

  function drawEffects(name) {
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

    gl.uniform2f(textureSizeLocation, image.width, image.height);

    // 원본 이미지로 시작
    gl.bindTexture(gl.TEXTURE_2D, originalImageTexture);

    // Texture에 그리는 동안 이미지 y축 뒤집지 않기
    gl.uniform1f(filpYLocation, 1);

    // 적용하고 싶은 각 효과를 반복한다.
    var count = 0;
    for (var ii = 0; ii < tbody.rows.length; ++ii) {
      var checkbox = tbody.rows[ii].firstChild.firstChild;
      if (checkbox.checked) {
        // Framebuffer 중 하나에 그리기 위해 설정한다.
        setFramebuffer(framebuffers[count % 2], image.width, image.height);

        drawWithKernel(checkbox.value);

        // 다음 그리기를 위해 방금 랜더링한 texture를 사용한다.
        gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);
        ++count;
      }
    }

    // 마지막으로 결과를 캔버스에 그린다.
    gl.uniform1f(filpYLocation, -1); // 캔버스 y축 뒤집기 필요
    setFramebuffer(null, gl.canvas.width, gl.canvas.height);
    drawWithKernel('normal');

    function setFramebuffer(fbo, width, height) {
      // 이걸 랜더링할 framebuffer로 만든다.
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

      // Framebuffer의 해상도를 shader에 알려준다.
      gl.uniform2f(resolutionLocation, width, height);

      // WebGL에 framebuffer에 필요한 viewport 설정을 알려준다.
      gl.viewport(0, 0, width, height);
    }

    function drawWithKernel(name) {
      // kernel 설정
      gl.uniform1fv(kernelLocation, kernels[name]);
      gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernels[name]));

      // 사각형 그리기
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }
}
