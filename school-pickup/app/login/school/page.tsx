"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { findUserByUsername, findUserByEmail, setCurrentUser, type SchoolUser } from "@/lib/auth"

export default function SchoolLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showRegisteredMessage, setShowRegisteredMessage] = useState(false)

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setShowRegisteredMessage(true)
      setTimeout(() => setShowRegisteredMessage(false), 5000)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // 사용자 찾기 (아이디 또는 이메일로)
      let user = findUserByUsername(username)
      if (!user) {
        const emailUser = findUserByEmail(username)
        if (emailUser && emailUser.type === "school") {
          user = emailUser as SchoolUser
        }
      }

      if (!user) {
        throw new Error("등록되지 않은 아이디/이메일입니다.")
      }

      if (user.type !== "school") {
        throw new Error("학교 계정이 아닙니다.")
      }

      // 실제로는 암호화된 비밀번호와 비교해야 하지만, 데모용으로 단순 비교
      // 여기서는 모든 비밀번호를 허용 (실제 구현에서는 해시 비교 필요)

      // 현재 사용자 설정
      setCurrentUser(user)

      // 로그인 성공 시 학교 대시보드로 이동
      router.push("/school/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">학교 계정 로그인</CardTitle>
          <CardDescription>학교 계정으로 로그인하세요</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {showRegisteredMessage && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>학교 계정 등록이 완료되었습니다! 이제 로그인하세요.</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">아이디 또는 이메일</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="등록한 아이디 또는 이메일을 입력하세요"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">비밀번호</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  비밀번호 찾기
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
            <div className="text-center text-sm">
              학교 계정이 없으신가요?{" "}
              <Link href="/register/school" className="text-primary hover:underline">
                학교 계정 등록하기
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
