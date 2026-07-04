import Link from "next/link";
import { SendToHeadset } from "@/components/send-to-headset";
import {
	type DeviceCheck,
	getExperimentGuideOrDefault,
	type Readiness,
	readinessClassName,
	readinessLabel,
	trackLabel,
} from "@/lib/experiment-guides";
import { SITE_URL } from "@/lib/site-url";

interface ExperimentLaunchPanelProps {
	slug: string;
	title: string;
	href?: string;
	devices?: string[];
}

function ReadinessBadge({ readiness }: { readiness: Readiness }) {
	return (
		<span
			className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black ${readinessClassName[readiness]}`}
		>
			{readinessLabel[readiness]}
		</span>
	);
}

function DeviceCard({ item }: { item: DeviceCheck }) {
	return (
		<div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-100/60">
			<div className="mb-2 flex items-center justify-between gap-3">
				<p className="text-sm font-black text-gray-950">{item.label}</p>
				<ReadinessBadge readiness={item.readiness} />
			</div>
			<p className="text-xs leading-relaxed text-gray-500">{item.note}</p>
		</div>
	);
}

export function ExperimentLaunchPanel({
	slug,
	title,
	href,
	devices,
}: ExperimentLaunchPanelProps) {
	const guide = getExperimentGuideOrDefault(slug, { href, devices });
	const launchHref = guide.launchHref ?? href;
	const absoluteLaunchUrl = launchHref
		? launchHref.startsWith("http")
			? launchHref
			: `${SITE_URL}${launchHref}`
		: undefined;

	return (
		<section
			id="status"
			className="not-prose mb-12 scroll-mt-32 overflow-hidden rounded-[2rem] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-sky-50 shadow-xl shadow-rose-100/40"
		>
			<div className="grid gap-0 lg:grid-cols-[1.05fr_1.2fr]">
				<div className="border-b border-rose-100 bg-white/70 p-6 md:p-8 lg:border-r lg:border-b-0">
					<div className="mb-4 flex flex-wrap items-center gap-2">
						<ReadinessBadge readiness={guide.statusReadiness} />
						<span className="rounded-full bg-gray-950 px-3 py-1 text-[10px] font-black tracking-[0.16em] text-white uppercase">
							{trackLabel[guide.track]}
						</span>
					</div>
					<h2 className="text-2xl font-black tracking-tight text-gray-950 md:text-3xl">
						{guide.statusLabel}
					</h2>
					<p className="mt-3 text-sm font-bold leading-relaxed text-gray-800">
						このデモで体験できること: {guide.summary}
					</p>
					<p className="mt-3 text-sm leading-relaxed text-gray-600">
						{guide.intent}
					</p>
					<div className="mt-5 rounded-2xl border border-white bg-white/80 p-4">
						<p className="text-[11px] font-black tracking-[0.18em] text-gray-400 uppercase">
							おすすめの環境
						</p>
						<p className="mt-1 text-base font-black text-gray-950">
							{guide.primaryDevice}
						</p>
					</div>
					{launchHref && (
						<div className="mt-6 flex flex-col gap-3 sm:flex-row">
							<a
								href={launchHref}
								className="inline-flex items-center justify-center rounded-full bg-[#e11d48] px-6 py-3 text-sm font-black text-white shadow-lg shadow-rose-200 transition hover:bg-[#be123c]"
							>
								デモを開く
							</a>
							<Link
								href="/experiments"
								className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-black text-gray-700 transition hover:border-rose-200 hover:text-[#e11d48]"
							>
								デモ一覧に戻る
							</Link>
						</div>
					)}
					<p className="mt-4 text-xs leading-relaxed text-gray-500">
						XRを開始できない場合は、ブラウザや端末の対応状況をご確認ください。対応デバイスで開くと、より正確に体験を確認できます。
					</p>
				</div>

				<div className="p-6 md:p-8">
					<div className="mb-6 grid gap-3 md:grid-cols-3">
						{guide.deviceChecks.map((item) => (
							<DeviceCard key={`${title}-${item.label}`} item={item} />
						))}
					</div>

					<div className="mb-6 grid gap-4 md:grid-cols-2">
						<div className="rounded-2xl border border-gray-100 bg-white/85 p-5">
							<h3 className="mb-3 text-sm font-black text-gray-950">
								体験フロー
							</h3>
							<ol className="space-y-3">
								{guide.flow.map((step, index) => (
									<li
										key={step}
										className="flex gap-3 text-xs leading-relaxed text-gray-600"
									>
										<span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-950 text-[10px] font-black text-white">
											{index + 1}
										</span>
										<span>{step}</span>
									</li>
								))}
							</ol>
						</div>

						<div className="rounded-2xl border border-gray-100 bg-white/85 p-5">
							<h3 className="mb-3 text-sm font-black text-gray-950">
								うまく動かない場合
							</h3>
							<p className="text-xs leading-relaxed text-gray-600">
								{guide.fallback}
							</p>
							<div className="mt-4 rounded-xl bg-gray-950 p-4 text-white">
								<p className="text-[11px] font-black tracking-[0.16em] text-rose-200 uppercase">
									確認ポイント
								</p>
								<p className="mt-2 text-xs leading-relaxed text-gray-100">
									{guide.qualityCheck}
								</p>
							</div>
						</div>
					</div>

					{absoluteLaunchUrl && <SendToHeadset url={absoluteLaunchUrl} />}
				</div>
			</div>
		</section>
	);
}
