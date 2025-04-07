import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <header style={{ backgroundColor: "#ffffff", padding: "12px 20px" }}>
        <img
          src="https://www.metroscg.com/hubfs/Media%20Centre/Logos/PNG%20Logos/Metro%20Supply%20Chain%20Primary%20Logo_Full%20Colour_EN.png"
          alt="Metro Supply Chain Logo"
          style={{ height: "40px" }}
        />
      </header>
      <Component {...pageProps} />
    </>
  );
}
