import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
	title: "プライバシーポリシー",
	description:
		"BANGEOにおけるOSS公開サイトとしての情報の取り扱い方針と、アクセス解析・広告配信に関するご案内。",
	alternates: { canonical: "/privacy-policy" },
	robots: { index: false, follow: true },
};

/**
 * 本文中の外部リンク。新しいタブで開き、
 * 外向きの矢印と読み上げの補足を付ける。
 * リンクの文字は途中で折らず、行に入らなければ次の行へ送る。
 * wrap は生の URL だけに使う。1行に入る幅なら次の行に1行で出し、
 * 入らない幅（320px）でだけ URL の中で折る。そのとき矢印だけが
 * 次の行に落ちないよう、最後の1文字と矢印を折れない1組にする
 */
function ExternalLink({
	href,
	children,
	wrap = false,
}: {
	href: string;
	children: string;
	wrap?: boolean;
}) {
	const icon = (
		<svg
			className="ml-0.5 inline-block size-3 align-[-0.05em]"
			viewBox="0 0 12 12"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
		</svg>
	);
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`${children}（新しいタブで開く）`}
			className={
				wrap
					? "text-link inline-block wrap-anywhere"
					: "text-link whitespace-nowrap"
			}
		>
			{wrap ? (
				<>
					{children.slice(0, -1)}
					<span className="whitespace-nowrap">
						{children.slice(-1)}
						{icon}
					</span>
				</>
			) : (
				<>
					{children}
					{icon}
				</>
			)}
		</a>
	);
}

/**
 * 見出しと本文のまとまり。
 * 本文は 16px・行間1.8・1行40字まで
 */
function PolicySection({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<section className="mt-12 first:mt-0">
			<h2 className="text-xl font-bold leading-normal text-gray-950 md:text-2xl md:leading-snug">
				{title}
			</h2>
			<div className="mt-3 space-y-4 text-base leading-[1.8] text-gray-700">
				{children}
			</div>
		</section>
	);
}

const listClassName = "list-disc space-y-2 pl-6 marker:text-gray-400";

export default function PrivacyPolicyPage() {
	return (
		<div className="mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-12">
			<BreadcrumbStructuredData
				items={[{ name: "プライバシーポリシー", path: "/privacy-policy" }]}
			/>
			<PageHeader
				title="プライバシーポリシー"
				meta={
					<>
						最終改定日: <time dateTime="2026-11-19">2026年11月19日</time>
					</>
				}
			/>

			<article className="max-w-[40em]">
				<PolicySection title="取得する情報">
					<p>
						当サイト（BANGEO）では、OSS公開サイトの運営および改善のために、以下の情報を取得または参照する場合があります。
					</p>
					<ul className={listClassName}>
						<li>
							ブラウザや端末情報（IPアドレス、ユーザーエージェント、画面解像度、OSなど）
						</li>
						<li>
							GitHub Issues、Pull
							Request、Discussionなどで公開投稿されたアカウント名、投稿内容、添付情報
						</li>
						<li>
							Discord、Xなど外部サービス上でユーザー自身が提供するプロフィール情報や投稿内容
						</li>
					</ul>
				</PolicySection>

				<PolicySection title="利用目的">
					<p>取得した情報は、以下の目的で利用します。</p>
					<ul className={listClassName}>
						<li>サービスの提供、運営および改善</li>
						<li>
							Issue、Pull Request、Discussion、コミュニティ上での問い合わせ対応
						</li>
						<li>不正利用の防止およびセキュリティの維持</li>
						<li>アクセス解析によるコンテンツの品質向上</li>
					</ul>
				</PolicySection>

				<PolicySection title="アクセス解析・タグ管理">
					<p>
						本番サイトの通常ページではBANGEO
						Analyticsを使い、ページの表示とサイト内のページ遷移を計測します。送信するのは、ページのURL（ドメインとパスのみ）・タイトル、参照元のドメイン、表示時刻、ページを開いている間だけ使うセッションID、ブラウザ・OS・端末の種類、画面サイズ、言語・タイムゾーン、WebXRの利用可否などです。端末によっては機種名、メモリ容量、CPUコア数も含まれます。URLのクエリとハッシュ、生のUser-Agent、Cookieは計測データに含めません。エラー内容、描画性能、WebXR体験中の操作は、このサイトの通常計測では収集しません。
					</p>
					<p>
						BANGEO
						Analyticsの受信先はCloudflare上で運用しています。計測データにIPアドレスを記録する項目はありませんが、通信時のIPアドレスなどは配信事業者に届きます。
					</p>
					<p>
						対応レポートの結果画像は、ご利用のブラウザの中で作成します。BANGEOが画像を受け取ることはなく、保存や共有は利用者ご自身の操作で行います。画像には端末名・ブラウザ・GPUの種類が含まれます。
					</p>
					<p>
						当サイトでは、環境設定に応じてGoogle Tag
						Managerを読み込み、必要に応じてGoogle
						Analyticsなどの計測サービスを利用する場合があります。これらのサービスはCookie（クッキー）を使用してデータを収集しますが、通常、当サイト管理者が個人を直接特定する情報は含みません。
					</p>
					<p>
						Cookieの使用を望まない場合は、ブラウザの設定から無効にすることができます。Googleによるデータ収集の詳細については、
						<ExternalLink href="https://policies.google.com/technologies/partner-sites">
							Googleのプライバシーポリシー
						</ExternalLink>
						をご確認ください。
					</p>
				</PolicySection>

				<PolicySection title="広告配信について">
					<p>
						当サイトでは、環境設定に応じてGoogle
						AdSenseによる広告配信を行う場合があります。Google
						AdSenseはCookieを使用して、ユーザーの興味に基づく広告を配信することがあります。Googleがお客様の情報をどのように利用するかについては、
						<ExternalLink href="https://policies.google.com/technologies/ads">
							Google広告に関するポリシー
						</ExternalLink>
						をご確認ください。
					</p>
					<p>
						パーソナライズ広告を無効にしたい場合は、
						<ExternalLink href="https://www.google.com/settings/ads">
							Googleの広告設定
						</ExternalLink>
						から設定を変更できます。
					</p>
				</PolicySection>

				<PolicySection title="第三者提供">
					<p>
						法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供することはありません。
					</p>
				</PolicySection>

				<PolicySection title="外部サービス">
					<p>
						当サイトにはGitHub、Discord、Xなどの外部サービスへのリンクが含まれます。リンク先のサイトにおける個人情報の取り扱いについては、各サービスのプライバシーポリシーをご確認ください。当サイトは外部サービスの内容や個人情報の取り扱いについて責任を負いません。
					</p>
				</PolicySection>

				<PolicySection title="お問い合わせ">
					<p>
						本ポリシーやサイト運営に関するご連絡は、公開リポジトリまたはコミュニティ窓口からお願いします。
					</p>
					<p>
						GitHub:{" "}
						<ExternalLink href="https://github.com/WebXR-JP/bangeo" wrap>
							https://github.com/WebXR-JP/bangeo
						</ExternalLink>
					</p>
					<p>
						Discord:{" "}
						<ExternalLink href="https://discord.com/invite/9WyRvAwX7B">
							WebXR JP Discord
						</ExternalLink>
					</p>
				</PolicySection>

				<PolicySection title="改定">
					<p>
						本ポリシーは、法令の改正やサービス内容の変更に応じて、予告なく変更する場合があります。変更後のポリシーは、当サイトに掲載された時点で効力を生じるものとします。
					</p>
				</PolicySection>
			</article>
		</div>
	);
}
