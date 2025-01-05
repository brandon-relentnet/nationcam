import Footer from "@/components/Footer";
import "../css/globals.css";
import Navbar from "@/components/navbar/Navbar";
import { ThemeProvider } from 'next-themes';
import { GoogleAnalytics } from '@next/third-parties/google'

export const metadata = {
  title: "NationCam",
  description: "View cameras from around the USA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-full">
        <GoogleAnalytics gaId="G-8BQ544Y6TW" />
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
      
    </html>
  );
}
