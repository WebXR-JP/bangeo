import * as pc from "https://cdn.jsdelivr.net/npm/playcanvas@2.19.2/build/playcanvas.mjs";

/**
 * HtmlHitSync
 * 3D平面に貼ったHTMLテクスチャと、ブラウザ側のDOMヒットテスト位置を同期するための小さなヘルパー。
 * UIの見た目はこのデモ専用に作り直し、同期処理だけをHTML-in-Canvasの仕組みに合わせています。
 */
class HtmlHitSync {
    constructor(canvas, element, planeEntity, width, height) {
        this.canvas = canvas;
        this.element = element;
        this.planeEntity = planeEntity;

        this._pixelToLocal = new pc.Mat4();
        this._pixelToLocal.data.set([
            1 / width, 0, 0, 0,
            0, 0, 1 / height, 0,
            0, 1, 0, 0,
            -0.5, 0, -0.5, 1,
        ]);

        this._t1 = new pc.Mat4();
        this._t2 = new pc.Mat4();
        this._drawTransform = new pc.Mat4();
    }

    update(cameraComponent) {
        const canvas = this.canvas;
        const w = canvas.width;
        const h = canvas.height;

        this._t1.mul2(this.planeEntity.getWorldTransform(), this._pixelToLocal);
        this._t2.mul2(cameraComponent.projectionMatrix, cameraComponent.viewMatrix);
        this._drawTransform.mul2(this._t2, this._t1);

        this._t1.data.set([
            w / 2, 0, 0, 0,
            0, -h / 2, 0, 0,
            0, 0, 1, 0,
            w / 2, h / 2, 0, 1,
        ]);
        this._t2.mul2(this._t1, this._drawTransform);

        const d = this._t2.data;
        const domDrawTransform = new DOMMatrix([
            d[0], d[1], d[2], d[3],
            d[4], d[5], d[6], d[7],
            d[8], d[9], d[10], d[11],
            d[12], d[13], d[14], d[15],
        ]);

        canvas.getElementTransform(this.element, domDrawTransform);

        const dpr = w / canvas.clientWidth;
        this.element.style.transform = new DOMMatrix([
            d[0] / dpr, d[1] / dpr, d[2], d[3],
            d[4] / dpr, d[5] / dpr, d[6], d[7],
            d[8] / dpr, d[9] / dpr, d[10], d[11],
            d[12] / dpr, d[13] / dpr, d[14], d[15],
        ]).toString();
    }
}

const canvas = document.getElementById("application-canvas");
const statusEl = document.getElementById("status");

canvas.setAttribute("layoutsubtree", "true");
window.focus();

const getViewport = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
        w,
        h,
        isMobile: w < 640,
        isNarrow: w < 900,
        isPortrait: w < h,
        isShort: h < 640,
    };
};

const getPanelDimensions = () => {
    const vp = getViewport();
    if (vp.isMobile) return { width: 300, height: 400 };
    if (vp.isNarrow || vp.isPortrait) return { width: 340, height: 430 };
    return { width: 380, height: 460 };
};

let { width: PANEL_WIDTH, height: PANEL_HEIGHT } = getPanelDimensions();

const modes = [
    {
        id: "css",
        label: "CSS Layer",
        eyebrow: "CSS stays alive",
        headline: "HTMLの見た目を、そのまま3Dへ。",
        body: "角丸、影、グラデーション、状態表示。画像に焼き込まず、DOMで作ったパネルをPlayCanvasの平面へ貼っています。",
        accent: "#f43f5e",
        accent2: "#fb7185",
        dark: "#881337",
        scene: "#f43f5e",
        code: ["<section class=\"glass-ui\">", "  CSS shadows + border-radius", "</section>"],
        metric: "CSS",
    },
    {
        id: "texture",
        label: "Texture Upload",
        eyebrow: "DOM → GPU texture",
        headline: "paintイベントで、UIを更新。",
        body: "HTMLの描画結果をテクスチャとして扱い、内容が変わったらGPUへ再アップロード。3D側のマテリアルにそのまま流し込みます。",
        accent: "#0891b2",
        accent2: "#22d3ee",
        dark: "#155e75",
        scene: "#06b6d4",
        code: ["texture.setSource(htmlPanel)", "canvas.requestPaint()", "texture.upload()"],
        metric: "GPU",
    },
    {
        id: "hit",
        label: "Hit Test",
        eyebrow: "DOM events on 3D",
        headline: "3D上でも、ボタンはボタン。",
        body: "getElementTransformで投影行列を同期。ホバーやクリックはブラウザのDOMイベントとして扱えるので、UI実装の手触りがかなり普通です。",
        accent: "#7c3aed",
        accent2: "#c084fc",
        dark: "#4c1d95",
        scene: "#8b5cf6",
        code: ["canvas.getElementTransform(", "  htmlPanel, drawMatrix", ")"],
        metric: "DOM",
    },
];

let activeModeId = modes[0].id;
const getMode = () => modes.find((mode) => mode.id === activeModeId) ?? modes[0];

const hexToColor = (hex) => {
    const value = hex.replace("#", "");
    const r = parseInt(value.slice(0, 2), 16) / 255;
    const g = parseInt(value.slice(2, 4), 16) / 255;
    const b = parseInt(value.slice(4, 6), 16) / 255;
    return new pc.Color(r, g, b);
};

const makeMaterial = ({ color = "#ffffff", emissive = null, opacity = 1, shininess = 60, depthWrite = true } = {}) => {
    const material = new pc.StandardMaterial();
    material.diffuse = typeof color === "string" ? hexToColor(color) : color;
    material.shininess = shininess;

    if (emissive) {
        material.emissive = typeof emissive === "string" ? hexToColor(emissive) : emissive;
    }

    if (opacity < 1) {
        material.opacity = opacity;
        material.blendType = pc.BLEND_NORMAL;
        material.depthWrite = depthWrite;
    }

    material.update();
    return material;
};

const createRenderEntity = ({ name, type = "box", material, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0], parent = null, castShadows = true, receiveShadows = true }) => {
    const entity = new pc.Entity(name);
    entity.addComponent("render", {
        type,
        material,
        castShadows,
        receiveShadows,
    });
    entity.setLocalPosition(position[0], position[1], position[2]);
    entity.setLocalScale(scale[0], scale[1], scale[2]);
    entity.setLocalEulerAngles(rotation[0], rotation[1], rotation[2]);
    (parent ?? app.root).addChild(entity);
    return entity;
};

const device = await pc.createGraphicsDevice(canvas, {
    deviceTypes: [pc.DEVICETYPE_WEBGL, pc.DEVICETYPE_WEBGPU],
    // PlayCanvas defaults to high-performance; omitting it avoids a harmless Chromium warning on Windows.
    powerPreference: "default",
});
device.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

const createOptions = new pc.AppOptions();
createOptions.graphicsDevice = device;
// Camera sway uses pointermove; HTML panel uses DOM clicks — no PlayCanvas touch/mouse input needed.
createOptions.componentSystems = [
    pc.RenderComponentSystem,
    pc.CameraComponentSystem,
    pc.LightComponentSystem,
];
createOptions.resourceHandlers = [pc.TextureHandler];

const app = new pc.AppBase(canvas);
app.init(createOptions);
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);

if (pc.GAMMA_SRGB !== undefined) app.scene.gammaCorrection = pc.GAMMA_SRGB;
if (pc.TONEMAP_ACES !== undefined) app.scene.toneMapping = pc.TONEMAP_ACES;
app.scene.ambientLight = new pc.Color(0.78, 0.76, 0.82);

const layoutState = {
    lookTarget: new pc.Vec3(0.45, 1.42, 0.0),
    baseDist: 9.2,
    baseYaw: 0,
    basePitch: 0,
};

const getSceneLayout = () => {
    const vp = getViewport();
    if (vp.isMobile || (vp.isPortrait && vp.isNarrow)) {
        return {
            cameraPos: [0.2, 2.15, 10.8],
            lookAt: [0.35, 1.55, 0.05],
            fov: 48,
            panelPos: [0.55, 1.82, 0.18],
            panelRot: [90, -4, 0],
            panelHeight: 3.35,
            cardPos: [-0.15, 1.05, -0.55],
            cardRot: [-3, -8, 0],
            cardScale: 0.82,
        };
    }
    if (vp.isNarrow) {
        return {
            cameraPos: [1.35, 2.45, 10.2],
            lookAt: [0.55, 1.48, 0.02],
            fov: 44,
            panelPos: [1.55, 1.95, 0.08],
            panelRot: [90, -6, 0],
            panelHeight: 3.85,
            cardPos: [-0.95, 1.28, -0.15],
            cardRot: [-4, -14, 0],
            cardScale: 0.9,
        };
    }
    return {
        cameraPos: [2.3, 2.7, 9.2],
        lookAt: [0.4, 1.45, 0],
        fov: 42,
        panelPos: [2.58, 2.08, 0.05],
        panelRot: [90, -8, 0],
        panelHeight: 4.6,
        cardPos: [-1.62, 1.47, 0.0],
        cardRot: [-4, -18, 0],
        cardScale: 1,
    };
};

let panelBackGlow = null;
let fallbackPanelPlaceholder = null;

const applySceneLayout = () => {
    const layout = getSceneLayout();
    const panelAspect = PANEL_WIDTH / PANEL_HEIGHT;
    const panelWorldHeight = layout.panelHeight;
    const panelWorldWidth = panelWorldHeight * panelAspect;

    camera.setPosition(...layout.cameraPos);
    camera.lookAt(...layout.lookAt);
    camera.camera.fov = layout.fov;

    layoutState.lookTarget.set(...layout.lookAt);
    const baseDir = camera.getPosition().clone().sub(layoutState.lookTarget);
    layoutState.baseDist = baseDir.length();
    layoutState.baseYaw = Math.atan2(baseDir.x, baseDir.z);
    layoutState.basePitch = Math.asin(baseDir.y / layoutState.baseDist);

    browserCard.setLocalPosition(...layout.cardPos);
    browserCard.setLocalEulerAngles(...layout.cardRot);
    browserCard.setLocalScale(layout.cardScale, layout.cardScale, layout.cardScale);

    if (panel) {
        panel.setLocalPosition(...layout.panelPos);
        panel.setLocalEulerAngles(...layout.panelRot);
        panel.setLocalScale(panelWorldWidth, 1, panelWorldHeight);
    }

    if (panelBackGlow) {
        panelBackGlow.setLocalPosition(layout.panelPos[0] - 0.02, layout.panelPos[1] - 0.03, layout.panelPos[2] - 0.21);
        panelBackGlow.setLocalEulerAngles(...layout.panelRot);
        panelBackGlow.setLocalScale(panelWorldWidth * 1.14, 1, panelWorldHeight * 1.1);
    }

    if (fallbackPanelPlaceholder) {
        fallbackPanelPlaceholder.setLocalPosition(...layout.panelPos);
        fallbackPanelPlaceholder.setLocalEulerAngles(layout.panelRot[0] - 90, layout.panelRot[1], layout.panelRot[2]);
        fallbackPanelPlaceholder.setLocalScale(panelWorldWidth * 0.92, panelWorldHeight * 0.98, 0.12);
    }
};

const resize = () => {
    app.resizeCanvas();
    const next = getPanelDimensions();
    const sizeChanged = next.width !== PANEL_WIDTH || next.height !== PANEL_HEIGHT;
    PANEL_WIDTH = next.width;
    PANEL_HEIGHT = next.height;
    configureOverlayPlacement();
    if (sizeChanged) {
        renderPanelHtml();
        requestPanelPaint();
    }
    applySceneLayout();
    rebuildHtmlSync();
    updateStatus();
};
window.addEventListener("resize", resize);

const supportsHtmlInCanvas = !!device.supportsHtmlTextures;
const supportsGetElementTransform = typeof canvas.getElementTransform === "function";

const htmlPanel = document.createElement("section");
htmlPanel.setAttribute("aria-label", "HTML-in-Canvas interactive panel");
htmlPanel.style.boxSizing = "border-box";
htmlPanel.style.borderRadius = "22px";
htmlPanel.style.overflow = "hidden";
htmlPanel.style.fontFamily = "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', system-ui, sans-serif";
htmlPanel.style.color = "white";
htmlPanel.style.boxShadow = "0 42px 120px rgba(15, 23, 42, 0.40)";

const configureOverlayPlacement = () => {
    const vp = getViewport();
    htmlPanel.style.width = `${PANEL_WIDTH}px`;
    htmlPanel.style.height = `${PANEL_HEIGHT}px`;
    htmlPanel.style.maxWidth = `${PANEL_WIDTH}px`;
    htmlPanel.style.maxHeight = `${PANEL_HEIGHT}px`;
    htmlPanel.style.overflow = "hidden";

    if (supportsHtmlInCanvas) {
        htmlPanel.style.position = "absolute";
        htmlPanel.style.left = "0";
        htmlPanel.style.top = "0";
        htmlPanel.style.right = "auto";
        htmlPanel.style.bottom = "auto";
        htmlPanel.style.transform = "none";
        htmlPanel.style.transformOrigin = "0 0";
        htmlPanel.style.zIndex = "auto";
        return;
    }

    htmlPanel.style.position = "fixed";
    htmlPanel.style.zIndex = "15";
    htmlPanel.style.left = "auto";
    htmlPanel.style.bottom = "auto";

    if (vp.isMobile || vp.isPortrait) {
        htmlPanel.style.right = "max(10px, env(safe-area-inset-right, 0px))";
        htmlPanel.style.top = "max(12px, env(safe-area-inset-top, 0px))";
        htmlPanel.style.transform = "none";
    } else {
        htmlPanel.style.right = "clamp(12px, 3vw, 28px)";
        htmlPanel.style.top = "50%";
        htmlPanel.style.transform = "translateY(-50%)";
    }
};

configureOverlayPlacement();

const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const renderPanelHtml = () => {
    const mode = getMode();
    htmlPanel.innerHTML = `
<style>
    .hic-root {
        --accent: ${mode.accent};
        --accent-2: ${mode.accent2};
        --dark: ${mode.dark};
        position: relative;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow: hidden;
        color: white;
        background:
            radial-gradient(circle at 18% 12%, color-mix(in srgb, var(--accent-2), white 12%) 0, transparent 28%),
            radial-gradient(circle at 92% 0%, rgba(255,255,255,0.28), transparent 34%),
            linear-gradient(145deg, #080b13 0%, var(--dark) 52%, #111827 100%);
        isolation: isolate;
    }

    .hic-root::before {
        content: "";
        position: absolute;
        inset: 1px;
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 33px;
        pointer-events: none;
        z-index: 2;
    }

    .hic-root::after {
        content: "";
        position: absolute;
        inset: -35% auto auto -20%;
        width: 68%;
        height: 68%;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(255,255,255,0.22), transparent 64%);
        filter: blur(2px);
        pointer-events: none;
    }

    .hic-top {
        position: relative;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-shrink: 0;
        min-width: 0;
    }

    .hic-chip,
    .hic-mode-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 100%;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(255,255,255,0.12);
        border: 1px solid rgba(255,255,255,0.16);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.16);
        font-size: 9px;
        font-weight: 950;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        white-space: nowrap;
        flex-shrink: 0;
    }

    .hic-chip::before {
        content: "";
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: var(--accent-2);
        box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent), transparent 72%);
    }

    .hic-mode-chip {
        letter-spacing: 0.03em;
        text-transform: none;
        color: rgba(255,255,255,0.78);
        flex-shrink: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .hic-hero {
        position: relative;
        z-index: 3;
        flex-shrink: 0;
        min-width: 0;
    }

    .hic-eyebrow {
        margin: 0 0 6px;
        color: rgba(255,255,255,0.62);
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.14em;
        text-transform: uppercase;
    }

    .hic-title {
        margin: 0;
        font-size: 22px;
        line-height: 1.08;
        letter-spacing: -0.05em;
        word-break: keep-all;
        overflow-wrap: anywhere;
    }

    .hic-copy {
        max-width: 100%;
        margin: 8px 0 0;
        color: rgba(255,255,255,0.74);
        font-size: 12px;
        line-height: 1.55;
        font-weight: 650;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .hic-tabs {
        position: relative;
        z-index: 3;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        flex-shrink: 0;
    }

    .hic-tab {
        width: 100%;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 4px;
        padding: 10px 8px;
        color: rgba(255,255,255,0.76);
        background: rgba(255,255,255,0.075);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 14px;
        font: inherit;
        font-size: 11px;
        font-weight: 900;
        cursor: pointer;
        transition: transform 150ms ease, background 150ms ease, border-color 150ms ease, color 150ms ease;
        text-align: left;
    }

    .hic-tab:hover {
        transform: translateY(-1px);
        color: white;
        background: rgba(255,255,255,0.13);
        border-color: rgba(255,255,255,0.24);
    }

    .hic-tab[aria-pressed="true"] {
        color: white;
        background: linear-gradient(135deg, color-mix(in srgb, var(--accent), white 8%), rgba(255,255,255,0.14));
        border-color: rgba(255,255,255,0.38);
        box-shadow: 0 18px 42px color-mix(in srgb, var(--accent), transparent 72%);
    }

    .hic-tab span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
    }

    .hic-tab small {
        color: rgba(255,255,255,0.50);
        font-size: 9px;
        font-weight: 950;
        letter-spacing: 0.1em;
        text-transform: uppercase;
    }

    .hic-code {
        position: relative;
        z-index: 3;
        display: grid;
        gap: 6px;
        padding: 12px;
        border-radius: 16px;
        background: rgba(3, 7, 18, 0.58);
        border: 1px solid rgba(255,255,255,0.12);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 10px;
        color: #dbeafe;
        overflow: hidden;
        flex: 1;
        min-height: 0;
    }

    .hic-code div {
        display: flex;
        align-items: center;
        gap: 7px;
        min-height: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .hic-code div::before {
        content: "";
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: var(--accent-2);
        box-shadow: 0 0 18px var(--accent-2);
        flex: 0 0 auto;
    }

    .hic-bottom {
        position: relative;
        z-index: 3;
        margin-top: auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        flex-shrink: 0;
    }

    .hic-stat {
        padding: 10px 12px;
        border-radius: 14px;
        background: rgba(255,255,255,0.10);
        border: 1px solid rgba(255,255,255,0.12);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
    }

    .hic-stat strong {
        display: block;
        font-size: 18px;
        line-height: 1;
        letter-spacing: -0.05em;
    }

    .hic-stat span {
        display: block;
        margin-top: 6px;
        color: rgba(255,255,255,0.56);
        font-size: 9px;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
    }

    @supports not (color: color-mix(in srgb, white, black)) {
        .hic-tab[aria-pressed="true"] { background: var(--accent); }
    }
</style>
<div class="hic-root">
    <div class="hic-top">
        <span class="hic-chip">Live HTML</span>
        <span class="hic-mode-chip">${mode.label}</span>
    </div>

    <div class="hic-hero">
        <p class="hic-eyebrow">${mode.eyebrow}</p>
        <h1 class="hic-title">${mode.headline}</h1>
        <p class="hic-copy">${mode.body}</p>
    </div>

    <div class="hic-tabs" aria-label="説明モード">
        ${modes.map((item) => `
            <button class="hic-tab" type="button" data-mode="${item.id}" aria-pressed="${item.id === activeModeId ? "true" : "false"}">
                <span>${item.label}</span>
                <small>${item.metric}</small>
            </button>
        `).join("")}
    </div>

    <div class="hic-code" aria-label="コード例">
        ${mode.code.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}
    </div>

    <div class="hic-bottom">
        <div class="hic-stat"><strong>DOM</strong><span>Source</span></div>
        <div class="hic-stat"><strong>${mode.metric}</strong><span>Active</span></div>
    </div>
</div>`;
};

renderPanelHtml();

let panelTexture = null;
const requestPanelPaint = () => {
    if (supportsHtmlInCanvas && typeof canvas.requestPaint === "function") {
        canvas.requestPaint();
    }
};

const camera = new pc.Entity("camera");
camera.addComponent("camera", {
    clearColor: new pc.Color(1, 0.975, 0.985, 1),
    fov: 42,
    nearClip: 0.01,
    farClip: 80,
});
app.root.addChild(camera);

const sun = new pc.Entity("key-light");
sun.addComponent("light", {
    type: "directional",
    color: new pc.Color(1, 0.955, 0.92),
    intensity: 3.1,
    castShadows: true,
    shadowResolution: 2048,
    shadowDistance: 18,
    shadowBias: 0.04,
    normalOffsetBias: 0.035,
});
sun.setEulerAngles(48, 38, 0);
app.root.addChild(sun);
if (pc.SHADOW_PCF5 !== undefined) sun.light.shadowType = pc.SHADOW_PCF5;

const fill = new pc.Entity("soft-fill");
fill.addComponent("light", {
    type: "omni",
    color: new pc.Color(0.72, 0.82, 1),
    intensity: 0.72,
    range: 11,
    castShadows: false,
});
fill.setLocalPosition(-3, 3.6, 4.5);
app.root.addChild(fill);

const rim = new pc.Entity("rim-light");
rim.addComponent("light", {
    type: "omni",
    color: new pc.Color(1, 0.58, 0.7),
    intensity: 0.56,
    range: 8,
    castShadows: false,
});
rim.setLocalPosition(4.5, 3.6, -3.5);
app.root.addChild(rim);

const groundMaterial = makeMaterial({ color: "#f7f3f6", shininess: 72 });
const softShadowMaterial = makeMaterial({ color: "#1f2937", opacity: 0.10, shininess: 12, depthWrite: false });
const whiteCardMaterial = makeMaterial({ color: "#ffffff", shininess: 95 });
const glassMaterial = makeMaterial({ color: "#fff1f2", opacity: 0.30, shininess: 110, depthWrite: false });
const darkMaterial = makeMaterial({ color: "#101827", shininess: 68 });
const mutedMaterial = makeMaterial({ color: "#cbd5e1", shininess: 52 });
const accentMaterial = makeMaterial({ color: getMode().scene, emissive: getMode().scene, shininess: 95 });
const accentSoftMaterial = makeMaterial({ color: getMode().accent2, opacity: 0.32, shininess: 70, depthWrite: false });
const codeLineMaterials = [
    makeMaterial({ color: getMode().accent, emissive: getMode().accent, shininess: 65 }),
    makeMaterial({ color: "#93c5fd", emissive: "#1d4ed8", shininess: 65 }),
    makeMaterial({ color: "#86efac", emissive: "#166534", shininess: 65 }),
];

const ground = createRenderEntity({
    name: "matte-ground",
    type: "plane",
    material: groundMaterial,
    position: [0, -0.58, 0],
    scale: [18, 1, 18],
    castShadows: false,
    receiveShadows: true,
});

createRenderEntity({
    name: "painted-soft-shadow",
    type: "cylinder",
    material: softShadowMaterial,
    position: [-0.3, -0.56, 0.2],
    scale: [5.8, 0.018, 3.7],
    castShadows: false,
    receiveShadows: false,
});

const browserCard = new pc.Entity("floating-html-card");
browserCard.setLocalPosition(-1.62, 1.47, 0.0);
browserCard.setLocalEulerAngles(-4, -18, 0);
app.root.addChild(browserCard);

createRenderEntity({
    name: "browser-card-body",
    type: "box",
    material: whiteCardMaterial,
    position: [0, 0, 0],
    scale: [3.15, 2.1, 0.16],
    parent: browserCard,
});

createRenderEntity({
    name: "browser-card-glass-edge",
    type: "box",
    material: glassMaterial,
    position: [0.08, -0.04, 0.11],
    scale: [3.35, 2.32, 0.035],
    parent: browserCard,
    castShadows: false,
    receiveShadows: false,
});

createRenderEntity({
    name: "browser-top-bar",
    type: "box",
    material: darkMaterial,
    position: [0, 0.88, 0.14],
    scale: [2.72, 0.16, 0.06],
    parent: browserCard,
});

for (let i = 0; i < 3; i += 1) {
    createRenderEntity({
        name: `window-dot-${i}`,
        type: "sphere",
        material: i === 0 ? accentMaterial : mutedMaterial,
        position: [-1.22 + i * 0.16, 0.88, 0.2],
        scale: [0.07, 0.07, 0.07],
        parent: browserCard,
        castShadows: false,
        receiveShadows: false,
    });
}

const codeBars = [];
const codeBarSpecs = [
    [-0.75, 0.48, 1.44, codeLineMaterials[0]],
    [-0.35, 0.21, 2.02, codeLineMaterials[1]],
    [-0.62, -0.06, 1.60, codeLineMaterials[2]],
    [-0.18, -0.33, 2.12, mutedMaterial],
    [-0.52, -0.60, 1.48, codeLineMaterials[0]],
];

codeBarSpecs.forEach(([x, y, width, material], index) => {
    const bar = createRenderEntity({
        name: `html-code-bar-${index}`,
        type: "box",
        material,
        position: [x, y, 0.18],
        scale: [width, 0.085, 0.05],
        parent: browserCard,
        castShadows: false,
        receiveShadows: false,
    });
    codeBars.push(bar);
});

createRenderEntity({
    name: "html-tag-chip",
    type: "box",
    material: accentMaterial,
    position: [1.04, -0.72, 0.2],
    scale: [0.64, 0.28, 0.07],
    parent: browserCard,
});

const htmlOrb = createRenderEntity({
    name: "html-glow-orb",
    type: "sphere",
    material: accentSoftMaterial,
    position: [-3.28, 2.92, -0.48],
    scale: [0.72, 0.72, 0.72],
    castShadows: false,
    receiveShadows: false,
});

createRenderEntity({
    name: "small-ui-chip-a",
    type: "box",
    material: accentMaterial,
    position: [-3.05, 0.22, 0.58],
    scale: [1.12, 0.36, 0.24],
    rotation: [0, -10, 0],
});

createRenderEntity({
    name: "small-ui-chip-b",
    type: "box",
    material: darkMaterial,
    position: [-2.08, -0.02, 0.32],
    scale: [0.86, 0.26, 0.2],
    rotation: [0, -10, 0],
});

let panel = null;
if (supportsHtmlInCanvas) {
    canvas.appendChild(htmlPanel);

    panelTexture = new pc.Texture(device, {
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
        format: pc.PIXELFORMAT_RGBA8,
        minFilter: pc.FILTER_LINEAR,
        magFilter: pc.FILTER_LINEAR,
        name: "live-html-panel-texture",
    });

    canvas.addEventListener("paint", () => {
        if (!panelTexture) return;
        panelTexture.setSource(htmlPanel);
        panelTexture.upload();
    });
    requestPanelPaint();

    const panelMaterial = new pc.StandardMaterial();
    panelMaterial.diffuse = new pc.Color(0, 0, 0);
    panelMaterial.emissiveMap = panelTexture;
    panelMaterial.emissive = new pc.Color(1, 1, 1);
    panelMaterial.useLighting = false;
    panelMaterial.blendType = pc.BLEND_PREMULTIPLIED;
    panelMaterial.opacityMap = panelTexture;
    panelMaterial.opacityMapChannel = "a";
    panelMaterial.alphaTest = 0.01;
    panelMaterial.depthWrite = false;
    panelMaterial.update();

    panelBackGlow = createRenderEntity({
        name: "panel-back-glow",
        type: "plane",
        material: accentSoftMaterial,
        position: [2.56, 2.05, -0.16],
        scale: [4.2, 1, 5.0],
        rotation: [90, -8, 0],
        castShadows: false,
        receiveShadows: false,
    });

    panel = createRenderEntity({
        name: "html-texture-panel",
        type: "plane",
        material: panelMaterial,
        position: [2.58, 2.08, 0.05],
        scale: [3.7, 1, 4.6],
        rotation: [90, -8, 0],
        castShadows: false,
        receiveShadows: false,
    });
} else {
    document.body.appendChild(htmlPanel);

    fallbackPanelPlaceholder = createRenderEntity({
        name: "fallback-panel-placeholder",
        type: "box",
        material: darkMaterial,
        position: [2.58, 2.08, 0.05],
        scale: [3.45, 4.6, 0.12],
        rotation: [0, -8, 0],
    });
}

const updateStatus = () => {
    const mode = getMode();
    const vp = getViewport();
    if (vp.isMobile) {
        if (supportsHtmlInCanvas && supportsGetElementTransform) {
            statusEl.textContent = `HTML-in-Canvas · ${mode.label} · 3Dパネル操作可`;
        } else if (supportsHtmlInCanvas) {
            statusEl.textContent = `HTML-in-Canvas · ${mode.label} · ヒットテスト限定`;
        } else {
            statusEl.textContent = `DOM Overlay · ${mode.label}`;
        }
        return;
    }
    if (supportsHtmlInCanvas && supportsGetElementTransform) {
        statusEl.textContent = `mode: HTML-in-Canvas + getElementTransform / active: ${mode.label} / 3Dパネル上でクリック・ホバー可能`;
    } else if (supportsHtmlInCanvas) {
        statusEl.textContent = `mode: HTML-in-Canvas / active: ${mode.label} / getElementTransform未対応のためヒットテストは限定的`;
    } else {
        statusEl.textContent = `mode: DOM Overlay fallback / active: ${mode.label} / supportsHtmlTextures = false`;
    }
};

const applyModeToScene = () => {
    const mode = getMode();
    const accent = hexToColor(mode.scene);
    const accent2 = hexToColor(mode.accent2);

    accentMaterial.diffuse = accent;
    accentMaterial.emissive = accent;
    accentMaterial.update();

    accentSoftMaterial.diffuse = accent2;
    accentSoftMaterial.emissive = accent2;
    accentSoftMaterial.update();

    codeLineMaterials[0].diffuse = hexToColor(mode.accent);
    codeLineMaterials[0].emissive = hexToColor(mode.accent);
    codeLineMaterials[0].update();

    rim.light.color = accent2;
    updateStatus();
};

htmlPanel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (!button) return;

    const nextModeId = button.getAttribute("data-mode");
    if (!nextModeId || nextModeId === activeModeId) return;

    activeModeId = nextModeId;
    renderPanelHtml();
    applyModeToScene();
    requestPanelPaint();
});

applyModeToScene();
applySceneLayout();

let targetYaw = 0;
let targetPitch = 0;
let currentYaw = 0;
let currentPitch = 0;
let time = 0;

const onPointerMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    const sway = getViewport().isMobile ? 0.16 : 0.28;
    targetYaw = -nx * sway;
    targetPitch = ny * (getViewport().isMobile ? 0.06 : 0.10);
};

window.addEventListener("pointermove", onPointerMove, { passive: true });

let htmlSync = (panel && supportsGetElementTransform)
    ? new HtmlHitSync(canvas, htmlPanel, panel, PANEL_WIDTH, PANEL_HEIGHT)
    : null;

const rebuildHtmlSync = () => {
    if (panel && supportsGetElementTransform) {
        htmlSync = new HtmlHitSync(canvas, htmlPanel, panel, PANEL_WIDTH, PANEL_HEIGHT);
    }
};

app.on("update", (dt) => {
    time += dt;
    const sceneLayout = getSceneLayout();

    currentYaw += (targetYaw - currentYaw) * Math.min(1, 2.6 * dt);
    currentPitch += (targetPitch - currentPitch) * Math.min(1, 2.6 * dt);

    const yaw = layoutState.baseYaw + currentYaw;
    const pitch = Math.max(-Math.PI * 0.38, Math.min(Math.PI * 0.38, layoutState.basePitch + currentPitch));

    camera.setPosition(
        layoutState.lookTarget.x + Math.sin(yaw) * Math.cos(pitch) * layoutState.baseDist,
        layoutState.lookTarget.y + Math.sin(pitch) * layoutState.baseDist,
        layoutState.lookTarget.z + Math.cos(yaw) * Math.cos(pitch) * layoutState.baseDist,
    );
    camera.lookAt(layoutState.lookTarget);

    browserCard.setLocalEulerAngles(
        sceneLayout.cardRot[0] + Math.sin(time * 0.72) * 1.15,
        sceneLayout.cardRot[1] + Math.sin(time * 0.45) * 1.8,
        sceneLayout.cardRot[2] + Math.sin(time * 0.55) * 0.8,
    );

    const orbBaseX = sceneLayout.cardPos[0] - 1.6 * sceneLayout.cardScale;
    const orbBaseY = sceneLayout.cardPos[1] + 1.45 * sceneLayout.cardScale;
    const orbBaseZ = sceneLayout.cardPos[2] - 0.48;
    htmlOrb.setLocalPosition(
        orbBaseX + Math.sin(time * 0.8) * 0.12,
        orbBaseY + Math.cos(time * 0.7) * 0.10,
        orbBaseZ,
    );

    codeBars.forEach((bar, index) => {
        const pulse = 1 + Math.sin(time * 1.4 + index * 0.55) * 0.025;
        const baseScale = codeBarSpecs[index][2];
        bar.setLocalScale(baseScale * pulse, 0.085, 0.05);
    });

    htmlSync?.update(camera.camera);
});

app.on("destroy", () => {
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    if (htmlPanel.parentNode) htmlPanel.parentNode.removeChild(htmlPanel);
});

app.start();
