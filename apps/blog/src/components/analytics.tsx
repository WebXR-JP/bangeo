"use client";

import Script from "next/script";
import { GTM_ID, HAS_GTM } from "@/lib/third-party";

export function Analytics() {
	if (!HAS_GTM) {
		return null;
	}

	return (
		<>
			{/* Google Tag Manager */}
			<Script id="gtm" strategy="afterInteractive">
				{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
			</Script>
		</>
	);
}

export function GTMNoScript() {
	if (!HAS_GTM) {
		return null;
	}

	return (
		<noscript>
			<iframe
				src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
				height="0"
				width="0"
				title="Google Tag Manager"
				style={{ display: "none", visibility: "hidden" }}
			/>
		</noscript>
	);
}
