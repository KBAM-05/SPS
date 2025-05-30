"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SchoolHeader } from "@/components/school-header"
import { Search, Phone, Mail, User, Baby, GraduationCap } from "lucide-react"
import {
  getCurrentUser,
  logout as authLogout,
  getPickupRequestsBySchool,
  type SchoolUser,
  type ParentUser,
  getUsers,
} from "@/lib/auth"

export default function SchoolParentsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<SchoolUser | null>(null)
  const [parents, setParents] = useState<ParentUser[]>([])
  const [filteredParents, setFilteredParents] = useState<ParentUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedParent, setSelectedParent] = useState<ParentUser | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.type !== "school") {
      router.push("/login/school")
      return
    }
    setCurrentUser(user as SchoolUser)
    loadParents(user.id)
  }, [router])

  useEffect(() => {
    if (!currentUser) return

    // localStorage 변경 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "users" || e.key === "pickupRequests") {
        loadParents(currentUser.id)
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // 5초마다 데이터 새로고침
    const interval = setInterval(() => {
      loadParents(currentUser.id)
    }, 5000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [currentUser])

  useEffect(() => {
    // 검색어에 따른 필터링
    if (searchTerm.trim() === "") {
      setFilteredParents(parents)
    } else {
      const filtered = parents.filter(
        (parent) =>
          parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          parent.phone.includes(searchTerm) ||
          parent.children.some(
            (child) =>
              child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              child.class.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
      setFilteredParents(filtered)
    }
  }, [searchTerm, parents])

  const loadParents = (schoolId: string) => {
    const allUsers = getUsers()
    const schoolParents = allUsers.filter(
      (user) => user.type === "parent" && (user as ParentUser).schoolId === schoolId,
    ) as ParentUser[]

    setParents(schoolParents)
    setFilteredParents(schoolParents)
  }

  const handleLogout = () => {
    authLogout()
    router.push("/")
  }

  const handleViewDetails = (parent: ParentUser) => {
    setSelectedParent(parent)
    setIsDialogOpen(true)
  }

  const getRecentPickupRequests = (parentId: string) => {
    if (!currentUser) return []
    const requests = getPickupRequestsBySchool(currentUser.id)
    return requests.filter((req) => req.parentId === parentId).slice(-3)
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
      <SchoolHeader notificationsCount={0} onLogout={handleLogout} />

      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">학부모 관리</h1>
          <p className="text-muted-foreground">등록된 학부모와 아이 정보를 관리하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">총 학부모 수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parents.length}명</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">총 학생 수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {parents.reduce((total, parent) => total + parent.children.length, 0)}명
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">반별 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                {["돌봄1반", "돌봄2반", "돌봄3반"].map((className) => {
                  const count = parents.reduce(
                    (total, parent) => total + parent.children.filter((child) => child.class === className).length,
                    0,
                  )
                  return (
                    <div key={className} className="flex justify-between">
                      <span>{className}:</span>
                      <span className="font-medium">{count}명</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>학부모 목록</CardTitle>
            <CardDescription>학부모 정보를 검색하고 관리하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="학부모명, 이메일, 연락처, 아이 이름으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* 학부모 목록 테이블 */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>학부모명</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>아이 정보</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {searchTerm ? "검색 결과가 없습니다." : "등록된 학부모가 없습니다."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredParents.map((parent) => (
                      <TableRow key={parent.id}>
                        <TableCell className="font-medium">{parent.name}</TableCell>
                        <TableCell>{parent.phone}</TableCell>
                        <TableCell>{parent.email}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {parent.children.map((child) => (
                              <div key={child.id} className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {child.name} ({child.class})
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(parent.createdAt).toLocaleDateString("ko-KR")}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(parent)}>
                            상세보기
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 상세 정보 다이얼로그 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>학부모 상세 정보</DialogTitle>
              <DialogDescription>{selectedParent?.name}님의 상세 정보입니다</DialogDescription>
            </DialogHeader>

            {selectedParent && (
              <div className="space-y-6">
                {/* 학부모 기본 정보 */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        학부모 정보
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">이름:</span>
                        <span>{selectedParent.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedParent.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedParent.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">가입일:</span>
                        <span>{new Date(selectedParent.createdAt).toLocaleDateString("ko-KR")}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Baby className="h-5 w-5" />
                        아이 정보
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedParent.children.map((child) => (
                        <div key={child.id} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{child.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>반: {child.class}</div>
                            <div>기본 하원 시간: {child.defaultPickupTime}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* 최근 하원 요청 기록 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">최근 하원 요청 기록</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const recentRequests = getRecentPickupRequests(selectedParent.id)
                      return recentRequests.length === 0 ? (
                        <div className="text-center text-muted-foreground py-4">최근 하원 요청 기록이 없습니다.</div>
                      ) : (
                        <div className="space-y-3">
                          {recentRequests.map((request) => (
                            <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">{request.childName}</div>
                                <div className="text-sm text-muted-foreground">
                                  요청: {request.requestTime} | 하원: {request.pickupTime}
                                </div>
                                {request.note && (
                                  <div className="text-sm text-muted-foreground">메모: {request.note}</div>
                                )}
                              </div>
                              <Badge
                                variant={
                                  request.status === "completed"
                                    ? "default"
                                    : request.status === "acknowledged"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {request.status === "completed"
                                  ? "완료"
                                  : request.status === "acknowledged"
                                    ? "확인됨"
                                    : "대기중"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
