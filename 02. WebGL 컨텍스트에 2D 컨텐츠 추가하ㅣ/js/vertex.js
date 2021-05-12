/**
 * 정점 쉐이더
 */

attribute vec3 avertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMartix;

void main(void) {
  gl_Positoin = uPMartix * uMVMatrix * vec4(avertexPosition, 1.0)
}