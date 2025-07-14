import React from "react";
import Navbar from "./Navbar";
import { useLanguage, LanguageProvider } from "../contexts/LanguageContext";
import { translations } from "../data/translations";
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<LayoutProps> = ({ children }) => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-white text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-50 py-6 text-center text-sm text-muted-foreground border-t border-gray-200">
        <div className="container">
          <p>© 2015-2025 VideoSoundEvent UA</p>
        </div>
      </footer>
      <Toaster position="top-right" />
    </div>
  );
};

// Wrapper that provides language context
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LanguageProvider initialTranslations={translations}>
      <LayoutContent>{children}</LayoutContent>
    </LanguageProvider>
  );
};

export default Layout;
