"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { saveUser, getSchools, findSchoolByCode, generateId, findParentByUsername, type ParentUser } from "@/lib/auth"

export default function ParentRegister() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    schoolCode: "",
  })
  const [children, setChildren] = useState([{ name: "", class: "", defaultPickupTime: "15:00" }])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const schools = getSchools()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleChildChange = (index: number, field: string, value: string) => {
    const updatedChildren = [...children]
    updatedChildren[index] = { ...updatedChildren[index], [field]: value }
    setChildren(updatedChildren)
  }

  const addChild = () => {
    setChildren([...children, { name: "", class: "", defaultPickupTime: "15:00" }])
  }

  const removeChild = (index: number) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // 유효성 검사
      if (formData.password !== formData.confirmPassword) {
        throw new Error("비밀번호가 일치하지 않습니다.")
      }

      if (formData.password.length < 6) {
        throw new Error("비밀번호는 6자 이상이어야 합니다.")
      }

      // 아이디 중복 체크
      if (findParentByUsername(formData.username)) {
        throw new Error("이미 사용 중인 아이디입니다.")
      }

      // 학교 코드 확인
      const school = findSchoolByCode(formData.schoolCode)
      if (!school) {
        throw new Error("유효하지 않은 학교 코드입니다.")
      }

      // 아이 정보 유효성 검사
      const validChildren = children.filter((child) => child.name.trim() && child.class.trim())
      if (validChildren.length === 0) {
        throw new Error("최소 한 명의 아이 정보를 입력해주세요.")
      }

      // 사용자 생성
      const newUser: ParentUser = {
        id: generateId(),
        username: formData.username,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: "parent",
        schoolId: school.id,
        schoolCode: formData.schoolCode,
        createdAt: new Date().toISOString(),
        children: validChildren.map((child) => ({
          id: generateId(),
          name: child.name,
          class: child.class,
          defaultPickupTime: child.defaultPickupTime,
        })),
      }

      // 사용자 저장
      saveUser(newUser)

      // 성공 시 로그인 페이지로 이동
      router.push("/login/parent?registered=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-8">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">학부모 계정 생성</CardTitle>
          <CardDescription>학부모 계정을 생성하여 하원 관리 서비스를 이용하세요</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">아이디 *</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="로그인에 사용할 아이디"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="실명을 입력하세요"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="이메일 주소를 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">연락처 *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="010-1234-5678"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호 *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="6자 이상 입력하세요"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolCode">학교 코드 *</Label>
              <Input
                id="schoolCode"
                name="schoolCode"
                value={formData.schoolCode}
                onChange={handleInputChange}
                placeholder="학교에서 제공한 코드를 입력하세요"
                required
              />
              <div className="text-sm text-muted-foreground">
                사용 가능한 학교 코드: {schools.map((school) => school.code).join(", ")}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>아이 정보 *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addChild}>
                  <Plus className="h-4 w-4 mr-2" />
                  아이 추가
                </Button>
              </div>

              {children.map((child, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">아이 {index + 1}</h4>
                    {children.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeChild(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>이름</Label>
                      <Input
                        value={child.name}
                        onChange={(e) => handleChildChange(index, "name", e.target.value)}
                        placeholder="아이 이름"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>반</Label>
                      <Select
                        value={child.class}
                        onValueChange={(value) => handleChildChange(index, "class", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="반 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="돌봄1반">돌봄1반</SelectItem>
                          <SelectItem value="돌봄2반">돌봄2반</SelectItem>
                          <SelectItem value="돌봄3반">돌봄3반</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>기본 하원 시간</Label>
                      <Input
                        type="time"
                        value={child.defaultPickupTime}
                        onChange={(e) => handleChildChange(index, "defaultPickupTime", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "계정 생성 중..." : "계정 생성"}
            </Button>
            <div className="text-center text-sm">
              이미 계정이 있으신가요?{" "}
              <Link href="/login/parent" className="text-primary hover:underline">
                로그인
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
