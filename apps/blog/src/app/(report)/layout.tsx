import type { ReactNode } from "react";
import { ReportCard } from "@/components/report/report-card";
import { ReportProvider } from "@/components/report/report-provider";
import { ReportTabs } from "@/components/report/report-tabs";

/**
 * レポート（/report・/experiments・/webgpu-report）の共通レイアウト。
 * 判定と結果画像をここに置くことで、タブを切り替えても判定をやり直さない。
 * ルートグループなので URL には現れない。
 *
 * 外枠の relative は、各ページの先頭に置く ReportTopAnchor の基準。
 * リンクで開いたときに、結果画像を飛び越えずに上端から見えるようにしている。
 * 下の余白はフッター側（mt-16 md:mt-24）が持つので、ここでは付けない。
 */
export default function ReportLayout({ children }: { children: ReactNode }) {
	return (
		<ReportProvider>
			<div className="relative mx-auto max-w-4xl px-5 pt-8 md:px-8 md:pt-12">
				<ReportCard />
				<ReportTabs />
				<div id="report-content" className="scroll-mt-28 pt-8">
					{children}
				</div>
			</div>
		</ReportProvider>
	);
}
