"use client"

import Link from "next/link"
import { LogOut, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ParentHeaderProps {
  onLogout: () => void
}

export function ParentHeader({ onLogout }: ParentHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/parent/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold">학부모 하원 관리</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/parent/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/parent/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </nav>
      </div>
    </header>
  )
}
