// 인증 관련 유틸리티 함수들
export interface User {
  id: string
  email: string
  name: string
  type: "parent" | "school"
  createdAt: string
}

export interface ParentUser extends User {
  type: "parent"
  username: string
  phone: string
  schoolId: string
  schoolCode: string
  children: Child[]
}

export interface SchoolUser extends User {
  type: "school"
  schoolName: string
  schoolCode: string
  address: string
  phoneNumber: string
  username: string
}

export interface Child {
  id: string
  name: string
  class: string
  defaultPickupTime: string
}

export interface PickupRequest {
  id: string
  childId: string
  childName: string
  childClass: string
  parentId: string
  parentName: string
  parentPhone: string
  pickupTime: string
  requestTime: string
  note?: string
  status: "pending" | "acknowledged" | "completed"
  schoolId: string
}

// 로컬 스토리지 키
const USERS_KEY = "school_pickup_users"
const CURRENT_USER_KEY = "school_pickup_current_user"
const PICKUP_REQUESTS_KEY = "school_pickup_requests"
const SCHOOLS_KEY = "school_pickup_schools"

// 사용자 관리
export const saveUser = (user: ParentUser | SchoolUser): void => {
  const users = getUsers()
  const existingIndex = users.findIndex(
    (u) =>
      u.email === user.email ||
      (u.type === "school" && (u as SchoolUser).username === (user as SchoolUser).username) ||
      (u.type === "parent" && (u as ParentUser).username === (user as ParentUser).username),
  )

  if (existingIndex >= 0) {
    users[existingIndex] = user
  } else {
    users.push(user)
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const getUsers = (): (ParentUser | SchoolUser)[] => {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : []
}

export const findUserByEmail = (email: string): ParentUser | SchoolUser | null => {
  const users = getUsers()
  return users.find((u) => u.email === email) || null
}

export const findUserByUsername = (username: string): SchoolUser | null => {
  const users = getUsers()
  return (users.find((u) => u.type === "school" && (u as SchoolUser).username === username) as SchoolUser) || null
}

export const findParentByUsername = (username: string): ParentUser | null => {
  const users = getUsers()
  return (users.find((u) => u.type === "parent" && (u as ParentUser).username === username) as ParentUser) || null
}

export const authenticateUser = (identifier: string, password: string): ParentUser | SchoolUser | null => {
  // 실제로는 암호화된 비밀번호와 비교해야 하지만, 데모용으로 단순 비교
  const users = getUsers()
  return (
    users.find((u) => u.email === identifier || (u.type === "school" && (u as SchoolUser).username === identifier)) ||
    null
  )
}

export const authenticateParent = (username: string, password: string): ParentUser | null => {
  // 실제로는 암호화된 비밀번호와 비교해야 하지만, 데모용으로 단순 비교
  const users = getUsers()
  return (users.find((u) => u.type === "parent" && (u as ParentUser).username === username) as ParentUser) || null
}

// 현재 사용자 관리
export const setCurrentUser = (user: ParentUser | SchoolUser): void => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

export const getCurrentUser = (): ParentUser | SchoolUser | null => {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem(CURRENT_USER_KEY)
  return user ? JSON.parse(user) : null
}

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY)
}

// 학교 관리
export const getSchools = () => {
  if (typeof window === "undefined") return []
  const schools = localStorage.getItem(SCHOOLS_KEY)
  return schools
    ? JSON.parse(schools)
    : [
        { id: "1", name: "서울초등학교", code: "seoul123" },
        { id: "2", name: "부산초등학교", code: "busan456" },
        { id: "3", name: "대구초등학교", code: "daegu789" },
      ]
}

export const addSchool = (school: { id: string; name: string; code: string }) => {
  const schools = getSchools()
  schools.push(school)
  localStorage.setItem(SCHOOLS_KEY, JSON.stringify(schools))
}

export const findSchoolByCode = (code: string) => {
  const schools = getSchools()
  return schools.find((s) => s.code === code) || null
}

// 하원 요청 관리
export const savePickupRequest = (request: PickupRequest): void => {
  const requests = getPickupRequests()
  const existingIndex = requests.findIndex((r) => r.id === request.id)

  if (existingIndex >= 0) {
    requests[existingIndex] = request
  } else {
    requests.push(request)
  }

  console.log("💾 하원 요청 저장:", request.childName, "학교 ID:", request.schoolId)
  localStorage.setItem(PICKUP_REQUESTS_KEY, JSON.stringify(requests))

  // 강제로 storage event 발생시키기 (같은 탭에서도 감지되도록)
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: PICKUP_REQUESTS_KEY,
      newValue: JSON.stringify(requests),
      storageArea: localStorage,
    }),
  )
}

export const getPickupRequests = (): PickupRequest[] => {
  if (typeof window === "undefined") return []
  const requests = localStorage.getItem(PICKUP_REQUESTS_KEY)
  return requests ? JSON.parse(requests) : []
}

export const getPickupRequestsBySchool = (schoolId: string): PickupRequest[] => {
  const allRequests = getPickupRequests()
  const schoolRequests = allRequests.filter((r) => r.schoolId === schoolId)
  console.log(`📊 학교 ${schoolId}의 하원 요청: ${schoolRequests.length}개`)
  return schoolRequests
}

export const updatePickupRequestStatus = (requestId: string, status: PickupRequest["status"]): void => {
  const requests = getPickupRequests()
  const request = requests.find((r) => r.id === requestId)
  if (request) {
    request.status = status
    console.log("📝 하원 요청 상태 업데이트:", requestId, "->", status)
    localStorage.setItem(PICKUP_REQUESTS_KEY, JSON.stringify(requests))

    // 강제로 storage event 발생시키기
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: PICKUP_REQUESTS_KEY,
        newValue: JSON.stringify(requests),
        storageArea: localStorage,
      }),
    )
  }
}

export const deletePickupRequest = (requestId: string): void => {
  const requests = getPickupRequests()
  const filteredRequests = requests.filter((r) => r.id !== requestId)
  console.log("🗑️ 하원 요청 삭제:", requestId)
  localStorage.setItem(PICKUP_REQUESTS_KEY, JSON.stringify(filteredRequests))

  // 강제로 storage event 발생시키기
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: PICKUP_REQUESTS_KEY,
      newValue: JSON.stringify(filteredRequests),
      storageArea: localStorage,
    }),
  )
}

// ID 생성
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
