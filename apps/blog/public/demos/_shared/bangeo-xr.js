/**
 * BANGEO XR Gate — WebXRデモ共通の事前判定ランタイム
 *
 * 目的:
 * - Immersiveセッションに入る「前」に対応可否を判定し、非対応なら開始ボタンを出さない
 * - requestSession の失敗理由（DOMException）を必ず画面に表示する
 * - window.onerror / unhandledrejection を捕捉し、サイレント失敗をなくす
 *
 * 使い方:
 *   import { createXRGate } from "../_shared/bangeo-xr.js";
 *   const gate = createXRGate({
 *     title: "デモ名",
 *     subtitle: "1行説明",
 *     mode: "immersive-vr",                 // or "immersive-ar"
 *     requiredFeatures: ["hit-test"],       // 任意
 *     optionalFeatures: ["local-floor"],    // 任意
 *     backHref: "/experiments/xxx",         // 説明ページへ戻るリンク
 *     deviceHint: "Meta Quest / PICO のブラウザで開いてください。",
 *     onSessionStarted(session) { ... },    // セッション取得後に呼ばれる
 *     onSessionEnded() { ... },
 *   });
 *   gate.log("任意のステータス表示");
 */

const STYLE = `
.bxr-gate {
  position: fixed; inset: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  background: linear-gradient(160deg, rgba(9,9,18,0.92), rgba(30,10,24,0.92));
  font-family: "Hiragino Sans", "Yu Gothic", "Noto Sans JP", system-ui, sans-serif;
  color: #f9fafb;
  overflow-y: auto;
}
.bxr-gate[hidden] { display: none; }
.bxr-card {
  width: min(560px, 100%);
  background: rgba(17, 24, 39, 0.92);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.5);
}
.bxr-eyebrow {
  font-size: 10px; font-weight: 900; letter-spacing: 0.24em;
  text-transform: uppercase; color: #fda4af; margin: 0 0 8px;
}
.bxr-title { font-size: 20px; font-weight: 900; margin: 0 0 6px; line-height: 1.4; }
.bxr-subtitle { font-size: 13px; color: #d1d5db; margin: 0 0 16px; line-height: 1.7; }
.bxr-checks { list-style: none; margin: 0 0 16px; padding: 0; display: grid; gap: 8px; }
.bxr-check {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 12.5px; line-height: 1.6;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; padding: 10px 12px;
}
.bxr-check .icon { flex: none; width: 20px; text-align: center; font-size: 14px; }
.bxr-check.ok { border-color: rgba(52, 211, 153, 0.4); }
.bxr-check.ok .icon { color: #34d399; }
.bxr-check.ng { border-color: rgba(251, 113, 133, 0.5); background: rgba(190, 18, 60, 0.14); }
.bxr-check.ng .icon { color: #fb7185; }
.bxr-check.pending .icon { color: #9ca3af; }
.bxr-check small { display: block; color: #9ca3af; font-size: 11px; margin-top: 2px; }
.bxr-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
.bxr-btn {
  appearance: none; border: none; cursor: pointer;
  border-radius: 999px; padding: 13px 24px;
  font-size: 14px; font-weight: 900; font-family: inherit;
  transition: transform 0.15s, background 0.15s, opacity 0.15s;
}
.bxr-btn.primary { background: #e11d48; color: white; box-shadow: 0 10px 26px rgba(225,29,72,0.4); }
.bxr-btn.primary:hover:not(:disabled) { background: #be123c; transform: translateY(-1px); }
.bxr-btn.primary:disabled { background: #4b5563; color: #9ca3af; cursor: not-allowed; box-shadow: none; }
.bxr-btn.ghost {
  background: transparent; color: #e5e7eb;
  border: 1px solid rgba(255,255,255,0.25);
}
.bxr-btn.ghost:hover { border-color: rgba(255,255,255,0.6); }
.bxr-error {
  display: none;
  border-radius: 12px; padding: 12px 14px; margin-bottom: 12px;
  background: rgba(190, 18, 60, 0.18);
  border: 1px solid rgba(251, 113, 133, 0.55);
  color: #fecdd3; font-size: 12px; line-height: 1.7;
  white-space: pre-wrap; word-break: break-word;
}
.bxr-error.show { display: block; }
.bxr-error strong { color: #fff; }
.bxr-hint {
  border-radius: 12px; padding: 12px 14px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #bae6fd; font-size: 12px; line-height: 1.7;
}
.bxr-hint code {
  display: block; margin-top: 6px; padding: 8px 10px;
  background: rgba(0,0,0,0.4); border-radius: 8px;
  color: #e0f2fe; font-size: 11px; word-break: break-all;
  font-family: ui-monospace, monospace;
}
.bxr-copy {
  margin-top: 8px; font-size: 11px; padding: 8px 14px;
}
.bxr-log {
  position: fixed; left: 12px; bottom: 12px; z-index: 1001;
  max-width: min(480px, calc(100vw - 24px));
  display: grid; gap: 6px;
  pointer-events: none;
  font-family: "Hiragino Sans", "Yu Gothic", "Noto Sans JP", system-ui, sans-serif;
}
.bxr-log .entry {
  background: rgba(17, 24, 39, 0.9);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 10px; padding: 8px 12px;
  color: #e5e7eb; font-size: 11.5px; line-height: 1.6;
  word-break: break-word;
}
.bxr-log .entry.error { border-color: rgba(251,113,133,0.6); background: rgba(76, 5, 25, 0.92); color: #fecdd3; }
.bxr-footer { margin-top: 14px; font-size: 11px; color: #9ca3af; line-height: 1.7; }
.bxr-footer a { color: #fda4af; }
`;

const MODE_LABEL = {
	"immersive-vr": "VR",
	"immersive-ar": "AR / MR",
};

function el(tag, className, text) {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text != null) node.textContent = text;
	return node;
}

export function createXRGate(options) {
	const {
		title = "WebXR Demo",
		subtitle = "",
		mode = "immersive-vr",
		requiredFeatures = [],
		optionalFeatures = [],
		backHref = "/experiments",
		deviceHint = "Meta Quest / PICO などのVRヘッドセットのブラウザで、このURLを直接開いてください。",
		onSessionStarted,
		onSessionEnded,
	} = options;

	// ---- style ----
	const style = document.createElement("style");
	style.textContent = STYLE;
	document.head.appendChild(style);

	// ---- gate DOM ----
	const gate = el("div", "bxr-gate");
	const card = el("div", "bxr-card");
	gate.appendChild(card);

	card.appendChild(el("p", "bxr-eyebrow", "BANGEO WebXR Lab"));
	card.appendChild(el("h1", "bxr-title", title));
	if (subtitle) card.appendChild(el("p", "bxr-subtitle", subtitle));

	const checksList = el("ul", "bxr-checks");
	card.appendChild(checksList);

	const errorBox = el("div", "bxr-error");
	card.appendChild(errorBox);

	const actions = el("div", "bxr-actions");
	const startBtn = el("button", "bxr-btn primary", "判定中…");
	startBtn.disabled = true;
	const backBtn = el("a", "bxr-btn ghost", "説明ページに戻る");
	backBtn.href = backHref;
	actions.appendChild(startBtn);
	actions.appendChild(backBtn);
	card.appendChild(actions);

	const hint = el("div", "bxr-hint");
	hint.hidden = true;
	card.appendChild(hint);

	card.appendChild(
		el(
			"p",
			"bxr-footer",
			"このパネルは、対応していない環境でImmersiveセッションに入る前に停止するための事前判定です。判定結果と失敗理由はこの画面にそのまま表示されます。",
		),
	);

	document.body.appendChild(gate);

	// ---- log overlay (surfaces silent failures) ----
	const logBox = el("div", "bxr-log");
	document.body.appendChild(logBox);

	function pushLog(message, isError = false) {
		const entry = el("div", `entry${isError ? " error" : ""}`, message);
		logBox.appendChild(entry);
		while (logBox.children.length > 4) logBox.removeChild(logBox.firstChild);
		if (!isError) {
			setTimeout(() => entry.remove(), 8000);
		}
	}

	window.addEventListener("error", (event) => {
		pushLog(`実行時エラー: ${event.message}`, true);
	});
	window.addEventListener("unhandledrejection", (event) => {
		const reason = event.reason;
		const message =
			reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason);
		pushLog(`未処理の失敗: ${message}`, true);
	});

	// ---- checks ----
	const checkItems = [];
	function addCheck(label) {
		const li = el("li", "bxr-check pending");
		const icon = el("span", "icon", "…");
		const body = el("div");
		body.appendChild(el("span", null, label));
		const detail = el("small", null, "");
		body.appendChild(detail);
		li.appendChild(icon);
		li.appendChild(body);
		checksList.appendChild(li);
		const item = {
			set(ok, detailText) {
				li.className = `bxr-check ${ok ? "ok" : "ng"}`;
				icon.textContent = ok ? "✓" : "✕";
				detail.textContent = detailText || "";
			},
		};
		checkItems.push(item);
		return item;
	}

	function showError(titleText, bodyText) {
		errorBox.innerHTML = "";
		const strong = el("strong", null, titleText);
		errorBox.appendChild(strong);
		errorBox.appendChild(document.createTextNode(`\n${bodyText}`));
		errorBox.classList.add("show");
	}

	function showDeviceHint() {
		hint.hidden = false;
		hint.innerHTML = "";
		hint.appendChild(document.createTextNode(deviceHint));
		const code = el("code", null, location.href);
		hint.appendChild(code);
		const copy = el("button", "bxr-btn ghost bxr-copy", "このURLをコピー");
		copy.addEventListener("click", async () => {
			try {
				await navigator.clipboard.writeText(location.href);
				copy.textContent = "コピーしました";
			} catch {
				copy.textContent = "コピー不可（手動で選択してください）";
			}
		});
		hint.appendChild(copy);
	}

	const modeLabel = MODE_LABEL[mode] ?? mode;
	const checkSecure = addCheck("HTTPS（secure context）");
	const checkXr = addCheck("WebXR API（navigator.xr）");
	const checkPolicy = addCheck("xr-spatial-tracking 権限（iframe埋め込み時）");
	const checkMode = addCheck(`${modeLabel} セッション（${mode}）`);
	const featureLabel =
		requiredFeatures.length > 0
			? `必須機能: ${requiredFeatures.join(", ")}`
			: "必須機能: なし";
	const checkFeatures = addCheck(featureLabel);

	let supported = false;

	async function runPreflight() {
		// 1. secure context
		const secure = window.isSecureContext;
		checkSecure.set(secure, secure ? "" : "WebXRはHTTPSでのみ利用できます。");

		// 2. navigator.xr
		const hasXr = "xr" in navigator && !!navigator.xr;
		checkXr.set(
			hasXr,
			hasXr
				? ""
				: "このブラウザはWebXRに対応していません。Meta Quest Browser / PICO Browser / Android Chrome を使ってください。",
		);

		// 3. permissions policy (iframe embedding)
		let policyOk = true;
		let policyNote = "直接開いているため権限の問題はありません。";
		const inIframe = window.self !== window.top;
		if (inIframe) {
			try {
				if (document.featurePolicy?.allowsFeature) {
					policyOk = document.featurePolicy.allowsFeature("xr-spatial-tracking");
					policyNote = policyOk
						? "iframe内ですが xr-spatial-tracking が許可されています。"
						: 'iframeに allow="xr-spatial-tracking" がありません。全画面リンクから開いてください。';
				} else {
					policyNote =
						"iframe内で権限を確認できません。動かない場合は全画面リンクから開いてください。";
				}
			} catch {
				policyNote = "権限の確認に失敗しました。全画面リンクから開いてください。";
			}
		}
		checkPolicy.set(policyOk, policyNote);

		// 4. isSessionSupported
		let modeOk = false;
		if (hasXr && secure) {
			try {
				modeOk = await navigator.xr.isSessionSupported(mode);
				checkMode.set(
					modeOk,
					modeOk
						? ""
						: `この端末・ブラウザでは ${mode} を開始できません。${
								mode === "immersive-ar"
									? "パススルーAR対応のヘッドセット（Quest 3系など）またはARCore対応AndroidのChromeが必要です。"
									: "VRヘッドセットのブラウザで開いてください。"
							}`,
				);
			} catch (err) {
				checkMode.set(false, `判定に失敗: ${err?.message ?? err}`);
			}
		} else {
			checkMode.set(false, "前提条件（HTTPS / WebXR API）を満たしていません。");
		}

		// 5. features — requestSession時に検証されるため、ここでは宣言表示
		checkFeatures.set(
			true,
			requiredFeatures.length > 0
				? "開始時に検証します。非対応の場合は理由を表示して停止します。"
				: "",
		);

		supported = secure && hasXr && policyOk && modeOk;

		if (supported) {
			startBtn.disabled = false;
			startBtn.textContent = `${modeLabel}を開始する`;
		} else {
			startBtn.disabled = true;
			startBtn.textContent = "この環境では開始できません";
			showDeviceHint();
		}
		return supported;
	}

	async function startSession() {
		errorBox.classList.remove("show");
		startBtn.disabled = true;
		startBtn.textContent = "セッション開始中…";
		try {
			const session = await navigator.xr.requestSession(mode, {
				requiredFeatures,
				optionalFeatures,
			});
			gate.hidden = true;
			session.addEventListener("end", () => {
				gate.hidden = false;
				startBtn.disabled = false;
				startBtn.textContent = `もう一度${modeLabel}を開始する`;
				pushLog("セッションを終了しました。");
				onSessionEnded?.();
			});
			pushLog(`${modeLabel}セッションを開始しました。`);
			await onSessionStarted?.(session);
			return session;
		} catch (err) {
			const name = err?.name ?? "Error";
			const message = err?.message ?? String(err);
			let advice = "";
			if (name === "NotSupportedError") {
				advice = `\n→ 必須機能（${requiredFeatures.join(", ") || "なし"}）のいずれかにこの端末が対応していない可能性が高いです。`;
			} else if (name === "SecurityError") {
				advice =
					"\n→ ユーザー操作起点でない、または権限ポリシーで拒否されています。全画面リンクから開き直してください。";
			} else if (name === "InvalidStateError") {
				advice = "\n→ 既存のセッションが残っています。ページを再読み込みしてください。";
			}
			showError(
				"セッションを開始できませんでした",
				`${name}: ${message}${advice}`,
			);
			pushLog(`requestSession失敗: ${name}: ${message}`, true);
			startBtn.disabled = false;
			startBtn.textContent = `もう一度${modeLabel}を開始する`;
			return null;
		}
	}

	startBtn.addEventListener("click", () => {
		startSession();
	});

	const preflightPromise = runPreflight();

	return {
		gate,
		startButton: startBtn,
		preflight: preflightPromise,
		log: (message) => pushLog(message),
		error: (message) => pushLog(message, true),
		showGate: () => {
			gate.hidden = false;
		},
		hideGate: () => {
			gate.hidden = true;
		},
	};
}
