# WebGL

## WebGL이란

플러그인을 사용하지 않고 OpenGL ES 2.0 기반 API를 이용하여 브라우저의 HTML *canvas*에 렌더링하여 3D 웹 콘텐츠 제작을 가능하게 한다. WebGL 프로그램은 컴퓨터의 그래픽 처리 장치(GPU)에서 실행되는 자바스크립트나 특수 효과(셰이더 코드)코드로 구성된다. WebGL 요소들은 다른 HTML 요소들과 혼합될 수 있고 페이지나 페이지 배경의 다른 부분과 합성될 수 있다.

## Getting started with WebGL

### WebGL 컨텍스트 준비

```js
var gl; // A global variable for the WebGL context

function start() {
  var canvas = document.getElementById('glcanvas');

  gl = initWebGL(canvas); // Initialize the GL context

  // Only continue if WebGL is available and working

  if (gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set clear color to black, fully opaque
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the color as well as the depth buffer.
  }
}
```

### WebGL 컨텍스트 생성

```js
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
```

### WebGL 컨텍스트 크기 조정

캔버스 요소의 스타일 편집하면 출력되는 크기를 변경될 것이지만 렌더링 해상도는 변경되지 않는다. 또한 컨텍스트가 생성된 후 캔버스 요소의 width와 height 속성을 편집하면 그려지는 픽셀 수를 변경할 수 없다. WebGL 엔더의 해상도를 변경하려면 사용자가 캔버스 문저 전체 창 크기를 조정하거나 앱에서 그래픽 설정을 조정할 수 있게 하길 원한다. WebGL 컨텍스트 viewport() 함수가 변경할 수 있는 것으로 알려져 있다.

```js
gl.viewport(0, 0, canvas.width, canvas.height);
```