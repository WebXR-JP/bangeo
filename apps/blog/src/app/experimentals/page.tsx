import type { Metadata } from "next";
import Link from "next/link";
import { ExperimentalFeatureLab } from "./webxr-feature-lab";

export const metadata: Metadata = {
	title: "WebXR実験室｜対応機能からデモへ進む",
	description:
		"WebXR対応デバイスで開いて、VR/AR/Hand Tracking/Hit Testなどの対応状況を確認しながら、対応した機能のデモへ進むための実験ポータルです。",
	openGraph: {
		title: "WebXR実験室｜対応機能からデモへ進む",
		description:
			"WebXR対応デバイスで開いて、対応している機能の横からデモへ進める実験ポータル。",
		type: "website",
	},
	alternates: { canonical: "/experimentals" },
};

const flowSteps = [
	{
		label: "01",
		title: "この端末で開く",
		description:
			"Meta Quest、PICO、Android Chrome、PCVRなど、実際に試したいブラウザでこのページを開きます。",
	},
	{
		label: "02",
		title: "対応を見る",
		description:
			"WebXRのセッションモードと主要モジュールをその場で判定し、対応・条件付き・未対応を分けます。",
	},
	{
		label: "03",
		title: "横のデモへ進む",
		description:
			"各機能の横にデモ入口を置く設計です。今は準備中表示にして、デモが増えたらURLを差し込むだけにします。",
	},
];

const deviceLanes = [
	{
		name: "Meta Quest / PICO",
		copy: "単体ブラウザでVR/ARの入口を確認。まずは immersive-vr と immersive-ar を見る場所。",
		mode: "Headset first",
	},
	{
		name: "Android + Chrome",
		copy: "ARCore系のAR体験を確認。Hit Test、Anchors、Depthなどをデモ単位で増やす想定。",
		mode: "AR first",
	},
	{
		name: "PC + VR runtime",
		copy: "SteamVR / Quest Link 経由のPCVR確認。ブラウザだけではなく接続状態も含めて見る入口。",
		mode: "PCVR check",
	},
];

export default function ExperimentalsPage() {
	return (
		<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<header className="mb-12 overflow-hidden rounded-[2.5rem] border border-rose-100 bg-gradient-to-br from-white via-rose-50/60 to-gray-50 p-6 shadow-xs md:p-10">
				<div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
					<div>
						<p className="mb-3 text-xs font-black tracking-[0.28em] text-rose-600 uppercase">
							WebXR Experimentals
						</p>
						<h1 className="max-w-3xl text-3xl font-black tracking-tight text-gray-950 md:text-5xl md:leading-[1.08]">
							対応している機能から、すぐデモへ進む実験室
						</h1>
						<p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-gray-600 md:text-lg">
							デモを記事として読む前に、まずWebXR対応デバイスでこのページを開く。ここで「今この端末で何が動くか」を見て、対応している機能の横からデモへ入れる形にします。
						</p>
						<div className="mt-7 flex flex-wrap gap-3">
							<a
								href="#feature-lab"
								className="inline-flex items-center rounded-full bg-gray-950 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#e11d48]"
							>
								この端末で判定する
							</a>
							<Link
								href="/devices/submit"
								className="inline-flex items-center rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-800 transition hover:border-rose-200 hover:text-[#e11d48]"
							>
								詳しい対応チェックを見る
							</Link>
						</div>
					</div>

					<div className="rounded-[2rem] border border-white bg-white/80 p-5 shadow-xs backdrop-blur">
						<p className="mb-4 text-xs font-black tracking-[0.22em] text-gray-400 uppercase">
							How this page works
						</p>
						<div className="space-y-3">
							{flowSteps.map((step) => (
								<div
									key={step.label}
									className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4"
								>
									<div className="mb-2 flex items-center gap-3">
										<span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-xs font-black text-rose-700">
											{step.label}
										</span>
										<h2 className="text-sm font-black text-gray-950">
											{step.title}
										</h2>
									</div>
									<p className="text-xs font-medium leading-relaxed text-gray-500">
										{step.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</header>

			<section className="mb-10 grid gap-4 md:grid-cols-3">
				{deviceLanes.map((lane) => (
					<div
						key={lane.name}
						className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-xs"
					>
						<p className="mb-3 inline-flex rounded-full bg-rose-50 px-3 py-1 text-[10px] font-black tracking-[0.14em] text-rose-700 uppercase">
							{lane.mode}
						</p>
						<h2 className="text-lg font-black text-gray-950">{lane.name}</h2>
						<p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
							{lane.copy}
						</p>
					</div>
				))}
			</section>

			<ExperimentalFeatureLab />

			<section className="mt-12 rounded-[2rem] border border-dashed border-rose-200 bg-rose-50/50 p-8 text-center md:p-12">
				<p className="text-xs font-black tracking-[0.28em] text-rose-500 uppercase">
					Demo slots are empty
				</p>
				<h2 className="mt-3 text-2xl font-black tracking-tight text-gray-950">
					デモはこれから追加する前提のページです
				</h2>
				<p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-gray-600">
					今は各機能の横に「Demo 準備中」を置いています。デモを作ったら、対応する項目にURLを入れるだけで、WebXR対応デバイスから直接体験へ進めます。
				</p>
			</section>
		</div>
	);
}
