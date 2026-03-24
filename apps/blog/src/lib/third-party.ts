export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() ?? "";
export const ADSENSE_CLIENT =
	process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() ?? "";

export const HAS_GTM = GTM_ID.length > 0;
export const HAS_ADSENSE = ADSENSE_CLIENT.length > 0;
