import Head from "next/head";
import Script from "next/script";
import { FC, useEffect, useState } from "react";
import { hotjar } from "react-hotjar";
import segmentEvents from "./segment";

interface IBipInsightsProps {}

const BipInsights: FC<IBipInsightsProps> = (props) => {
  useEffect(() => {
    hotjar.initialize(2497716, 6);
    segmentEvents.pageView();
  }, []);

  return (
    <>
      <Head>
        {/* REWARDFUL - start */}
        <Script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
          (function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`,
          }}
        />

        <script
          async
          src="https://r.wdfl.co/rw.js"
          data-rewardful="cb063a"
        ></script>
        {/* REWARDFUL - END */}
      </Head>
      {/* CRISP - start */}
      <Script
        id="crisp-widget"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
window.$crisp=[];
window.CRISP_WEBSITE_ID="8d7624c8-b284-4608-8c81-a02a9d02dcb7";
(function(){
  const d = document;
  const s = d.createElement("script");
  s.src = "https://client.crisp.chat/l.js";
  s.async = 1;
  d.getElementsByTagName("head")[0].appendChild(s);
})();`,
        }}
      />
      {/* CRISP - end */}

      {/* GTAG - start */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-R5F30R1RSQ"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-R5F30R1RSQ');
        `}
      </Script>
      {/* GTAG - end */}
      {/* SEGMENT - start - duplicate */}
      {/* <Script>
        {`!function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="7xP4NRkaP458BZA2FplAUBUOiwYW4NiC";;analytics.SNIPPET_VERSION="4.15.3";
  analytics.load("7xP4NRkaP458BZA2FplAUBUOiwYW4NiC");
  analytics.page();
  }}();`}
      </Script> */}
      {/* SEGMENT - end */}
      {/* Usetiful - start */}
      <Script id="usetiful">
        {`(function (w, d, s) {
    var a = d.getElementsByTagName('head')[0];
    var r = d.createElement('script');
    r.async = 1;
    r.src = s;
    r.setAttribute('id', 'usetifulScript');
    r.dataset.token = "4523fc40275135b06be20b96f54b8141";
                        a.appendChild(r);
  })(window, document, "https://www.usetiful.com/dist/usetiful.js");`}
      </Script>
      {/* Usetiful - end */}
    </>
  );
};

export default BipInsights;
