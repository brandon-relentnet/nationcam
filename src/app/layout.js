import "../css/globals.css";
import Navbar from "@/components/navbar/Navbar";
import { ThemeProvider } from 'next-themes';

export const metadata = {
  title: "NationCam",
  description: "View cameras from around the USA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-full">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Navbar />
          <main>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
