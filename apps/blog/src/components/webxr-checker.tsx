"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { reportStatusLabel } from "@/lib/report/summary";
import type { SpecCheckId, SpecSupport } from "@/lib/webxr-spec-catalog";
import { checkWebXRSupport } from "@/lib/webxr-support";
import { MarkBadge, supportToMark } from "./report/report-mark";

interface ModuleResult {
	id: WebXRModuleId;
	name: string;
	support: SpecSupport;
}

export type XRSessionMode = "inline" | "immersive-vr" | "immersive-ar";

export type WebXRModuleId =
	| "webxr-core"
	| "webxr-gamepads"
	| "webxr-ar"
	| "webxr-hit-test"
	| "webxr-dom-overlays"
	| "webxr-layers"
	| "webxr-anchors"
	| "webxr-lighting-estimation"
	| "webxr-hand-input"
	| "webxr-body-tracking"
	| "webxr-webgpu-bindings";

interface SessionResult {
	id: XRSessionMode;
	name: string;
	support: SpecSupport;
}

interface ModuleCheck {
	id: WebXRModuleId;
	name: string;
	specId?: SpecCheckId;
	check?: () => SpecSupport;
}

export interface WebXRCheckerDemoLink {
	href?: string;
	label?: string;
	note?: string;
}

export type WebXRCheckerDemoLinks = Partial<
	Record<XRSessionMode | WebXRModuleId, WebXRCheckerDemoLink>
>;

type MinimalXRSession = EventTarget;

interface MinimalXRSystem {
	isSessionSupported(mode: XRSessionMode): Promise<boolean>;
	requestSession(mode: XRSessionMode): Promise<MinimalXRSession>;
}

type NavigatorWithXR = Navigator & { xr?: MinimalXRSystem };

const nav =
	typeof navigator !== "undefined" ? (navigator as NavigatorWithXR) : null;

function getXR() {
	return nav?.xr ?? null;
}

const moduleChecks: ModuleCheck[] = [
	{
		id: "webxr-core",
		name: "WebXR基本機能",
		check: () => (getXR() ? "supported" : "unsupported"),
	},
	{
		id: "webxr-gamepads",
		name: "コントローラー入力",
		specId: "gamepads",
	},
	{
		id: "webxr-ar",
		name: "AR表示",
		specId: "immersive-ar",
	},
	{
		id: "webxr-hit-test",
		name: "床・机などの面検出",
		specId: "hit-test",
	},
	{
		id: "webxr-dom-overlays",
		name: "AR中の画面UI表示",
		specId: "dom-overlays",
	},
	{
		id: "webxr-layers",
		name: "高品質なレイヤー表示",
		specId: "layers",
	},
	{
		id: "webxr-anchors",
		name: "空間アンカー",
		specId: "anchors",
	},
	{
		id: "webxr-lighting-estimation",
		name: "照明推定",
		specId: "lighting-estimation",
	},
	{
		id: "webxr-hand-input",
		name: "ハンドトラッキング",
		specId: "hand-input",
	},
	{
		id: "webxr-body-tracking",
		name: "ボディトラッキング",
		specId: "body-tracking",
	},
	{
		id: "webxr-webgpu-bindings",
		name: "WebGPU連携",
		specId: "webgpu-binding",
	},
];

const sessionModes: XRSessionMode[] = [
	"inline",
	"immersive-vr",
	"immersive-ar",
];

/**
 * 判定のバッジ。レポートと同じ印（記号 + 判定の4語 + 青・アンバー・灰）を使う
 */
function Badge({ support }: { support: SpecSupport }) {
	const mark = supportToMark(support);
	return (
		<span
			className="shrink-0"
			title={
				support === "unknown"
					? "この端末では判定できませんでした。セッション開始後に確認が必要です。"
					: undefined
			}
		>
			<MarkBadge mark={mark}>{reportStatusLabel(mark)}</MarkBadge>
		</span>
	);
}

function DemoLink({ demo }: { demo?: WebXRCheckerDemoLink }) {
	if (!demo?.href) {
		return (
			<span
				className="inline-flex min-h-10 items-center justify-center rounded-full border border-dashed border-gray-200 px-3 text-xs font-bold text-gray-500"
				title={demo?.note}
			>
				デモはまだありません
			</span>
		);
	}

	return (
		<a
			href={demo.href}
			className="btn btn-dark btn-sm rounded-full"
			title={demo.note}
		>
			{demo.label ?? "デモ"}
			<span aria-hidden="true">↗</span>
		</a>
	);
}

interface WebXRCheckerProps {
	demoLinks?: WebXRCheckerDemoLinks;
	showDemoLinks?: boolean;
}

export function WebXRChecker({
	demoLinks,
	showDemoLinks = false,
}: WebXRCheckerProps = {}) {
	const [loading, setLoading] = useState(true);
	const [modules, setModules] = useState<ModuleResult[]>(() =>
		moduleChecks.map((mod) => ({
			id: mod.id,
			name: mod.name,
			support: "checking",
		})),
	);
	const [sessions, setSessions] = useState<SessionResult[]>(() =>
		sessionModes.map((mode) => ({
			id: mode,
			name: mode,
			support: "checking",
		})),
	);
	const [userAgent, setUserAgent] = useState("");
	const [sessionActive, setSessionActive] = useState<string | null>(null);
	const [sessionError, setSessionError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setUserAgent(navigator.userAgent);

		const results: Partial<Record<SpecCheckId, SpecSupport>> = {};

		checkWebXRSupport((id, support) => {
			results[id] = support;
			if (cancelled) return;

			setModules(
				moduleChecks.map((mod) => ({
					id: mod.id,
					name: mod.name,
					support: mod.check
						? mod.check()
						: mod.specId
							? (results[mod.specId] ?? "checking")
							: "unknown",
				})),
			);
			setSessions(
				sessionModes.map((mode) => ({
					id: mode,
					name: mode,
					support: results[mode] ?? "checking",
				})),
			);
		}, 3000).finally(() => {
			if (!cancelled) setLoading(false);
		});

		return () => {
			cancelled = true;
		};
	}, []);

	const anySupported = sessions.some(
		(session) => session.support === "supported",
	);
	const anyInconclusive = sessions.some(
		(session) =>
			session.support === "unknown" || session.support === "checking",
	);
	const webxrState = anySupported
		? "supported"
		: anyInconclusive
			? "unknown"
			: "unsupported";
	const statusTitle =
		webxrState === "supported"
			? "WebXRに対応しています"
			: webxrState === "unknown"
				? "WebXRの対応を判定できませんでした"
				: "WebXRに未対応です";
	const statusTone =
		webxrState === "supported"
			? "text-gray-950"
			: webxrState === "unknown"
				? "text-data-ask"
				: "text-gray-600";
	// 見出しで判定を言い切り、説明では次にできることだけを言う
	const statusDescription =
		webxrState === "supported"
			? "使える機能と開始できるモードは、下の一覧のとおりです。"
			: webxrState === "unknown"
				? "端末やブラウザの設定を見直すか、WebXRに対応したデバイスで開いてください。"
				: "WebXRに対応したブラウザ（Meta Quest Browser、AndroidのChrome）で開いてください。";

	async function startSession(mode: XRSessionMode) {
		const xr = getXR();
		if (!xr) return;
		try {
			const session = await xr.requestSession(mode);
			setSessionActive(mode);
			setSessionError(null);
			session.addEventListener("end", () => {
				setSessionActive(null);
			});
		} catch (err) {
			setSessionError(
				err instanceof Error
					? err.message
					: "ブラウザからエラーの内容が返りませんでした。",
			);
		}
	}

	// モード名を「immersive-」「vr」のように途中で割らない
	const codeClass =
		"whitespace-nowrap rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700";

	return (
		<>
			<div className="card p-6 md:p-8">
				{loading ? (
					<p
						role="status"
						className="flex items-center gap-3 text-sm font-bold text-gray-700"
					>
						<span
							aria-hidden="true"
							className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-gray-950"
						/>
						判定しています
					</p>
				) : (
					<>
						{/* 見出しと同じ組み方（詰め組み・文節改行・行の長さの均等化）にする */}
						<p
							className={`break-phrase text-2xl font-black text-balance [font-feature-settings:'palt'] ${statusTone}`}
						>
							{statusTitle}
						</p>
						<p className="mt-2 max-w-[40em] break-phrase text-sm leading-relaxed text-gray-600">
							{statusDescription}
						</p>
					</>
				)}
			</div>

			<div className="card p-6 md:p-8">
				<h2 className="text-2xl font-black leading-snug text-gray-950">
					このブラウザで使える機能
				</h2>
				<p className="mt-2 max-w-[40em] break-phrase text-sm leading-relaxed text-gray-600">
					主なWebXR機能について、このブラウザでの対応を判定した結果です。
				</p>
				<p className="mt-2 max-w-[40em] break-phrase text-xs leading-relaxed text-gray-500">
					一部の機能は端末やブラウザの設定によって利用可否が変わります。「対応」と出た機能も、実際の動作は
					<Link
						href="/experiments"
						className="whitespace-nowrap text-gray-600 underline decoration-gray-300 underline-offset-2 transition-colors hover:text-primary-600 hover:decoration-current"
					>
						WebXR対応レポート
					</Link>
					のデモで確かめてください。
				</p>
				<ul className="mt-4 divide-y divide-gray-100 border-y border-gray-100">
					{modules.map((mod) => (
						<li
							key={mod.id}
							className="flex min-h-12 flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2.5"
						>
							<span className="text-sm font-bold text-gray-950">
								{mod.name}
							</span>
							<span className="flex flex-wrap items-center gap-2">
								<Badge support={mod.support} />
								{showDemoLinks && <DemoLink demo={demoLinks?.[mod.id]} />}
							</span>
						</li>
					))}
				</ul>
			</div>

			<div className="card p-6 md:p-8">
				<h2 className="text-2xl font-black leading-snug text-gray-950">
					VR/ARの開始可否
				</h2>
				<p className="mt-2 max-w-[40em] break-phrase text-sm leading-relaxed text-gray-600">
					いま開いている端末とブラウザで、ブラウザ内表示・VR・ARを開始できるかを判定した結果です。
				</p>
				<ul className="mt-4 divide-y divide-gray-100 border-y border-gray-100">
					{sessions.map((s) => (
						<li
							key={s.id}
							className="flex min-h-14 flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2.5"
						>
							<span className="font-mono text-sm font-bold text-gray-950">
								{s.name}
							</span>
							<span className="flex flex-wrap items-center gap-2">
								<Badge support={s.support} />
								{showDemoLinks && <DemoLink demo={demoLinks?.[s.id]} />}
								{s.support === "supported" && (
									<button
										type="button"
										onClick={() => startSession(s.id)}
										// タッチで押しやすいよう、スマートフォンでは高さ44px
										className="btn btn-dark btn-sm min-h-11 rounded-full sm:min-h-9"
									>
										開始を試す
									</button>
								)}
							</span>
						</li>
					))}
				</ul>

				<div className="mt-6 rounded-xl bg-gray-50 p-5">
					<p className="text-base font-bold text-gray-950">
						「inline」だけが利用できる場合
					</p>
					<p className="mt-2 max-w-[40em] break-phrase text-sm leading-relaxed text-gray-600">
						<code className={codeClass}>inline</code>
						はブラウザ内で3Dシーンを表示するモードです。ヘッドセットでのVRや、カメラを使ったARを開始するには、
						<code className={codeClass}>immersive-vr</code>、
						<code className={codeClass}>immersive-ar</code>
						に対応するデバイスとブラウザが必要です。
					</p>
				</div>
			</div>

			{(sessionActive || sessionError) && (
				<div className="card p-6 md:p-8">
					<h2 className="text-2xl font-black leading-snug text-gray-950">
						セッションを開始した結果
					</h2>
					{sessionActive && (
						<p className="mt-4 rounded-xl bg-gray-50 p-5 font-bold text-gray-950">
							<code className={codeClass}>{sessionActive}</code>を開始しました
						</p>
					)}
					{sessionError && (
						<div className="mt-4 rounded-xl bg-gray-50 p-5">
							<p className="font-bold text-gray-950">開始できませんでした</p>
							<p className="mt-2 text-sm leading-relaxed text-gray-600">
								{sessionError}
							</p>
						</div>
					)}
				</div>
			)}

			{!loading && (
				<details className="text-sm">
					{/* タッチで押しやすいよう、スマートフォンでは高さ44px（文字16px + 上下14px） */}
					<summary className="cursor-pointer py-3.5 text-xs font-bold text-gray-500 transition-colors hover:text-gray-800 sm:py-1">
						ブラウザ情報を表示
					</summary>
					<p className="mt-2 break-all rounded-xl bg-gray-50 px-3 py-2 font-mono text-xs leading-relaxed text-gray-600">
						{userAgent}
					</p>
				</details>
			)}
		</>
	);
}
