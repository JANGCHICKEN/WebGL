function start() {
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById('c');

  /** @type {WebGLRenderingContext} */
  var gl = canvas.getContext('webgl');
  if (!gl) {
    alert('webgl 없음');
  }

  var vertexShaderSource = document.querySelector('#vertex-shader-2d').textContent;
  var fragmentShaderSource = document.querySelector('#fragment-shader-2d').textContent;

  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  var program = createProgram(gl, vertexShader, fragmentShader);

  var positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

  var resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');

  var positonBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positonBuffer);

  // var positions = [0, 0, 0, 0.5, 0.7, 0];
  var positions = [10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // 캔버스 지우기
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // program(shader 쌍) 사용 지시
  gl.useProgram(program);

  gl.enableVertexAttribArray(positionAttributeLocation);

  // position buffer 할당
  gl.bindBuffer(gl.ARRAY_BUFFER, positonBuffer);

  // positionBuffer(ARRAY_BUFFER)의 데이터를 꺼내오는 방법을 attribute에 지시
  var size = 2; // 반복마다 2개의 컴포넌트
  var type = gl.FLOAT; // 데이터는 32bit 부동 수수점
  var normalize = false; // 데이터 정규화 안 함
  var stride = 0; // 0 = 다음 위치를 얻기 위해 반복마다 size * sizeOf(type) 만큼 앞으로 이동
  var offset = 0; // Buffer의 처음부터 시작
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

  // 해상도 설정
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  // 그리기
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  // var count = 3;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}
