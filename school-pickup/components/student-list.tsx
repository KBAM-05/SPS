"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, MessageSquare } from "lucide-react"
import type { PickupRequest } from "@/lib/auth"

interface Student {
  id: number
  name: string
  class: string
  status: "present" | "picked" | "pending"
  parentName: string
  parentPhone: string
  pickupTime?: string
}

interface StudentListProps {
  students: Student[]
  pickupRequests: PickupRequest[]
  onPickup: (id: number) => void
  onAcknowledge: (requestId: string) => void
}

export function StudentList({ students, pickupRequests, onPickup, onAcknowledge }: StudentListProps) {
  // 학생과 하원 요청 매핑
  const studentsWithRequests = students.map((student) => {
    const request = pickupRequests.find((req) => req.childName === student.name && req.status !== "completed")
    return {
      ...student,
      pickupRequest: request,
    }
  })

  // 정렬: 하원 요청이 있는 학생을 상단으로
  const sortedStudents = studentsWithRequests.sort((a, b) => {
    // 1순위: pending 상태 (새로운 요청)
    if (a.pickupRequest?.status === "pending" && b.pickupRequest?.status !== "pending") return -1
    if (b.pickupRequest?.status === "pending" && a.pickupRequest?.status !== "pending") return 1

    // 2순위: acknowledged 상태 (확인된 요청)
    if (a.pickupRequest?.status === "acknowledged" && !b.pickupRequest) return -1
    if (b.pickupRequest?.status === "acknowledged" && !a.pickupRequest) return 1

    // 3순위: 하원 완료된 학생
    if (a.status === "picked" && b.status !== "picked") return 1
    if (b.status === "picked" && a.status !== "picked") return -1

    // 나머지는 이름순
    return a.name.localeCompare(b.name)
  })

  // 상태별 배지 렌더링
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge variant="secondary">등원 중</Badge>
      case "pending":
        return <Badge variant="destructive">하원 대기</Badge>
      case "picked":
        return <Badge variant="outline">하원 완료</Badge>
      default:
        return null
    }
  }

  // 하원 요청 상태 배지
  const renderRequestBadge = (request: PickupRequest | undefined) => {
    if (!request) return null

    switch (request.status) {
      case "pending":
        return (
          <Badge variant="destructive" className="animate-pulse">
            🚨 새 요청
          </Badge>
        )
      case "acknowledged":
        return <Badge variant="secondary">✅ 확인됨</Badge>
      default:
        return null
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>반</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>보호자</TableHead>
            <TableHead>연락처</TableHead>
            <TableHead>하원 정보</TableHead>
            <TableHead className="text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStudents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                표시할 학생이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            sortedStudents.map((student) => (
              <TableRow
                key={student.id}
                className={`
                  ${student.pickupRequest?.status === "pending" ? "bg-red-50 border-red-200" : ""}
                  ${student.pickupRequest?.status === "acknowledged" ? "bg-yellow-50 border-yellow-200" : ""}
                `}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <span>{student.name}</span>
                    {renderRequestBadge(student.pickupRequest)}
                  </div>
                </TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell>
                  {student.pickupRequest ? renderStatusBadge("pending") : renderStatusBadge(student.status)}
                </TableCell>
                <TableCell>{student.parentName}</TableCell>
                <TableCell>{student.parentPhone}</TableCell>
                <TableCell>
                  {student.pickupRequest ? (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>요청: {student.pickupRequest.requestTime}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>예정: {student.pickupRequest.pickupTime}</span>
                      </div>
                      {student.pickupRequest.note && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          <span>{student.pickupRequest.note}</span>
                        </div>
                      )}
                    </div>
                  ) : student.status === "picked" ? (
                    <div className="text-sm text-muted-foreground">하원 완료: {student.pickupTime}</div>
                  ) : (
                    <div className="text-sm text-muted-foreground">하원 요청 없음</div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2 justify-end">
                    {/* 확인 버튼 - pending 상태일 때만 표시 */}
                    {student.pickupRequest?.status === "pending" && (
                      <Button size="sm" variant="outline" onClick={() => onAcknowledge(student.pickupRequest!.id)}>
                        확인
                      </Button>
                    )}

                    {/* 하원 처리 버튼 */}
                    {student.status === "picked" ? (
                      <Button size="sm" variant="outline" disabled>
                        하원 완료
                      </Button>
                    ) : student.pickupRequest ? (
                      // 하원 요청이 있을 때만 활성화
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onPickup(student.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        하원 처리
                      </Button>
                    ) : (
                      // 하원 요청이 없으면 비활성화
                      <Button size="sm" variant="outline" disabled>
                        요청 대기
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
