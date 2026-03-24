import { redirect } from "next/navigation";

/**
 * /blog は /tech-articles へリダイレクトする。
 * 旧URLからのアクセスを維持するための互換ルート。
 */
export default function BlogIndexPage() {
	redirect("/tech-articles");
}
