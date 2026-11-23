import Link from "next/link";
import { PageHeader } from "@/components/page-header";

/**
 * 記事もデモも付いていないタグ（存在しないタグ、下書きにだけ付いたタグ）を開いたとき。
 * 状態は 404 のまま、何が起きたかと次にできることを出す
 */
export default function TagNotFound() {
	return (
		<div className="max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-12">
			<PageHeader
				kicker="タグ"
				title="このタグの技術記事とデモはありません"
				lead="このタグが付いた技術記事とデモは、いま公開していません。ほかのタグから探してください。"
				actions={
					<Link href="/tags" className="btn btn-secondary">
						タグ一覧を見る
					</Link>
				}
				className="mb-0"
			/>
		</div>
	);
}
