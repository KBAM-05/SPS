"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, AlertTriangle } from "lucide-react"
import type { PickupRequest } from "@/lib/auth"

interface PickupNotificationProps {
  notification: PickupRequest
  onAcknowledge: () => void
  onProcess?: () => void
}

export function PickupNotification({ notification, onAcknowledge, onProcess }: PickupNotificationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 border-red-200 bg-red-50 shadow-2xl animate-pulse">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <CardTitle className="text-red-700">🚨 하원 요청 알림</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onAcknowledge}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-red-600">새로운 하원 요청이 접수되었습니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-red-700">학생:</span>
              <span className="text-red-900">{notification.childName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-red-700">반:</span>
              <span className="text-red-900">{notification.childClass}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-red-700">요청자:</span>
              <span className="text-red-900">{notification.parentName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-red-700">연락처:</span>
              <span className="text-red-900">{notification.parentPhone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-red-700">요청 시간:</span>
              <span className="text-red-900">{notification.requestTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-red-700">하원 예정:</span>
              <span className="text-red-900">{notification.pickupTime}</span>
            </div>
            {notification.note && (
              <div className="mt-3 p-3 bg-red-100 rounded-lg">
                <span className="font-medium text-red-700">메모:</span>
                <p className="text-red-900 mt-1">{notification.note}</p>
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              onClick={onAcknowledge}
              variant="outline"
              className="flex-1 border-red-300 text-red-700 hover:bg-red-100"
            >
              확인
            </Button>
            {onProcess && (
              <Button onClick={onProcess} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                하원 처리
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
