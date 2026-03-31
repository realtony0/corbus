import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "CORBUS — For All The Black Birds",
  description:
    "Fashion with Spirit, Style with Meaning. Inspired by the crow, a symbol of mystery, intelligence and freedom.",
  keywords: ["Corbus", "streetwear", "fashion", "crow", "raven", "Senegal"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Cinzel:wght@400;500;600;700&family=Montserrat:wght@200;300;400;500;600;700&family=Poppins:wght@200;300;400;500;600;700&family=Raleway:wght@200;300;400;500;600;700&family=Oswald:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;500;600;700&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Serif+4:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Bodoni+Moda:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Josefin+Sans:wght@200;300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Outfit:wght@200;300;400;500;600;700&family=UnifrakturMaguntia&family=UnifrakturCook:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
