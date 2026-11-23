import Link from "next/link";
import { SendToHeadset } from "@/components/send-to-headset";
import {
	type DeviceCheck,
	getExperimentGuideOrDefault,
	type Readiness,
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

/**
 * 状態の色はレポートと同じ3つ（青 = 体験できる / アンバー = 条件や確認が要る / 灰 = 対象外・確認中）にそろえる。
 * 文字（readinessLabel）を必ず添えるので、色だけで伝えることはない
 */
const readinessTone: Record<Readiness, string> = {
	ready: "bg-data-yes-soft text-data-yes-ink",
	lab: "bg-data-ask-soft text-data-ask",
	preview: "bg-data-ask-soft text-data-ask",
	limited: "bg-data-ask-soft text-data-ask",
	unsupported: "bg-gray-100 text-gray-600",
	unknown: "bg-gray-100 text-gray-600",
};

function ReadinessBadge({ readiness }: { readiness: Readiness }) {
	return (
		<span
			className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${readinessTone[readiness]}`}
		>
			{readinessLabel[readiness]}
		</span>
	);
}

function DeviceCard({ item }: { item: DeviceCheck }) {
	return (
		<div className="rounded-xl bg-gray-50 p-4">
			<div className="mb-2 flex items-center justify-between gap-3">
				<p className="text-sm font-bold text-gray-950">{item.label}</p>
				<ReadinessBadge readiness={item.readiness} />
			</div>
			<p className="text-xs leading-relaxed text-gray-600">{item.note}</p>
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
			className="card not-prose mb-12 scroll-mt-32 overflow-hidden"
		>
			<div className="grid gap-0 lg:grid-cols-[1.05fr_1.2fr]">
				<div className="border-b border-gray-100 p-6 md:p-8 lg:border-r lg:border-b-0">
					<div className="mb-4 flex flex-wrap items-center gap-2">
						<ReadinessBadge readiness={guide.statusReadiness} />
						<span className="chip">{trackLabel[guide.track]}</span>
					</div>
					<h2 className="text-2xl font-black leading-snug text-gray-950 md:text-3xl">
						{guide.statusLabel}
					</h2>
					<p className="mt-3 text-sm font-bold leading-relaxed text-gray-800">
						このデモで体験できること：{guide.summary}
					</p>
					<p className="mt-3 text-sm leading-relaxed text-gray-600">
						{guide.intent}
					</p>
					<div className="mt-5 rounded-xl bg-gray-50 p-4">
						<p className="text-xs font-bold text-gray-500">おすすめの環境</p>
						<p className="mt-1 text-base font-bold text-gray-950">
							{guide.primaryDevice}
						</p>
					</div>
					{launchHref && (
						<div className="mt-6 flex flex-col gap-3 sm:flex-row">
							<a href={launchHref} className="btn btn-primary">
								デモを開く
							</a>
							<Link href="/experiments" className="btn btn-secondary">
								WebXR対応レポートを見る
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
						<div className="rounded-xl bg-gray-50 p-5">
							<h3 className="mb-3 text-sm font-bold text-gray-950">
								体験フロー
							</h3>
							<ol className="space-y-3">
								{guide.flow.map((step, index) => (
									<li
										key={step}
										className="flex gap-3 text-xs leading-relaxed text-gray-600"
									>
										<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-950 text-xs font-bold text-white">
											{index + 1}
										</span>
										<span className="pt-0.5">{step}</span>
									</li>
								))}
							</ol>
						</div>

						<div className="rounded-xl bg-gray-50 p-5">
							<h3 className="mb-3 text-sm font-bold text-gray-950">
								うまく動かない場合
							</h3>
							<p className="text-xs leading-relaxed text-gray-600">
								{guide.fallback}
							</p>
							<div className="mt-4 border-t border-gray-200 pt-4">
								<p className="text-xs font-bold text-gray-950">確認ポイント</p>
								<p className="mt-1 text-xs leading-relaxed text-gray-600">
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
