import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "척추측만증의원 질문게시판",
  description: "척추측만증에 관한 질문과 답변을 확인하세요",
}


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <main className="min-h-screen bg-background">
            <header className="border-b">
              <div className="container flex h-16 items-center px-4">
                <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
                  <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                    홈
                  </Link>
                  <Link href="/faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                    FAQ
                  </Link>
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    관리자
                  </Link>
                </nav>
              </div>
            </header>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
