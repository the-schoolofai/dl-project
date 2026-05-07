import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DL Image Classifier",
  description:
    "Diagnostic dashboard for the Rock-Paper-Scissors Keras CNN inference service.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
