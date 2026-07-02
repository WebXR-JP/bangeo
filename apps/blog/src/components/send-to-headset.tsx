import QRCode from "qrcode";
import { CopyUrlButton } from "@/components/copy-url-button";

interface SendToHeadsetProps {
	/** ヘッドセットで開かせたい絶対URL（通常はデモの全画面URL） */
	url: string;
	label?: string;
}

/**
 * PCで説明ページを読んでいる人が、ヘッドセットのブラウザにURLを渡すためのブロック。
 * QRコードはビルド時にSVG生成される（ランタイム依存なし）。
 */
export async function SendToHeadset({
	url,
	label = "ヘッドセットのブラウザ（Quest Browser / PICO Browser）でカメラまたはQR読み取りからこのコードを開くと、デモの全画面ページに直接入れます。",
}: SendToHeadsetProps) {
	const svg = await QRCode.toString(url, {
		type: "svg",
		errorCorrectionLevel: "M",
		margin: 1,
		width: 148,
		color: { dark: "#030712", light: "#ffffff" },
	});

	return (
		<div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white/85 p-5 sm:flex-row sm:items-center">
			<div
				className="mx-auto h-[120px] w-[120px] shrink-0 overflow-hidden rounded-xl border border-gray-100 sm:mx-0 [&>svg]:h-full [&>svg]:w-full"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: qrcodeライブラリがビルド時に生成する静的SVG
				dangerouslySetInnerHTML={{ __html: svg }}
			/>
			<div className="min-w-0">
				<h3 className="mb-1.5 text-sm font-black text-gray-950">
					ヘッドセットに送る
				</h3>
				<p className="mb-3 text-xs leading-relaxed text-gray-600">{label}</p>
				<div className="flex flex-wrap items-center gap-2">
					<CopyUrlButton url={url} />
					<code className="min-w-0 truncate rounded-lg bg-gray-50 px-3 py-2 text-[11px] text-gray-500">
						{url}
					</code>
				</div>
			</div>
		</div>
	);
}
