const JOINTS = [
  "hips",
  "spine-lower",
  "spine-middle",
  "spine-upper",
  "chest",
  "neck",
  "head",
  "left-shoulder",
  "left-scapula",
  "left-arm-upper",
  "left-arm-lower",
  "left-hand-wrist-twist",
  "right-shoulder",
  "right-scapula",
  "right-arm-upper",
  "right-arm-lower",
  "right-hand-wrist-twist",
  "left-hand-palm",
  "left-hand-wrist",
  "left-hand-thumb-metacarpal",
  "left-hand-thumb-phalanx-proximal",
  "left-hand-thumb-phalanx-distal",
  "left-hand-thumb-tip",
  "left-hand-index-metacarpal",
  "left-hand-index-phalanx-proximal",
  "left-hand-index-phalanx-intermediate",
  "left-hand-index-phalanx-distal",
  "left-hand-index-tip",
  "left-hand-middle-phalanx-metacarpal",
  "left-hand-middle-phalanx-proximal",
  "left-hand-middle-phalanx-intermediate",
  "left-hand-middle-phalanx-distal",
  "left-hand-middle-tip",
  "left-hand-ring-metacarpal",
  "left-hand-ring-phalanx-proximal",
  "left-hand-ring-phalanx-intermediate",
  "left-hand-ring-phalanx-distal",
  "left-hand-ring-tip",
  "left-hand-little-metacarpal",
  "left-hand-little-phalanx-proximal",
  "left-hand-little-phalanx-intermediate",
  "left-hand-little-phalanx-distal",
  "left-hand-little-tip",
  "right-hand-palm",
  "right-hand-wrist",
  "right-hand-thumb-metacarpal",
  "right-hand-thumb-phalanx-proximal",
  "right-hand-thumb-phalanx-distal",
  "right-hand-thumb-tip",
  "right-hand-index-metacarpal",
  "right-hand-index-phalanx-proximal",
  "right-hand-index-phalanx-intermediate",
  "right-hand-index-phalanx-distal",
  "right-hand-index-tip",
  "right-hand-middle-metacarpal",
  "right-hand-middle-phalanx-proximal",
  "right-hand-middle-phalanx-intermediate",
  "right-hand-middle-phalanx-distal",
  "right-hand-middle-tip",
  "right-hand-ring-metacarpal",
  "right-hand-ring-phalanx-proximal",
  "right-hand-ring-phalanx-intermediate",
  "right-hand-ring-phalanx-distal",
  "right-hand-ring-tip",
  "right-hand-little-metacarpal",
  "right-hand-little-phalanx-proximal",
  "right-hand-little-phalanx-intermediate",
  "right-hand-little-phalanx-distal",
  "right-hand-little-tip",
  "left-upper-leg",
  "left-lower-leg",
  "left-foot-ankle-twist",
  "left-foot-ankle",
  "left-foot-subtalar",
  "left-foot-transverse",
  "left-foot-ball",
  "right-upper-leg",
  "right-lower-leg",
  "right-foot-ankle-twist",
  "right-foot-ankle",
  "right-foot-subtalar",
  "right-foot-transverse",
  "right-foot-ball",
];

const BONES = [
  ["hips", "spine-lower"],
  ["spine-lower", "spine-middle"],
  ["spine-middle", "spine-upper"],
  ["spine-upper", "chest"],
  ["chest", "neck"],
  ["neck", "head"],
  ["chest", "left-shoulder"],
  ["left-shoulder", "left-arm-upper"],
  ["left-arm-upper", "left-arm-lower"],
  ["left-arm-lower", "left-hand-wrist"],
  ["left-hand-wrist", "left-hand-palm"],
  ["chest", "right-shoulder"],
  ["right-shoulder", "right-arm-upper"],
  ["right-arm-upper", "right-arm-lower"],
  ["right-arm-lower", "right-hand-wrist"],
  ["right-hand-wrist", "right-hand-palm"],
  ["hips", "left-upper-leg"],
  ["left-upper-leg", "left-lower-leg"],
  ["left-lower-leg", "left-foot-ankle"],
  ["left-foot-ankle", "left-foot-ball"],
  ["hips", "right-upper-leg"],
  ["right-upper-leg", "right-lower-leg"],
  ["right-lower-leg", "right-foot-ankle"],
  ["right-foot-ankle", "right-foot-ball"],
];

for (const side of ["left", "right"]) {
  const hand = `${side}-hand`;
  BONES.push(
    [`${hand}-palm`, `${hand}-thumb-metacarpal`],
    [`${hand}-thumb-metacarpal`, `${hand}-thumb-phalanx-proximal`],
    [`${hand}-thumb-phalanx-proximal`, `${hand}-thumb-phalanx-distal`],
    [`${hand}-thumb-phalanx-distal`, `${hand}-thumb-tip`],
  );

  for (const finger of ["index", "ring", "little"]) {
    BONES.push(
      [`${hand}-palm`, `${hand}-${finger}-metacarpal`],
      [`${hand}-${finger}-metacarpal`, `${hand}-${finger}-phalanx-proximal`],
      [`${hand}-${finger}-phalanx-proximal`, `${hand}-${finger}-phalanx-intermediate`],
      [`${hand}-${finger}-phalanx-intermediate`, `${hand}-${finger}-phalanx-distal`],
      [`${hand}-${finger}-phalanx-distal`, `${hand}-${finger}-tip`],
    );
  }

  const middleMetacarpal =
    side === "left" ? `${hand}-middle-phalanx-metacarpal` : `${hand}-middle-metacarpal`;

  BONES.push(
    [`${hand}-palm`, middleMetacarpal],
    [middleMetacarpal, `${hand}-middle-phalanx-proximal`],
    [`${hand}-middle-phalanx-proximal`, `${hand}-middle-phalanx-intermediate`],
    [`${hand}-middle-phalanx-intermediate`, `${hand}-middle-phalanx-distal`],
    [`${hand}-middle-phalanx-distal`, `${hand}-middle-tip`],
  );
}

const canvas = document.querySelector("#xr-canvas");
const logEl = document.querySelector("#log");
const modeEl = document.querySelector("#mode");
const checkButton = document.querySelector("#check");
const startButton = document.querySelector("#start");
const endButton = document.querySelector("#end");

const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
let xrSession = null;
let referenceSpace = null;
let program = null;
let positionBuffer = null;
let matrixLocation = null;
let colorLocation = null;
let pointSizeLocation = null;
let lastHudUpdate = 0;
let frameCount = 0;
let lastTrackedCount = 0;
let lastBodySize = 0;

if (!gl) {
  writeLog("WebGL が使えません。");
} else {
  setupGL();
  drawPreview();
  window.addEventListener("resize", drawPreview);
}

checkButton.addEventListener("click", checkSupport);
startButton.addEventListener("click", startXR);
endButton.addEventListener("click", () => xrSession?.end());

async function checkSupport() {
  if (!navigator.xr) {
    writeLog("navigator.xr がありません。HTTPS か localhost で開いてください。");
    return;
  }

  const modes = ["immersive-vr", "immersive-ar"];
  const results = [];
  for (const mode of modes) {
    const supported = await navigator.xr.isSessionSupported(mode);
    results.push(`${mode}: ${supported ? "supported" : "not supported"}`);
  }

  writeLog(`${results.join("\n")}\n\nbody-tracking feature は requestSession 時に判定されます。`);
}

async function startXR() {
  if (!navigator.xr) {
    writeLog("navigator.xr がありません。HTTPS で配信して WebXR 対応ブラウザから開いてください。");
    return;
  }

  const mode = modeEl.value;
  const supported = await navigator.xr.isSessionSupported(mode);
  if (!supported) {
    writeLog(`${mode} はこの環境でサポートされていません。`);
    return;
  }

  try {
    await gl.makeXRCompatible();
    xrSession = await navigator.xr.requestSession(mode, {
      requiredFeatures: ["local-floor", "body-tracking"],
      optionalFeatures: ["hand-tracking"],
    });

    xrSession.addEventListener("end", onSessionEnded);
    xrSession.updateRenderState({ baseLayer: new XRWebGLLayer(xrSession, gl) });
    referenceSpace = await xrSession.requestReferenceSpace("local-floor");

    startButton.disabled = true;
    endButton.disabled = false;
    writeLog("XR session started. 体を動かすとスケルトンが更新されます。");
    xrSession.requestAnimationFrame(onXRFrame);
  } catch (error) {
    writeLog(`XR開始に失敗しました。\n${error.name}: ${error.message}`);
    xrSession = null;
  }
}

function onSessionEnded() {
  xrSession = null;
  referenceSpace = null;
  startButton.disabled = false;
  endButton.disabled = true;
  writeLog("XR session ended.");
  drawPreview();
}

function onXRFrame(time, frame) {
  const session = frame.session;
  session.requestAnimationFrame(onXRFrame);

  const viewerPose = frame.getViewerPose(referenceSpace);
  if (!viewerPose) {
    return;
  }

  const bodyPoints = readBodyPoints(frame);
  const linePositions = makeLinePositions(bodyPoints);
  const pointPositions = [...bodyPoints.values()].flatMap((point) => point);

  const layer = session.renderState.baseLayer;
  gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.02, 0.03, 0.06, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (const view of viewerPose.views) {
    const viewport = layer.getViewport(view);
    gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
    const viewProjection = multiplyMatrices(view.projectionMatrix, view.transform.inverse.matrix);

    drawArray(gl.LINES, makeGridPositions(), viewProjection, [0.18, 0.28, 0.42, 1], 1);
    drawArray(gl.LINES, linePositions, viewProjection, [0.3, 1.0, 0.62, 1], 1);
    drawArray(gl.POINTS, pointPositions, viewProjection, [1.0, 1.0, 1.0, 1], 7);
  }

  updateHud(time, frame.body);
}

function readBodyPoints(frame) {
  const points = new Map();
  const body = frame.body;
  lastBodySize = body?.size ?? 0;

  if (!body) {
    lastTrackedCount = 0;
    return points;
  }

  for (const jointName of JOINTS) {
    const bodySpace = body.get(jointName);
    if (!bodySpace) {
      continue;
    }

    const pose = frame.getPose(bodySpace, referenceSpace);
    if (!pose) {
      continue;
    }

    const { x, y, z } = pose.transform.position;
    points.set(jointName, [x, y, z]);
  }

  lastTrackedCount = points.size;
  return points;
}

function makeLinePositions(points) {
  const positions = [];
  for (const [from, to] of BONES) {
    const a = points.get(from);
    const b = points.get(to);
    if (!a || !b) {
      continue;
    }
    positions.push(...a, ...b);
  }
  return positions;
}

function setupGL() {
  const vertexShader = createShader(gl.VERTEX_SHADER, `
    attribute vec3 a_position;
    uniform mat4 u_matrix;
    uniform float u_pointSize;

    void main() {
      gl_Position = u_matrix * vec4(a_position, 1.0);
      gl_PointSize = u_pointSize;
    }
  `);

  const fragmentShader = createShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    uniform vec4 u_color;

    void main() {
      gl_FragColor = u_color;
    }
  `);

  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }

  positionBuffer = gl.createBuffer();
  matrixLocation = gl.getUniformLocation(program, "u_matrix");
  colorLocation = gl.getUniformLocation(program, "u_color");
  pointSizeLocation = gl.getUniformLocation(program, "u_pointSize");
}

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }

  return shader;
}

function drawArray(mode, positions, matrix, color, pointSize) {
  if (!positions.length) {
    return;
  }

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(matrixLocation, false, matrix);
  gl.uniform4fv(colorLocation, color);
  gl.uniform1f(pointSizeLocation, pointSize);
  gl.drawArrays(mode, 0, positions.length / 3);
}

function drawPreview() {
  if (!gl || xrSession) {
    return;
  }

  const width = Math.max(1, Math.floor(canvas.clientWidth * window.devicePixelRatio));
  const height = Math.max(1, Math.floor(canvas.clientHeight * window.devicePixelRatio));
  canvas.width = width;
  canvas.height = height;
  gl.viewport(0, 0, width, height);
  gl.disable(gl.DEPTH_TEST);
  gl.clearColor(0.02, 0.03, 0.06, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function makeGridPositions() {
  const positions = [];
  const size = 3;
  for (let i = -size; i <= size; i += 0.5) {
    positions.push(-size, 0, i, size, 0, i);
    positions.push(i, 0, -size, i, 0, size);
  }
  return positions;
}

function multiplyMatrices(a, b) {
  const out = new Float32Array(16);
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  return out;
}

function updateHud(time, body) {
  frameCount += 1;
  if (time - lastHudUpdate < 500) {
    return;
  }

  lastHudUpdate = time;
  writeLog([
    `XR session: ${modeEl.value}`,
    `frame.body: ${body ? "available" : "null"}`,
    `body.size: ${lastBodySize}`,
    `tracked joints: ${lastTrackedCount}`,
    `frames: ${frameCount}`,
  ].join("\n"));
}

function writeLog(text) {
  logEl.textContent = text;
}
