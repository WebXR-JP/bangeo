import type { Metadata } from "next";
import Link from "next/link";
import { OptimizedImage } from "@/components/optimized-image";
import {
	AR_DEVICES,
	type DeviceWebxrSummary,
	VR_DEVICES,
} from "@/data/devices";

export const metadata: Metadata = {
	title: "対応デバイス一覧",
	description:
		"WebXR に対応する VR ヘッドセットやスマートフォンの対応状況、ブラウザ、接続方式をまとめた一覧です。",
	alternates: { canonical: "/devices" },
};

function DeviceCard({ device }: { device: DeviceWebxrSummary }) {
	const isSupported = device.webxrSupport.status === "対応";

	return (
		<article className="p-8 md:p-10 bg-white/70 border border-white rounded-[2.5rem] shadow-xs hover:shadow-xl transition-all duration-500">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div className="space-y-2">
					<div className="text-[10px] font-black text-[#e11d48] uppercase tracking-widest">
						{device.type} / {device.manufacturer}
					</div>
					<h3 className="text-2xl md:text-3xl font-black text-gray-900">
						{device.name}
					</h3>
				</div>
				<span
					className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-black border ${
						isSupported
							? "bg-emerald-50 text-emerald-700 border-emerald-100"
							: "bg-rose-50 text-rose-700 border-rose-100"
					}`}
				>
					WebXR: {device.webxrSupport.status}
				</span>
			</div>
			<p className="mt-4 text-sm text-gray-600 leading-relaxed">
				{device.webxrSupport.detail}
			</p>

			<div className="mt-8 grid gap-8 md:grid-cols-2">
				<div className="space-y-6">
					<div>
						<h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
							対応ブラウザ
						</h4>
						<ul className="mt-2 space-y-2 text-sm text-gray-600 leading-relaxed">
							{device.browsers.map((browser) => (
								<li key={browser} className="flex gap-2">
									<span className="text-[#e11d48] mt-1">&bull;</span>
									<span>{browser}</span>
								</li>
							))}
						</ul>
					</div>
					<div>
						<h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
							接続タイプ
						</h4>
						<p className="mt-2 text-sm text-gray-600 leading-relaxed">
							{device.connectionType}
						</p>
					</div>
					<div>
						<h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
							価格帯
						</h4>
						<p className="mt-2 text-sm text-gray-600 leading-relaxed">
							{device.priceRange}
						</p>
					</div>
					<div>
						<h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
							入手可能性
						</h4>
						<p className="mt-2 text-sm text-gray-600 leading-relaxed">
							{device.availability}
						</p>
					</div>
				</div>

				<div className="space-y-6">
					<div>
						<h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
							特徴・注意点
						</h4>
						<ul className="mt-2 space-y-2 text-sm text-gray-600 leading-relaxed">
							{device.notes.map((note) => (
								<li key={note} className="flex gap-2">
									<span className="text-[#e11d48] mt-1">&bull;</span>
									<span>{note}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</article>
	);
}

export default function DevicesPage() {
	return (
		<div className="relative px-4 md:px-6 py-16 md:py-20 max-w-7xl mx-auto overflow-hidden">
			<OptimizedImage
				src="/assets/mascot/hero.png"
				alt=""
				width={384}
				height={384}
				sizes="384px"
				className="absolute top-20 -left-20 w-96 h-96 opacity-[0.02] pointer-events-none -rotate-12"
			/>
			<div className="space-y-24 relative z-10">
				{/* Header */}
				<header className="text-center max-w-4xl mx-auto space-y-8">
					<h1 className="text-4xl md:text-6xl font-black tracking-tighter flex items-center justify-center gap-4">
						対応デバイス一覧
					</h1>
					<p className="text-xl md:text-2xl text-gray-500 font-medium leading-relaxed">
						WebXR に対応する VR
						ヘッドセットやスマートフォンを、ブラウザ、接続方式、特徴とあわせて確認できます。
					</p>
					<Link
						href="/devices/submit"
						className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-[#e11d48] transition-all shadow-lg"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						お使いのデバイスのWebXR対応状況を確認
					</Link>
				</header>

				{/* VR Section */}
				<section className="space-y-10">
					<h2 className="text-3xl font-black tracking-tight border-l-4 border-[#e11d48] pl-6 ml-2">
						VRヘッドセットのWebXR対応まとめ
					</h2>
					<div className="space-y-6">
						{VR_DEVICES.map((device) => (
							<DeviceCard key={device.id} device={device} />
						))}
					</div>
					<div className="max-w-4xl text-sm text-gray-500 leading-relaxed">
						<p>
							現時点では、Quest 系、HTC Vive 系、Pico 系、Valve Index、Windows
							MR などの主要 HMD では、WebXR
							を利用できる環境が用意されています。一方で、PlayStation VR/VR2 や
							HTC Vive Flow
							のように、ブラウザ経由での利用が難しい機種もあります。
						</p>
					</div>
				</section>

				{/* AR Section */}
				<section className="space-y-10">
					<h2 className="text-3xl font-black tracking-tight border-l-4 border-[#e11d48] pl-6 ml-2">
						スマートフォン/ARデバイスのWebXR対応
					</h2>
					<p className="text-sm text-gray-500 leading-relaxed max-w-4xl">
						スマートフォンでの WebXR AR
						は、端末とブラウザの組み合わせによって利用条件が大きく変わります。特に
						iOS では、ブラウザ以外の手段を検討する必要があるケースもあります。
					</p>
					<div className="space-y-6">
						{AR_DEVICES.map((device) => (
							<DeviceCard key={device.id} device={device} />
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
