/**
 * 旧パスの後方互換用。実体は webxr-starter/ に分割済み。
 * 新規コードは "@/lib/webxr-starter/session" を直接importする。
 */

export { startStarterSession } from "./webxr-starter/session";
export type {
	StarterConfig,
	StarterSessionHandle,
} from "./webxr-starter/types";
