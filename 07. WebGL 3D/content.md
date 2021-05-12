# WebGL

## WebGL 3D

#### depth buffer

Z-Buffer라고도 불리는 depth buffer는 *depth* pixel의 사각형인데, 각 color pixel에 대한 depth pixel은 이미지를 만드는데에 사용된다. WebGL은 각 color pixel을 그리기 때문에 depth pixel도 그릴 수 있다. 이건 z축에 대해 vertex shader에 반환한 값을 기반으로 한다. X, Y를 clip space 로 변환해야 했던 것처럼 Z도 clip space(-1~+1)에 있다. 해당 값은 depth space 값(0~+1)으로 변환된다. WebGL은 color pixel을 그리기 전에 대응하는 depth pixel을 검사하는데 그릴 픽셀의 depth 값이 대응하는 depth pixel 값보다 클 경우 WebGL은 새로운 color pixel을 그리지 않는다. 아니면 fragment shader의 색상으로 새로운 color pixel을 모두 그리고 새로운 depth 값으로 depth pixel을 그린다. 이는 다른 픽셀 뒤에 있는 픽셀은 그리지 않는다는 걸 의미한다