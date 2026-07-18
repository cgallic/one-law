import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "ONE LAW",
  description: "Write one sentence. Watch a civilization obey it perfectly.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
