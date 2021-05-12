# WebGL

## WebGL 컨텍스트에 2D 컨텐츠 추가하기

### 장면(scene)에 조명효과 추가하기

예제에서 오직 2차원 객체만 랜더링 하더라도 3D 공간에서 그리고 있다는 것이다.

### 쉐이더 초기화

쉐이더를 직접 새로 만드는 것이 아니라 HTML 문서에서 쉐이더를 '찾아오는' 자바스크립트 코드

```js
function initShaders() {
  var fragmentShader = getShader(gl, 'shader-fs');
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
```

이 방식을 통해 로딩되는 쉐이더는 두가지가 있다.

#### 조각 쉐이더(fragment shader)

"shader-fs"라는 ID를 가진 script 엘리먼트에서 불러온다.

### 정점 쉐이더(vertex shader)

"shader-vs"라는 ID를 가진 script 엘리먼트에서 불러온다.

해당 과정은 쉐이더 프로그램을 DOM에서 가져오는 것이다.

## DOM에서 쉐이더 불러오기

getShader()함수는 DOM에서 지정된 이름을 가진 쉐이더 프로그램을 가져와 컴파일된 쉐이더 프로그램을 호출자로 반환한다. 컴파일니ㅏ 불러올 수 엇ㅂ는 경우에는 null을 반환한다.

```js
function getShader(gl, id) {
  var shaderScript, theSource, currentChild, shader;

  shaderScript = document.getElementById(id);

  if (!shaderScript) {
    return null;
  }

  theSource = "";
  currentChild = shaderScript.firstChild;

  while(currentChild) {
    if (currentChild.nodeType == currentChild.TEXT_NODE) {
      theSource += currentChild.textContent;
    }

    currentChild = currentChild.nextSibling;
  }
```

특정 ID를 가진 엘리먼트를 찾으면 텍스트 컨텐츠가 **theSource 변수에 저장됩니다.**

```js
if (shaderScript.type == 'x-shader/x-fragment') {
  shader = gl.createShader(gl.FRAGMENT_SHADER);
} else if (shaderScript.type == 'x-shader/x-vertex') {
  shader = gl.createShader(gl.VERTEX_SHADER);
} else {
  // Unknown shader type
  return null;
}
```

쉐이더를 위한 코드를 읽혀지면 쉐이더가 정점 쉐이더(MIME type "x-shader/x-vertex")인지 조각 쉐이더 (MIME type "x-shader/x-fragment")인지 결정하기 위해 쉐이더 객체의 MIME 형식을 살펴본다. 그 다음 소스코드에서 얻어진 것을 가지고 적절한 타입의 쉐이더를 생성한다.

```js
 gl.shaderSource(shader, theSource);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
      return null;
  }

  return shader;
}
```

마지막으로 소스는 쉐이더로 전달되고 컴파일된다. 만약 쉐이더가 컴파일하는 동안 에러가 발생하면 경고 메세지를 출력하고 null을 반환한다. 그러지 않으면 새롭게 컴파일도니 쉐이더가 호출자로 반환된다.
