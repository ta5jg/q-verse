import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Simple metadata to avoid heavy server processing
export const metadata = {
  title: "Q-Verse | Quantum-Safe Hybrid Finance",
  description: "The Future of Hybrid Finance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f] text-white font-sans antialiased">
        <Navbar />
        <main className="min-h-screen pt-20">
            {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
