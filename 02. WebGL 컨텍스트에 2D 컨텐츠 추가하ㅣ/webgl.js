/**
 * 3D 렌더링 준비
 */

/* WebGL 컨텍스트 준비 */
/** @type {WebGLRenderingContext} */
var gl; // A global variable for the WebGL context

function start() {
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById('glcanvas');

  gl = initWebGL(canvas); // Initialize the GL context
  initShader();
  initBuffers();

  // Only continue if WebGL is available and working

  if (gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set clear color to black, fully opaque
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the color as well as the depth buffer.
  }
  drawScene();
}

/* WebGL 컨텍스트 생성 */
function initWebGL(canvas) {
  gl = null;

  try {
    // Try to grab the standard context. If it fails, fallback to experimental.
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  } catch (e) {}

  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
    gl = null;
  }

  return gl;
}

/**
 * 장면(scene)에 조명효과 추가하기
 */

/* 쉐이터 초기화 */
function initShader() {
  console.log('shader-fs');
  var fragmentShader = getShader(gl, 'shader-fs');
  console.log('shader-vs');
  var vertexShader = getShader(gl, 'shader-vs');

  // Create the shader program

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program.');
  }

  gl.useProgram(shaderProgram);

  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(vertexPositionAttribute);
}

/* DOM에서 쉐이더 불러오기 */
function getShader(gl, id) {
  var shaderScript, theSource, currentChild, shader;

  shaderScript = document.getElementById(id);

  console.log(shaderScript);

  if (!shaderScript) return null;

  theSource = '';
  currentChild = shaderScript.firstChild;

  while (currentChild) {
    console.log(currentChild);
    if (currentChild.nodeType == currentChild.TEXT_NODE) {
      theSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }

  console.log(theSource);

  if (shaderScript.type == 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    //Unknown shader type
    return null;
  }

  gl.shaderSource(shader, theSource);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occured compiling the shader: ' + gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

/**
 * 객체 생성
 */

var horizAspect = 480.0 / 640.0;

function initBuffers() {
  squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

  var verties = [1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verties), gl.STATIC_DRAW);
}

/**
 * 행렬 유틸리트를 이용한 연산
 */

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

/**
 * 장면(scene) 그리기
 */

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // perspectiveMatrix = makePerspective(45, 640.0 / 480.0, 0.1, 100.0);

  loadIdentity();
  mvTraslate([-0.0, 0.0, -6.0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  setMatrixUniForms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
