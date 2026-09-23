"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const key = process.env.NEXT_PUBLIC_BANGEO_SITE_ANALYTICS_KEY?.trim() ?? "";
const ingest = "https://bangeo-ingest.peraperapera.workers.dev";

type AnalyticsClient = {
	track(name: string, payload: { props: { path: string } }): void;
	flush(): Promise<void>;
};

declare global {
	interface Window {
		bangeo?: {
			init(options: {
				key: string;
				endpoint: string;
				captureErrors: boolean;
				capturePerformance: boolean;
				captureXr: boolean;
			}): AnalyticsClient;
		};
	}
}

/** The public key is compiled into the production bundle, but only the live host sends data. */
export function SiteAnalytics() {
	const pathname = usePathname();
	const [liveHost, setLiveHost] = useState(false);
	const [client, setClient] = useState<AnalyticsClient | null>(null);
	const lastTrackedPath = useRef<string | null>(null);

	useEffect(() => {
		setLiveHost(
			window.location.protocol === "https:" &&
				window.location.hostname === "www.bangeo.net",
		);
	}, []);

	useEffect(() => {
		if (!liveHost || !client || !pathname || lastTrackedPath.current === pathname) return;
		lastTrackedPath.current = pathname;
		client.track("page_view", { props: { path: pathname } });
		// The SDK attaches the current URL when it flushes. Send each route's
		// event before a later client-side navigation changes that context.
		void client.flush();
	}, [client, liveHost, pathname]);

	if (!/^bg_pk_[a-zA-Z0-9_-]{1,80}$/.test(key) || !liveHost) return null;

	return (
		<Script
			src={`${ingest}/sdk/latest.js`}
			strategy="afterInteractive"
			onReady={() => {
				const analytics = window.bangeo?.init({
					key,
					endpoint: ingest,
					captureErrors: false,
					capturePerformance: false,
					captureXr: false,
				});
				if (analytics) setClient(analytics);
			}}
		/>
	);
}
