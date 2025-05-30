"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SchoolHeader } from "@/components/school-header"
import { PickupNotification } from "@/components/pickup-notification"
import { StudentList } from "@/components/student-list"
import { RefreshCw } from "lucide-react"
import {
  getCurrentUser,
  logout as authLogout,
  getPickupRequestsBySchool,
  updatePickupRequestStatus,
  deletePickupRequest,
  type SchoolUser,
  type PickupRequest,
} from "@/lib/auth"

// 임시 학생 데이터 (실제로는 데이터베이스에서 가져와야 함)
const MOCK_STUDENTS = [
  { id: 1, name: "김민준", class: "돌봄1반", status: "present", parentName: "김철수", parentPhone: "010-1234-5678" },
  { id: 2, name: "이서연", class: "돌봄1반", status: "present", parentName: "이영희", parentPhone: "010-2345-6789" },
  { id: 3, name: "박지호", class: "돌봄1반", status: "present", parentName: "박영수", parentPhone: "010-3456-7890" },
  { id: 4, name: "최수아", class: "돌봄2반", status: "present", parentName: "최민지", parentPhone: "010-4567-8901" },
  { id: 5, name: "정하은", class: "돌봄2반", status: "present", parentName: "정동욱", parentPhone: "010-5678-9012" },
  { id: 6, name: "강도윤", class: "돌봄3반", status: "present", parentName: "강민수", parentPhone: "010-6789-0123" },
  {
    id: 7,
    name: "윤지우",
    class: "돌봄3반",
    status: "picked",
    parentName: "윤서영",
    parentPhone: "010-7890-1234",
    pickupTime: "13:45",
  },
]

const MOCK_CLASSES = ["돌봄1반", "돌봄2반", "돌봄3반"]

export default function SchoolDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<SchoolUser | null>(null)
  const [activeClass, setActiveClass] = useState<string>("all")
  const [notifications, setNotifications] = useState<PickupRequest[]>([])
  const [students, setStudents] = useState(MOCK_STUDENTS)
  const [showNotification, setShowNotification] = useState(false)
  const [latestNotification, setLatestNotification] = useState<PickupRequest | null>(null)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [isPlayingSound, setIsPlayingSound] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 오디오 초기화
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3")
    audioRef.current.volume = 0.7
    audioRef.current.preload = "auto"

    // 사용자 상호작용 감지하여 오디오 활성화
    const enableAudio = () => {
      setAudioEnabled(true)
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            audioRef.current?.pause()
            audioRef.current!.currentTime = 0
          })
          .catch(() => {})
      }
    }

    // 페이지 클릭 시 오디오 활성화
    document.addEventListener("click", enableAudio, { once: true })
    document.addEventListener("keydown", enableAudio, { once: true })

    return () => {
      document.removeEventListener("click", enableAudio)
      document.removeEventListener("keydown", enableAudio)
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current)
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.type !== "school") {
      router.push("/login/school")
      return
    }
    setCurrentUser(user as SchoolUser)

    // 초기 하원 요청 로드
    loadPickupRequests(user.id)
  }, [router])

  useEffect(() => {
    if (!currentUser) return

    console.log("🏫 학교 대시보드 실시간 연동 시작:", currentUser.schoolName)

    // localStorage 변경 감지를 통한 실시간 업데이트
    const handleStorageChange = (e: StorageEvent) => {
      console.log("📡 Storage 변경 감지:", e.key, e.newValue)
      if (e.key === "school_pickup_requests") {
        console.log("🚨 하원 요청 데이터 변경 감지!")
        loadPickupRequests(currentUser.id)
      }
    }

    // 다른 탭에서의 변경사항 감지
    window.addEventListener("storage", handleStorageChange)

    // 1초마다 폴링으로 변경사항 확인 (더 빠른 감지)
    pollIntervalRef.current = setInterval(() => {
      loadPickupRequests(currentUser.id)
    }, 1000) // 1초로 단축

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [currentUser])

  // 지속적인 알림음 관리
  useEffect(() => {
    const pendingRequests = notifications.filter((n) => n.status === "pending")

    if (pendingRequests.length > 0 && audioEnabled) {
      // 대기 중인 요청이 있으면 지속적으로 알림음 재생
      if (!isPlayingSound) {
        startContinuousSound()
      }
    } else {
      // 대기 중인 요청이 없으면 알림음 중지
      stopContinuousSound()
    }
  }, [notifications, audioEnabled])

  const startContinuousSound = () => {
    if (isPlayingSound || !audioEnabled) return

    setIsPlayingSound(true)

    const playSound = () => {
      if (audioRef.current && audioEnabled) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((e) => {
          console.log("알림음 재생 실패:", e)
        })
      }
    }

    // 즉시 한 번 재생
    playSound()

    // 10초마다 반복 재생
    soundIntervalRef.current = setInterval(() => {
      const pendingRequests = notifications.filter((n) => n.status === "pending")
      if (pendingRequests.length > 0) {
        playSound()
      } else {
        stopContinuousSound()
      }
    }, 10000) // 10초마다 반복
  }

  const stopContinuousSound = () => {
    setIsPlayingSound(false)
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current)
      soundIntervalRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const loadPickupRequests = (schoolId: string) => {
    try {
      const requests = getPickupRequestsBySchool(schoolId)
      const pendingRequests = requests.filter((r) => r.status === "pending")
      const previousPendingCount = notifications.filter((n) => n.status === "pending").length

      console.log(`📊 하원 요청 로드 - 학교 ID: ${schoolId}`)
      console.log(`📊 전체 요청: ${requests.length}개, 대기 중: ${pendingRequests.length}개`)
      console.log(`📊 이전 대기 수: ${previousPendingCount}개`)

      // 새로운 요청이 있으면 알림 표시
      if (pendingRequests.length > previousPendingCount) {
        const newRequest = pendingRequests[pendingRequests.length - 1]
        console.log("🚨 새로운 하원 요청 감지:", newRequest.childName)
        setLatestNotification(newRequest)
        setShowNotification(true)

        // 학생 상태 업데이트
        setStudents((prev) =>
          prev.map((student) =>
            student.name === newRequest.childName ? { ...student, status: "pending" as const } : student,
          ),
        )
      }

      setNotifications(requests)
      setLastUpdateTime(new Date().toLocaleTimeString())
    } catch (error) {
      console.error("하원 요청 로드 중 오류:", error)
    }
  }

  const handleManualRefresh = () => {
    if (!currentUser) return

    setIsRefreshing(true)
    console.log("🔄 수동 새로고침 실행")

    setTimeout(() => {
      loadPickupRequests(currentUser.id)
      setIsRefreshing(false)
    }, 500)
  }

  const handleAcknowledgeNotification = (id: string) => {
    updatePickupRequestStatus(id, "acknowledged")
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, status: "acknowledged" } : notif)))
    setShowNotification(false)
  }

  const handlePickupStudent = (studentId: number) => {
    const student = students.find((s) => s.id === studentId)
    if (!student) return

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              status: "picked" as const,
              pickupTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : s,
      ),
    )

    // 관련 하원 요청 완료 처리
    const relatedRequest = notifications.find((n) => n.childName === student.name && n.status !== "completed")
    if (relatedRequest) {
      updatePickupRequestStatus(relatedRequest.id, "completed")
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === relatedRequest.id ? { ...notif, status: "completed" } : notif)),
      )
    }
  }

  const handleProcessPickup = (requestId: string) => {
    const request = notifications.find((n) => n.id === requestId)
    if (!request) return

    // 학생 상태 업데이트
    setStudents((prev) =>
      prev.map((student) =>
        student.name === request.childName
          ? {
              ...student,
              status: "picked" as const,
              pickupTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : student,
      ),
    )

    // 요청 삭제
    deletePickupRequest(requestId)
    setNotifications((prev) => prev.filter((n) => n.id !== requestId))
    setShowNotification(false)
  }

  const handleLogout = () => {
    stopContinuousSound()
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

  // 필터링된 학생 목록
  const filteredStudents =
    activeClass === "all" ? students : students.filter((student) => student.class === activeClass)

  // 현재 학교에 있는 학생 수
  const presentStudentsCount = students.filter((s) => s.status === "present").length

  // 하원 대기 중인 학생 수 (하원 요청이 있는 학생)
  const pendingStudentsCount = notifications.filter((n) => n.status !== "completed").length

  // 하원 완료된 학생 수
  const pickedStudentsCount = students.filter((s) => s.status === "picked").length

  // 대기 중인 알림 수
  const pendingNotificationsCount = notifications.filter((n) => n.status === "pending").length

  return (
    <div className="flex min-h-screen flex-col">
      <SchoolHeader notificationsCount={pendingNotificationsCount} onLogout={handleLogout} />

      <main className="flex-1 p-4 md:p-6">
        {/* 실시간 연동 상태 표시 */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-800">
                실시간 연동 활성화 | 마지막 업데이트: {lastUpdateTime || "로딩 중..."}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="text-blue-700 border-blue-300"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
              새로고침
            </Button>
          </div>
        </div>

        {/* 오디오 활성화 안내 */}
        {!audioEnabled && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">🔊 알림음을 활성화하려면 페이지의 아무 곳이나 클릭해주세요.</p>
          </div>
        )}

        {/* 알림음 상태 표시 */}
        {isPlayingSound && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-red-800 font-medium">🚨 하원 요청 알림음이 재생 중입니다 (10초마다 반복)</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold">안녕하세요, {currentUser.schoolName}!</h1>
          <p className="text-muted-foreground">학생들의 하원을 관리하세요</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>현재 학교에 있는 학생</CardTitle>
              <CardDescription>돌봄교실 학생 현황</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{presentStudentsCount}명</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>하원 요청 대기</CardTitle>
              <CardDescription>하원 요청이 접수된 학생</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">
                {pendingStudentsCount}명
                {pendingNotificationsCount > 0 && (
                  <Badge variant="destructive" className="ml-2 animate-pulse">
                    {pendingNotificationsCount} 신규
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>하원 완료</CardTitle>
              <CardDescription>오늘 하원한 학생</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{pickedStudentsCount}명</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>학생 목록 및 하원 관리</CardTitle>
                  <CardDescription>
                    하원 요청이 있는 학생들이 상단에 표시됩니다
                    {pendingNotificationsCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {pendingNotificationsCount}개 신규 요청
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant={activeClass === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveClass("all")}
                  >
                    전체
                  </Button>
                  {MOCK_CLASSES.map((cls) => (
                    <Button
                      key={cls}
                      variant={activeClass === cls ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveClass(cls)}
                    >
                      {cls}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StudentList
                students={filteredStudents}
                pickupRequests={notifications}
                onPickup={handlePickupStudent}
                onAcknowledge={handleAcknowledgeNotification}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {showNotification && latestNotification && (
        <PickupNotification
          notification={latestNotification}
          onAcknowledge={() => handleAcknowledgeNotification(latestNotification.id)}
          onProcess={() => handleProcessPickup(latestNotification.id)}
        />
      )}
    </div>
  )
}
