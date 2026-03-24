import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "プライバシーポリシー",
	description:
		"BANGEO における OSS 公開サイトとしての情報の取り扱い方針と、アクセス解析・広告配信に関するご案内。",
	alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
	return (
		<div className="max-w-4xl mx-auto px-6 md:px-8 py-16 md:py-20">
			{/* Header */}
			<header className="space-y-6 text-center mb-16">
				<h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-950">
					プライバシーポリシー
					<span className="text-[#e11d48]">。</span>
				</h1>
				<p className="text-xl text-gray-500 font-medium leading-relaxed">
					最終更新日: 2026年3月24日
				</p>
			</header>

			{/* Content */}
			<article className="space-y-12">
				{/* 1. 取得する情報 */}
				<section className="space-y-4">
					<h2 className="text-2xl font-black text-gray-950">取得する情報</h2>
					<p className="text-gray-600 leading-relaxed">
						当サイト（BANGEO）では、OSS
						公開サイトの運営および改善のために、以下の情報を取得または参照する場合があります。
					</p>
					<ul className="list-disc pl-6 text-gray-600 leading-relaxed space-y-2">
						<li>
							ブラウザや端末情報（IPアドレス、ユーザーエージェント、画面解像度、OSなど）
						</li>
						<li>
							GitHub Issues、Pull Request、Discussion
							などで公開投稿されたアカウント名、投稿内容、添付情報
						</li>
						<li>
							Discord、X
							など外部サービス上でユーザー自身が提供するプロフィール情報や投稿内容
						</li>
					</ul>
				</section>

				{/* 2. 利用目的 */}
				<section className="space-y-4">
					<h2 className="text-2xl font-black text-gray-950">利用目的</h2>
					<p className="text-gray-600 leading-relaxed">
						取得した情報は、以下の目的で利用します。
					</p>
					<ul className="list-disc pl-6 text-gray-600 leading-relaxed space-y-2">
						<li>サービスの提供、運営および改善</li>
						<li>
							Issue、Pull Request、Discussion、コミュニティ上での問い合わせ対応
						</li>
						<li>不正利用の防止およびセキュリティの維持</li>
						<li>アクセス解析によるコンテンツの品質向上</li>
					</ul>
				</section>

				{/* 3. アクセス解析・タグ管理 */}
				<section className="space-y-4">
					<h2 className="text-2xl font-black text-gray-950">
						アクセス解析・タグ管理
					</h2>
					<p className="text-gray-600 leading-relaxed">
						当サイトでは、環境設定に応じて Google Tag Manager
						を読み込み、必要に応じて Google Analytics
						などの計測サービスを利用する場合があります。これらのサービスは
						Cookie
						（クッキー）を使用してデータを収集しますが、通常、当サイト管理者が個人を直接特定する情報は含みません。
					</p>
					<p className="text-gray-600 leading-relaxed">
						Cookie
						の使用を望まない場合は、ブラウザの設定から無効にすることができます。Google
						によるデータ収集の詳細については、
						<a
							href="https://policies.google.com/technologies/partner-sites"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[#e11d48] hover:underline"
						>
							Googleのプライバシーポリシー
						</a>
						をご確認ください。
					</p>
				</section>

				{/* 4. 広告配信について */}
				<section className="space-y-4">
					<h2 className="text-2xl font-black text-gray-950">
						広告配信について
					</h2>
					<p className="text-gray-600 leading-relaxed">
						当サイトでは、環境設定に応じて Google AdSense
						による広告配信を行う場合があります。Google AdSense は Cookie
						を使用して、ユーザーの興味に基づく広告を配信することがあります。Google
						がお客様の情報をどのように利用するかについては、
						<a
							href="https://policies.google.com/technologies/ads"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[#e11d48] hover:underline"
						>
							Google広告に関するポリシー
						</a>
						をご確認ください。
					</p>
					<p className="text-gray-600 leading-relaxed">
						パーソナライズ広告を無効にしたい場合は、
						<a
							href="https://www.google.com/settings/ads"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[#e11d48] hover:underline"
						>
							Googleの広告設定
						</a>
						から設定を変更できます。
					</p>
				</section>

				{/* 5. 第三者提供 */}
				<section className="space-y-4">
					<h2 className="text-2xl font-black text-gray-950">第三者提供</h2>
					<p className="text-gray-600 leading-relaxed">
						法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供することはありません。
					</p>
				</section>

				{/* 6. 外部サービス */}
				<section className="space-y-4">
					<h2 className="text-2xl font-black text-gray-950">外部サービス</h2>
					<p className="text-gray-600 leading-relaxed">
						当サイトには GitHub、Discord、X
						などの外部サービスへのリンクが含まれます。リンク先のサイトにおける個人情報の取り扱いについては、各サービスのプライバシーポリシーをご確認ください。当サイトは外部サービスの内容やプライバシー慣行について責任を負いません。
					</p>
				</section>

				{/* 7. お問い合わせ */}
				<section className="space-y-4">
					<h2 className="text-2xl font-black text-gray-950">お問い合わせ</h2>
					<p className="text-gray-600 leading-relaxed">
						本ポリシーやサイト運営に関するご連絡は、公開リポジトリまたはコミュニティ窓口からお願いします。
					</p>
					<p className="text-gray-600 leading-relaxed">
						GitHub:{" "}
						<a
							href="https://github.com/WebXR-JP/bangeo"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[#e11d48] hover:underline"
						>
							https://github.com/WebXR-JP/bangeo
						</a>
					</p>
					<p className="text-gray-600 leading-relaxed">
						Discord:{" "}
						<a
							href="https://discord.com/invite/9WyRvAwX7B"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[#e11d48] hover:underline"
						>
							WebXR JP Discord
						</a>
					</p>
				</section>

				{/* 8. 改定 */}
				<section className="space-y-4">
					<h2 className="text-2xl font-black text-gray-950">改定</h2>
					<p className="text-gray-600 leading-relaxed">
						本ポリシーは、法令の改正やサービス内容の変更に応じて、予告なく変更する場合があります。変更後のポリシーは、当サイトに掲載された時点で効力を生じるものとします。
					</p>
				</section>
			</article>
		</div>
	);
}
