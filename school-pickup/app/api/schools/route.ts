import { NextResponse } from "next/server"

// 임시 학교 데이터 - 실제로는 데이터베이스에서 가져와야 함
const MOCK_SCHOOLS = [
  { id: "1", name: "서울초등학교", code: "seoul123" },
  { id: "2", name: "부산초등학교", code: "busan456" },
  { id: "3", name: "대구초등학교", code: "daegu789" },
  { id: "4", name: "인천초등학교", code: "incheon101" },
  { id: "5", name: "광주초등학교", code: "gwangju202" },
]

// 학교 목록 조회 API
export async function GET() {
  try {
    // 실제로는 데이터베이스에서 학교 목록을 가져오는 로직
    // 여기서는 임시 데이터 사용
    return NextResponse.json(MOCK_SCHOOLS)
  } catch (error) {
    console.error("학교 목록 조회 중 오류 발생:", error)
    return NextResponse.json({ error: "학교 목록을 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}

// 학교 등록 API
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // 필수 필드 검증
    if (!data.schoolName || !data.schoolCode || !data.username || !data.email || !data.password) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 })
    }

    // 실제로는 데이터베이스에 학교 정보 저장 로직
    // 여기서는 성공 응답만 반환
    return NextResponse.json({ success: true, message: "학교 계정이 성공적으로 등록되었습니다." })
  } catch (error) {
    console.error("학교 등록 중 오류 발생:", error)
    return NextResponse.json({ error: "학교 등록 중 오류가 발생했습니다." }, { status: 500 })
  }
}
