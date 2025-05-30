"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getCurrentUser,
  logout as authLogout,
  savePickupRequest,
  generateId,
  type ParentUser,
  type PickupRequest,
} from "@/lib/auth"
import { ParentHeader } from "@/components/parent-header"
import { CheckCircle2 } from "lucide-react"

export default function ParentDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<ParentUser | null>(null)
  const [selectedChild, setSelectedChild] = useState<string>("")
  const [note, setNote] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.type !== "parent") {
      router.push("/login/parent")
      return
    }
    setCurrentUser(user as ParentUser)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    setIsSubmitting(true)

    try {
      const selectedChildData = currentUser.children.find((c) => c.id === selectedChild)
      if (!selectedChildData) {
        throw new Error("선택된 아이 정보를 찾을 수 없습니다.")
      }

      const pickupRequest: PickupRequest = {
        id: generateId(),
        childId: selectedChild,
        childName: selectedChildData.name,
        childClass: selectedChildData.class,
        parentId: currentUser.id,
        parentName: currentUser.name,
        parentPhone: currentUser.phone,
        pickupTime: "즉시", // Hardcoded to "즉시"
        requestTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        note: note || undefined,
        status: "pending",
        schoolId: currentUser.schoolId,
      }

      savePickupRequest(pickupRequest)

      // 성공 상태로 변경
      setIsSuccess(true)

      // 폼 초기화
      setTimeout(() => {
        setIsSuccess(false)
        setSelectedChild("")
        setNote("")
      }, 5000)
    } catch (err) {
      console.error("하원 요청 중 오류 발생:", err)
      alert("하원 요청 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    authLogout()
    router.push("/")
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ParentHeader onLogout={handleLogout} />

      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">안녕하세요, {currentUser.name}님!</h1>
          <p className="text-muted-foreground">아이의 하원을 관리하세요</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>하원 요청</CardTitle>
                <CardDescription>아이의 하원을 요청하세요</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <CheckCircle2 className="mb-2 h-12 w-12 text-green-500" />
                      <h3 className="text-xl font-medium">하원 요청이 완료되었습니다</h3>
                      <p className="text-muted-foreground">학교에서 요청을 확인하고 아이를 준비시킬 것입니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">아이 선택</label>
                        <select
                          id="pickup-child"
                          className="w-full px-3 py-2 border border-input rounded-md"
                          required
                          value={selectedChild}
                          onChange={(e) => setSelectedChild(e.target.value)}
                        >
                          <option value="">아이를 선택하세요</option>
                          {currentUser.children.map((child) => (
                            <option key={child.id} value={child.id}>
                              {child.name} ({child.class})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">메모 (선택사항)</label>
                        <textarea
                          id="pickup-note"
                          placeholder="특이사항이 있으면 입력하세요 (예: 할머니가 데리러 갑니다)"
                          className="w-full px-3 py-2 border border-input rounded-md"
                          rows="3"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {!isSuccess && (
                    <Button type="submit" className="w-full" disabled={isSubmitting || !selectedChild}>
                      {isSubmitting ? "요청 중..." : "하원 요청하기"}
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>아이 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentUser.children.map((child) => (
                    <div key={child.id} className="p-4 border rounded-lg">
                      <h3 className="text-lg font-medium">{child.name}</h3>
                      <p className="text-sm text-muted-foreground">반: {child.class}</p>
                      <p className="text-sm text-muted-foreground">기본 하원 시간: {child.defaultPickupTime}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>학교 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>학교 코드:</strong> {currentUser.schoolCode}
                  </p>
                  <p className="text-sm">
                    <strong>연락처:</strong> {currentUser.phone}
                  </p>
                  <p className="text-sm">
                    <strong>이메일:</strong> {currentUser.email}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>최근 하원 기록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-primary/10 p-2"></div>
                    <div>
                      <p className="font-medium">
                        {new Date().toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "long",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">하원 기록이 여기에 표시됩니다</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
