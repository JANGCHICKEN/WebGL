function start() {
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById('c');

  /** @type {WebGLRenderingContext} */
  var gl = canvas.getContext('webgl');
  if (!gl) {
    alert('webgl 없음');
  }

  // set up GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ['vertex-shader-2d', 'fragment-shader-2d']);

  // look up where the vertex data needs to go.
  var positionAttriuteLocation = gl.getAttribLocation(program, 'a_position');

  // look up uniform locations
  var resoultionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
  var colorUniformLocation = gl.getUniformLocation(program, 'u_color');

  // Create a buffer to put three 2d clip space points in
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // 캔버스 지우기
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // program(pair of shader) 사용 지시
  gl.useProgram(program);

  // attribute 활성화
  gl.enableVertexAttribArray(positionAttriuteLocation);

  // position buffer 할당
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // positionBuffer(ARRAY_BUFFER)의 데이터를 꺼내오는 방법을 attribute에 지시
  var size = 2; // 반복마다 2개의 컴포넌트
  var type = gl.FLOAT; // 데이터는 32bit 부동 소수점
  var normalize = false; // 데이터 정규화 안 함
  var stride = 0; // 0 = 다음 위치를 얻기 위해 반복마다 size * sizeof(type) 만큼 앞으로 이동
  var offset = 0; // Buffer의 처음부터 시작
  gl.vertexAttribPointer(positionAttriuteLocation, size, type, normalize, stride, offset);

  // 해상도 설정
  gl.uniform2f(resoultionUniformLocation, gl.canvas.width, gl.canvas.height);

  // 임의의 색상으로 임의의 사각형 50개 그리기
  for (var ii = 0; ii < 50; ++ii) {
    // 임의의 사각형 설정
    // ARRAY_BUFFER bind point에 마지막으로 바인딩한 것이기 때문에 positionBuffer에 작성됨
    setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));

    // 임의의 색상 설정
    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

    // 사각형 그리기 : 삼각형 두개를 합쳐서 그리기
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }
}

// 0부터 -1사이 임의의 정수 반환
function randomInt(range) {
  return Math.floor(Math.random() * range);
}

// 사각형을 정의한 값들로 buffer 채우기
function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;

  // 참고: gl.bufferData(gl.ARRAY_BUFFER, ...)는 `ARRAY_BUFFER` bind point에 바인딩된 buffer에 영향을 주지만 지금까지는 하나의 buffer만 있었습니다. 두 개 이상이라면 원하는 buffer를 `ARRAY_BUFFER`에 먼저 할당해야 합니다.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]), gl.STATIC_DRAW);
}
