function start() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector('#canvas');
  /** @type {WebGLRenderingContext} */
  var gl = canvas.getContext('webgl');
  if (!gl) {
    return;
  }

  var program = webglUtils.createProgramFromScripts(gl, ['vertex-shader-3d', 'fragment-shader-3d']);

  // lookup
  var positionLocation = gl.getAttribLocation(program, 'a_position');
  var colorLocation = gl.getAttribLocation(program, 'a_color');

  var matrixLocation = gl.getUniformLocation(program, 'u_matrix');

  // buffer
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);

  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  setColors(gl);

  function radToDeg(r) {
    return (r * 180) / Math.PI;
  }

  function degToRad(d) {
    return (d * Math.PI) / 180;
  }

  var cameraAngleRadians = degToRad(0);
  var fieldOfViewRadians = degToRad(45);

  drawScene();

  webglLessonsUI.setupSlider('#cameraAngle', { value: radToDeg(cameraAngleRadians), slide: updateCameraAngle, min: -360, max: 360 });
  function updateCameraAngle(event, ui) {
    cameraAngleRadians = degToRad(ui.value);
    drawScene();
  }

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var size = 3;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    var size = 3;
    var type = gl.UNSIGNED_BYTE;
    var normalize = true;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);

    // 투영 행렬 계산
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 1;
    var zFar = 2000;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    var numFs = 5;
    var radius = 200;

    // 첫 번째 F의 위치 계산
    var fPosition = [radius, 0, 0];

    // 카메라 대한 행렬 계산
    // 원에서 카메라가 있는 위치를 계산하는 행렬 수학 사용
    var cameraMatrix = m4.yRotation(cameraAngleRadians);
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 1.5);

    // 계산한 행렬에서 카메라의 위치 얻기
    var cameraPosition = [
      cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]
    ]

    var up = [0, 1, 0];

    // lookAt을 사용하여 카메라의 행렬 계산
    var cameraMatrix = m4.lookAt(cameraPosition, fPosition, up)

    // 카메라 행렬에서 view 행렬 만들기
    var viewMatrix = m4.inverse(cameraMatrix);

    // View 투영 행렬 계산
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    for (var ii = 0; ii < numFs; ++ii) {
      var angle = (ii * Math.PI * 2) / numFs;
      var x = Math.cos(angle) * radius;
      var y = Math.sin(angle) * radius;

      // View 투영 행렬로 시작하여 F에 대한 행렬 계산
      var matrix = m4.translate(viewProjectionMatrix, x, 0, y);

      // 행렬 설정
      gl.uniformMatrix4fv(matrixLocation, false, matrix);

      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 16 * 6;
      gl.drawArrays(primitiveType, offset, count);
    }
  }
}
