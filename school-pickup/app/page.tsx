"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { School, Users, Bell, Shield, Clock, CheckCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">🏫 학교 하원 관리 시스템</h1>
              <p className="text-blue-100 mt-1">안전하고 효율적인 하원 관리 솔루션</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/login/parent">
                <Button variant="secondary" size="sm">
                  학부모 로그인
                </Button>
              </Link>
              <Link href="/login/school">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:bg-white hover:text-primary"
                >
                  학교 로그인
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 히어로 섹션 */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              실시간 하원 관리로
              <br />더 안전한 학교생활
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              학부모와 학교 간의 원활한 소통으로 아이들의 하원 과정을 체계적으로 관리하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register/parent">
                <Button size="lg" className="text-lg px-8 py-4">
                  <Users className="mr-2 h-5 w-5" />
                  학부모 계정 만들기
                </Button>
              </Link>
              <Link href="/register/school">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                  <School className="mr-2 h-5 w-5" />
                  학교 계정 등록하기
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 기능 소개 */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">주요 기능</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="text-center">
                  <Bell className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>실시간 알림</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>하원 요청 시 즉시 알림을 받아 신속한 대응이 가능합니다</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>시간 관리</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>즉시 하원부터 예약 하원까지 유연한 시간 선택이 가능합니다</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>안전 관리</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>학생별 상태 추적으로 안전한 하원 과정을 보장합니다</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>기록 관리</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>모든 하원 기록을 체계적으로 관리하고 조회할 수 있습니다</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 사용 방법 */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">사용 방법</h3>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-2xl font-bold mb-6 text-primary">👨‍👩‍👧‍👦 학부모용</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h5 className="font-semibold">계정 가입</h5>
                      <p className="text-muted-foreground">학교에서 제공받은 코드로 계정을 만드세요</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h5 className="font-semibold">아이 정보 등록</h5>
                      <p className="text-muted-foreground">아이의 이름, 반, 기본 하원 시간을 등록하세요</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h5 className="font-semibold">하원 요청</h5>
                      <p className="text-muted-foreground">필요할 때 언제든지 하원 요청을 보내세요</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-2xl font-bold mb-6 text-green-600">🏫 학교용</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h5 className="font-semibold">학교 계정 등록</h5>
                      <p className="text-muted-foreground">학교 정보와 고유 코드를 설정하세요</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h5 className="font-semibold">학생 관리</h5>
                      <p className="text-muted-foreground">반별 학생 현황을 실시간으로 모니터링하세요</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h5 className="font-semibold">하원 처리</h5>
                      <p className="text-muted-foreground">알림을 받고 안전하게 하원을 처리하세요</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h5 className="font-bold mb-4">학교 하원 관리 시스템</h5>
              <p className="text-muted-foreground text-sm">안전하고 효율적인 하원 관리를 위한 통합 솔루션</p>
            </div>
            <div>
              <h5 className="font-bold mb-4">빠른 링크</h5>
              <div className="space-y-2 text-sm">
                <Link href="/register/parent" className="block text-muted-foreground hover:text-primary">
                  학부모 가입
                </Link>
                <Link href="/register/school" className="block text-muted-foreground hover:text-primary">
                  학교 등록
                </Link>
                <Link href="/login/parent" className="block text-muted-foreground hover:text-primary">
                  학부모 로그인
                </Link>
                <Link href="/login/school" className="block text-muted-foreground hover:text-primary">
                  학교 로그인
                </Link>
              </div>
            </div>
            <div>
              <h5 className="font-bold mb-4">지원</h5>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">이메일: support@school-pickup.com</p>
                <p className="text-muted-foreground">전화: 1588-0000</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            &copy; 2024 학교 하원 관리 시스템. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
