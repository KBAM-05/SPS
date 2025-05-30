"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { saveUser, findUserByEmail, findUserByUsername, addSchool, generateId, type SchoolUser } from "@/lib/auth"

export default function SchoolRegister() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    // 학교 정보
    schoolName: "",
    schoolCode: "",
    address: "",
    phoneNumber: "",

    // 계정 정보
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // 유효성 검사
      if (formData.password !== formData.confirmPassword) {
        throw new Error("비밀번호가 일치하지 않습니다.")
      }

      if (formData.password.length < 6) {
        throw new Error("비밀번호는 6자 이상이어야 합니다.")
      }

      // 중복 확인
      if (findUserByEmail(formData.email)) {
        throw new Error("이미 등록된 이메일입니다.")
      }

      if (findUserByUsername(formData.username)) {
        throw new Error("이미 사용 중인 아이디입니다.")
      }

      // 학교 코드 유효성 검사 (영문+숫자 조합)
      const codeRegex = /^[a-zA-Z0-9]+$/
      if (!codeRegex.test(formData.schoolCode)) {
        throw new Error("학교 코드는 영문과 숫자만 사용할 수 있습니다.")
      }

      if (formData.schoolCode.length < 4) {
        throw new Error("학교 코드는 4자 이상이어야 합니다.")
      }

      // 학교 사용자 생성
      const schoolId = generateId()
      const newUser: SchoolUser = {
        id: schoolId,
        email: formData.email,
        name: formData.schoolName,
        type: "school",
        schoolName: formData.schoolName,
        schoolCode: formData.schoolCode,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        username: formData.username,
        createdAt: new Date().toISOString(),
      }

      // 사용자 저장
      saveUser(newUser)

      // 학교 목록에 추가
      addSchool({
        id: schoolId,
        name: formData.schoolName,
        code: formData.schoolCode,
      })

      setSuccess("학교 계정 등록이 완료되었습니다! 로그인 페이지로 이동합니다.")

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push("/login/school?registered=true")
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "학교 계정 등록 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="container py-8">
        <Card className="mx-auto w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">등록 완료!</h2>
              <p className="text-muted-foreground mb-4">{success}</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-700">
                  <strong>학교 코드:</strong> {formData.schoolCode}
                  <br />이 코드를 학부모들에게 제공하세요.
                </p>
              </div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">학교 계정 등록</CardTitle>
          <CardDescription>학교 정보와 계정 정보를 입력하여 등록하세요</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium">학교 정보</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">학교명</Label>
                  <Input
                    id="schoolName"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    placeholder="예: 서울초등학교"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolCode">학교 코드</Label>
                  <Input
                    id="schoolCode"
                    name="schoolCode"
                    value={formData.schoolCode}
                    onChange={handleChange}
                    placeholder="예: seoul123"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    학부모가 가입 시 사용할 고유 코드입니다. 영문과 숫자 조합, 4자 이상
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">주소</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="학교 주소를 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">대표 전화번호</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="02-0000-0000"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">계정 정보</h3>

              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="로그인에 사용할 아이디"
                  required
                />
                <p className="text-xs text-muted-foreground">로그인에 사용할 아이디를 입력하세요.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="school@example.com"
                  required
                />
                <p className="text-xs text-muted-foreground">비밀번호 찾기 등에 사용됩니다.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="6자 이상"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="비밀번호 재입력"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "등록 중..." : "학교 계정 등록하기"}
            </Button>
            <div className="text-center text-sm">
              이미 계정이 있으신가요?{" "}
              <Link href="/login/school" className="text-primary hover:underline">
                학교 계정 로그인
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
