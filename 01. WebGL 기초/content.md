# WebGL

[URL](https://webglfundamentals.org/webgl/lessons/ko/)

## WebGL 기초

WebGL은 GPU에서 실행되므로 해당 코드를 제공해야하는데 함수 쌍 형태여야 한다. 이 두 함수는 vertex shader와 fragment shader로 type을 가진 GLSL로 작성되어 있다. 이 두개를 합쳐 *program*이라고 한다.

- vertext shader : 정점 위치 계산
- fragment shader : 색상 계산

대부분의 WebGL API는 이러한 함수 쌍을 실행하가 위한 상태 설정에 관한 것이다. 원하는 것을 그리기 위해선 여러 상태를 설정하고 GPU에서 shader를 실행하는 **gl.drawArrays**나 **gl.drawElements**를 호출해서 함수 쌍을 실행해야 한다.

이런 함수가 접근하기 원하는 모든 데이터는 GPU에 제공되어야 하는데 Shader가 데이터를 받을 수 있는 방법에는 4가지가 있다.

1. Attribute & Buffer

   - Buffer : GPU에서 업로드 하는 2진 데이터 배열
   - Attribute : buffer에서 데이터를 가져오고 vertex shader에 제공하느 방법을 지정하는데 사용

   Buffer는 무작위로 접근할 수 없다. 대신에 vertex shader가 지정한 횟수만큼 실행되는데 실행될 때마다 지정된 buffer에서 다음 값을 가져와 attribute에 할당된다.

2. Uniform

   shader program을 실행하기 전에 설정하는 사실상 전역 변수

3. Texture

   shader program에서 무작위로 접근할 수 있는 데이터 배열

4. Varying

   vertex shader가 fragment shader에 데이터를 넘기는 방법

## WebGL Hellow World

WebGL은 clip space의 좌표와 색상 두 가지만을 다루는데 이를 위해선 2개의 "shader"를 제공해야 한다. Clip space 좌표를 제공한 vertex shader, 색상을 제공하는 fragment shader이다.

Clip space 좌표는 캔버스 크기에 상관 없이 항상 -1에서 +1까지이다.

![image](./assets/clipspace.svg)

### vertex shader

```js
// Attribute는 buffer에서 데이터를 받음
attribute vec4 a_position;

// 모든 shader는 main 함수를 가짐
void main() {

  // gl_Position은 vertex shader가 설정을 담당하는 특수 변수
  gl_Position = a_position;
}
```

### fragment shader

```js
// Fragment shader는 기본 정밀도를 가지고 있지 않으므로 하나를 선택해야 합니다.
// mediump은 좋은 기본값으로 "중간 정밀도"를 의미합니다.
precision mediump float;

void main() {
  // gl_FragColor는 fragment shader가 설정을 담당하는 특수 변수
  gl_FragColor = vec4(1, 0, 0.5, 1); // 붉은 보라색 반환
}
```

### WebGLRenderingContext 생성

```html
<canvas id="c"></canvas>
```

```js
 var canvas = document.querySelector("#c");

  var gl = canvas.getContext("webgl");
 if (!gl) {
   // webgl이 없어요!
   ...
 }
```

### shader 및 program 생성

shader를 컴파일해서 GPU에 할당해야 하는데 먼저 문자열로 가져와야 한다.

script 태그 안에 넣은 경우

```html
<script id="vertex-shader-2d" type="notjs">

  // attribute는 buffer에서 데이터를 받음
  attribute vec4 a_position;

  // 모든 shader는 main 함수를 가짐
  void main() {

    // gl_Position은 vertex shader가 설정을 담당하는 특수 변수
    gl_Position = a_position;
  }
</script>

<script id="fragment-shader-2d" type="notjs">

  // Fragment shader는 기본 정밀도를 가지고 있지 않으므로 하나를 선택해야 합니다.
  // mediump은 좋은 기본값으로 "중간 정밀도"를 의미합니다.
  precision mediump float;

  void main() {
    // gl_FragColor는 fragment shader가 설정을 담당하는 특수 변수
    gl_FragColor = vec4(1, 0, 0.5, 1); // 붉은 보라색 반환
  }
</script>
```

shader를 만들고 GLSL을 업로드하고 shader를 컴파일할 함수가 필요

```js
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
```

두 shader를 만드는 함수 호출

```js
var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;
 
var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
```

두 shader를 *program*으로 *link*해야 한다.

```js
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

...
// in main()
var program = createProgram(gl, vertexShader, fragmentShader);
```

### 데이터 제공


