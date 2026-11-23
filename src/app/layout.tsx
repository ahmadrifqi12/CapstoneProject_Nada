import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});
const sans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: { default: "NADA — Abaya minimalis dengan cerita", template: "%s — NADA" },
  description:
    "NADA adalah toko abaya minimalis yang memadukan katalog belanja dengan cerita di balik setiap koleksi.",
  openGraph: { siteName: "NADA", locale: "id_ID", type: "website" },
};

export const viewport: Viewport = { themeColor: "#F6F3EC" };

// Beberapa ekstensi browser (mis. Bitdefender TrafficLight) menyuntikkan atribut seperti
// `bis_skin_checked` ke HTML sebelum React hidrasi, sehingga muncul peringatan "hydration mismatch"
// padahal kode tidak bersalah. Skrip ini membuang atribut tersebut lebih dulu.
const STRIP_EXTENSION_ATTRS = `(function(){var A=["bis_skin_checked","bis_register"];
function strip(n){if(n&&n.removeAttribute){for(var i=0;i<A.length;i++)n.removeAttribute(A[i]);
if(n.attributes){for(var j=n.attributes.length-1;j>=0;j--){if(/^__processed_/.test(n.attributes[j].name))n.removeAttribute(n.attributes[j].name)}}}}
try{new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var m=ms[i];
if(m.type==="attributes")strip(m.target);
else for(var k=0;k<m.addedNodes.length;k++){var n=m.addedNodes[k];strip(n);
if(n.querySelectorAll){var q=n.querySelectorAll("[bis_skin_checked],[bis_register]");for(var x=0;x<q.length;x++)strip(q[x])}}}
}).observe(document,{attributes:true,childList:true,subtree:true})}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: STRIP_EXTENSION_ATTRS }} />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
