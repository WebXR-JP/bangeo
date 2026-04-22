/**
 * WebXR 拡張型定義
 *
 * @types/webxr に含まれていない型のみ補完する。
 * XRMesh, XRPlane, XRMeshSet, XRPlaneSet, XRFrame.detectedMeshes/detectedPlanes は
 * @types/webxr (v0.5.x) に含まれているため、ここでは宣言しない。
 */

// GamepadHapticActuator.pulse は DOM 型に未定義のため補完
interface GamepadHapticActuator {
	pulse(value: number, duration: number): Promise<boolean>;
}
