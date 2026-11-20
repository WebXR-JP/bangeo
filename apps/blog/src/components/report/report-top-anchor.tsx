/**
 * レポートの各ページ（/report・/experiments・/webgpu-report）の先頭に置く目印。
 *
 * Next.js はリンクでページを開いたあと、切り替わったページの先頭の要素が画面に入っていなければ、
 * その要素までスクロールする。レポートは共通レイアウトの結果画像がページ本文より上にあるので、
 * そのままだと他のページから開いたときに結果画像を飛び越えて本文まで進んでしまう。
 * この目印を共通レイアウトの上端に重ねて置くことで、開いた直後は必ず結果画像から見える。
 *
 * 共通レイアウトの外枠（position: relative）を基準に置くので、各ページの最初の要素として描く。
 * タブの切り替え（scroll={false}）と、#spec-… のようなハッシュ付きのリンクには影響しない。
 */
export function ReportTopAnchor() {
	return (
		<span
			aria-hidden="true"
			className="pointer-events-none absolute left-0 top-0 h-px w-px"
		/>
	);
}
