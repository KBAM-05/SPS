"use client"

import Link from "next/link"
import { Bell, LogOut, Settings, School, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SchoolHeaderProps {
  notificationsCount: number
  onLogout: () => void
}

export function SchoolHeader({ notificationsCount, onLogout }: SchoolHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/school/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold">학교 하원 관리</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/school/notifications" className="relative">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              {notificationsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                >
                  {notificationsCount}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href="/school/parents">
            <Button variant="ghost" size="icon" title="학부모 관리">
              <Users className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/school/members">
            <Button variant="ghost" size="icon" title="회원 관리">
              <School className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/school/settings">
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
