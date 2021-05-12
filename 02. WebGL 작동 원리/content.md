# WebGL

## WebGL 작동 원리

GPU에서 기본적으로 2가지 부분이 있는데, 첫번째는 정점(또는 데이터 스트림)을 clip space의 정점으로 처리한다. 두번째는 첫번째를 기반으로 픽셀을 그린다.

![image](./assets/vertex-shader-anim.gif)

왼쪽은 당신이 제공한 데이터이다. Vertex shader는 GLSL로 작성하는 함수인데 각 정점마다 한 번씩 호출된다. 몇 가지 계산을 하고 현재 정점의 clip space 값으로 특수 변수 **gl_Positon**을 설명한다. GPU는 이 값을 가져와서 내부에 저장한다.

**TRIANGLES**를 그린다고 가정하면, 첫 번째에서 정점 3개를 생성할 때마다 GPU는 이걸 이용해 삼각형을 만든다. 어떤 픽셀이 삭각형의 점 3개에 해당하는 확인한 다음, 삼각형을 래스터화(="픽셀로 그리기")하는데 각 픽셀마다 fragment shader를 호출해서 어떤 색상으로 만들지 묻는다. Fragment shader는 특수 변수 **gl_FragColor**를 해당 픽셀에 원하는 색삭으로 설정한다.

Vertex shader에서 fragment shader로 전달하려는 각 값에 대해 "varying"을 정의하는거다.

WebGL은 vertex shader의 varying을 이름과 type이 같은 fragment shader의 varying으로 연결할 것이다.

우리는 정점 3개만을 계산했습니다. Vertex shader는 3번만 호출되므로 3개의 색상만을 계산하지만 삼각형은 여러 색상입니다. 이게 varying이라고 불리는 이유죠.

WebGL은 각 정점을 계산한 3개의 값을 가져오고 삼각형을 래스터화할 때 계산된 정점들 사이를 보간하는데요. 각 픽셀마다 해당 픽셀에 대해 보간된 값으로 fragment shader를 호출합니다.

위 예제에서는 3개의 정점으로 시작합니다.

| 정점 |      |
| ---- | ---- |
| 0    | -100 |
| 150  | 125  |
| -175 | 100  |

Vertex shader는 translation, rotation, scale에 행렬을 적용하고 clip space로 변환합니다. translation, rotation, scale의 기본값은 translation = 200, 150, rotation = 0, scale = 1,1이므로 실제로는 이동만 하는데요. 400x300인 backbuffer가 주어지면 vertex shader는 행렬을 적용한 뒤 다음과 같은 3개의 clip space 정점을 계산합니다.

| gl_Position에 작성된 값들 |        |
| ------------------------- | ------ |
| 0.000                     | 0.660  |
| 0.750                     | -0.830 |
| -0.875                    | -0.660 |

또한 이걸 color space로 변환하고 우리가 선언한 varying v_color에 작성합니다.

| v_color에 작성된 값들 |       |     |
| --------------------- | ----- | --- |
| 0.5000                | 0.830 | 0.5 |
| 0.8750                | 0.086 | 0.5 |
| 0.0625                | 0.170 | 0.5 |

v_color에 작성된 3개의 값들은 보간되어 각 픽셀에 대한 fragment shader로 전달됩니다.

또한 더 많은 데이터를 vertex shader에 전달해서 fragment shader에 전달할 수 있습니다. 예를 들어 2가지 색상을 가진 삼각형 2개로 이루어진 사각형을 그린다고 해봅시다. 이를 위해 vertex shader에 또다른 attribute를 추가하면, 더 많은 데이터를 전달할 수 있고, 그 데이터를 fragment shader에 직접 전달할 수 있습니다.

## Buffer와 Attribute 명령은 어떤 일을 하나요?

Buffer는 정점과 각 정점의 다른 데이터를 GPU로 가져오는 방법  
**gl.createBuffer**는 buffer를 생성한다. **gl.bindBuffer**는 해당 buffer를 작업할 buffer로 설정한다. **gl.bufferData**는 데이터를 buffer로 복사한다. 이건 보통 초기화할 때 수행된다.

Buffer에 데이터가 있으면 어떻게 데이터를 가져오고 vertex shader의 attribute에 제공할지 WebGL에 알려줘야 한다.

```js
// 정점 데이터가 어디로 가야하는지 탐색
var positionLocation = gl.getAttribLocation(program, "a_position");
var colorLocation = gl.getAttribLocation(program, "a_color");
```

이것도 보통 초기화할 때 수행된다.

Attribute의 위치를 알게 되면 그리기 전에 3가지 명령어를 실행해야 한다.

```js
// buffer에서 데이터를 공급하기 원한다고 WebGL에게 알림
gl.enableVertexAttribArray(location);
```
```js
// ARRAY_BUFFER bind point에 buffer를 할당한다. 이건 WebGL 내부에 있는 전역 변수이다.
gl.bindBuffer(gl.ARRAY_BUFFER, someBuffer);
```

```js
// 현재 ARRAY_BUFFER bind point에 바인딩된 buffer에서 데이터를 가져오기 위해 어떻게 할 것인지 WebG에 알림
gl.vertexAttribPointer(
  location,
  numComponents,
  typeOfData,
  normalizeFlag,
  strideToNextPieceOfData,
  offsetIntoBuffer
);
```

- numComponents : 정점마다 얼마나 많은 컴포넌트(1~4)가 있는지
- typeOfData : data type(**BYTE**, **FLOAT**, **INT**, **UNSIGNED_SHORT**, 등등)이 무엇인지
- normalizeFlag : 데이터 정규화 할 것인지
   - 부동 소수점이 아닌 모든 type을 위한 것
   - false = 해당 값의 type으로 해석
   - true = BYTE(-128 ~ 127) 값은 -1.0에서 +1.0사이로 나타내고, UNSIGNED_BYTE(0 ~ 255)는 0.0에서 +1.0사이가 된다. Normalized SHORT도 -1.0에서 +1.0사이가 되며 BYTE보다 더 높은 해상도를 가진다.
   - 정규화된 데이터의 가장 일반적인 용도는 색상
- strideToNextPieceOfData : 한 데이터에서 다음 데이터를 가져오기 위해 몇 byte를 건너뛰어야 하는지
   - 0 = type 크기에 맞는 stride 사용
- offsetIntoBuffer : buffer에서 데이터가 얼마나 멀리 있는지
   - 0 = buffer의 처음부터 시작

