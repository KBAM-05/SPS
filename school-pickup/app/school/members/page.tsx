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
import { Search, Phone, Mail, User, Baby, GraduationCap, Calendar, UserCheck } from "lucide-react"
import {
  getCurrentUser,
  logout as authLogout,
  getPickupRequestsBySchool,
  type SchoolUser,
  type ParentUser,
  getUsers,
} from "@/lib/auth"

export default function SchoolMembersPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<SchoolUser | null>(null)
  const [allMembers, setAllMembers] = useState<ParentUser[]>([])
  const [filteredMembers, setFilteredMembers] = useState<ParentUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMember, setSelectedMember] = useState<ParentUser | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.type !== "school") {
      router.push("/login/school")
      return
    }
    setCurrentUser(user as SchoolUser)
    loadMembers(user.id)
  }, [router])

  useEffect(() => {
    if (!currentUser) return

    // localStorage 변경 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "school_pickup_users") {
        loadMembers(currentUser.id)
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // 10초마다 데이터 새로고침
    const interval = setInterval(() => {
      loadMembers(currentUser.id)
    }, 10000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [currentUser])

  useEffect(() => {
    // 검색어에 따른 필터링
    if (searchTerm.trim() === "") {
      setFilteredMembers(allMembers)
    } else {
      const filtered = allMembers.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.phone.includes(searchTerm) ||
          member.children.some(
            (child) =>
              child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              child.class.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
      setFilteredMembers(filtered)
    }
  }, [searchTerm, allMembers])

  const loadMembers = (schoolId: string) => {
    const allUsers = getUsers()
    const schoolMembers = allUsers.filter(
      (user) => user.type === "parent" && (user as ParentUser).schoolId === schoolId,
    ) as ParentUser[]

    // 가입일 기준으로 최신순 정렬
    schoolMembers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setAllMembers(schoolMembers)
    setFilteredMembers(schoolMembers)
  }

  const handleLogout = () => {
    authLogout()
    router.push("/")
  }

  const handleViewDetails = (member: ParentUser) => {
    setSelectedMember(member)
    setIsDialogOpen(true)
  }

  const getPickupRequestsCount = (parentId: string) => {
    if (!currentUser) return 0
    const requests = getPickupRequestsBySchool(currentUser.id)
    return requests.filter((req) => req.parentId === parentId).length
  }

  const getRecentActivity = (member: ParentUser) => {
    if (!currentUser) return "활동 없음"
    const requests = getPickupRequestsBySchool(currentUser.id)
    const memberRequests = requests.filter((req) => req.parentId === member.id)

    if (memberRequests.length === 0) return "하원 요청 없음"

    const latestRequest = memberRequests.sort(
      (a, b) => new Date(b.requestTime).getTime() - new Date(a.requestTime).getTime(),
    )[0]

    const daysDiff = Math.floor(
      (new Date().getTime() - new Date(latestRequest.requestTime).getTime()) / (1000 * 60 * 60 * 24),
    )

    if (daysDiff === 0) return "오늘 활동"
    if (daysDiff === 1) return "어제 활동"
    return `${daysDiff}일 전 활동`
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
          <h1 className="text-2xl font-bold">회원 관리</h1>
          <p className="text-muted-foreground">등록된 학부모 회원들의 정보를 관리하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4" />총 회원 수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allMembers.length}명</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Baby className="h-4 w-4" />총 학생 수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allMembers.reduce((total, member) => total + member.children.length, 0)}명
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                이번 달 가입
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  allMembers.filter((member) => {
                    const memberDate = new Date(member.createdAt)
                    const now = new Date()
                    return memberDate.getMonth() === now.getMonth() && memberDate.getFullYear() === now.getFullYear()
                  }).length
                }
                명
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">활성 회원</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allMembers.filter((member) => getPickupRequestsCount(member.id) > 0).length}명
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 회원 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>회원 목록</CardTitle>
            <CardDescription>등록된 학부모 회원들의 상세 정보를 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="이름, 아이디, 이메일, 연락처, 아이 이름으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>회원 정보</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>아이 정보</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>최근 활동</TableHead>
                    <TableHead>하원 요청</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        {searchTerm ? "검색 결과가 없습니다." : "등록된 회원이 없습니다."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">@{member.username}</div>
                            <div className="text-xs text-muted-foreground">{member.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{member.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {member.children.map((child) => (
                              <Badge key={child.id} variant="outline" className="text-xs mr-1">
                                {child.name} ({child.class})
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{new Date(member.createdAt).toLocaleDateString("ko-KR")}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">{getRecentActivity(member)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getPickupRequestsCount(member.id)}회</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(member)}>
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

        {/* 회원 상세 정보 다이얼로그 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>회원 상세 정보</DialogTitle>
              <DialogDescription>{selectedMember?.name}님의 상세 정보입니다</DialogDescription>
            </DialogHeader>

            {selectedMember && (
              <div className="space-y-6">
                {/* 회원 기본 정보 */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        회원 정보
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">이름</span>
                          <div className="font-medium">{selectedMember.name}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">아이디</span>
                          <div className="font-medium">@{selectedMember.username}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedMember.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedMember.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          가입일: {new Date(selectedMember.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Baby className="h-5 w-5" />
                        자녀 정보
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedMember.children.map((child) => (
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

                {/* 활동 통계 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">활동 통계</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {getPickupRequestsCount(selectedMember.id)}
                        </div>
                        <div className="text-sm text-muted-foreground">총 하원 요청</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {(() => {
                            if (!currentUser) return 0
                            const requests = getPickupRequestsBySchool(currentUser.id)
                            return requests.filter(
                              (req) => req.parentId === selectedMember.id && req.status === "completed",
                            ).length
                          })()}
                        </div>
                        <div className="text-sm text-muted-foreground">완료된 하원</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {(() => {
                            if (!currentUser) return 0
                            const requests = getPickupRequestsBySchool(currentUser.id)
                            return requests.filter(
                              (req) => req.parentId === selectedMember.id && req.status === "pending",
                            ).length
                          })()}
                        </div>
                        <div className="text-sm text-muted-foreground">대기 중인 요청</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 최근 하원 요청 기록 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">최근 하원 요청 기록</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      if (!currentUser) return null
                      const requests = getPickupRequestsBySchool(currentUser.id)
                      const memberRequests = requests
                        .filter((req) => req.parentId === selectedMember.id)
                        .sort((a, b) => new Date(b.requestTime).getTime() - new Date(a.requestTime).getTime())
                        .slice(0, 5)

                      return memberRequests.length === 0 ? (
                        <div className="text-center text-muted-foreground py-4">하원 요청 기록이 없습니다.</div>
                      ) : (
                        <div className="space-y-3">
                          {memberRequests.map((request) => (
                            <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">
                                  {request.childName} ({request.childClass})
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  요청: {new Date(request.requestTime).toLocaleString("ko-KR")}
                                </div>
                                <div className="text-sm text-muted-foreground">하원 시간: {request.pickupTime}</div>
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
