import { api, type ApiError } from '@/api/http'

// Endpoint giữ nguyên như host Vue 2 (ipos-cms-pos-android/src/api/auth.js).

interface Envelope<T> { data: T }

export interface Brand { id: string; brand_name: string; [key: string]: unknown }
export interface City { id: string; [key: string]: unknown }
export interface Store { brand_uid: string; city_uid: string; [key: string]: unknown }

/** Dữ liệu phiên khi đăng nhập thẳng được vào một công ty */
export interface SessionPayload {
  user: { is_fabi?: number; email?: string; full_name?: string; [key: string]: unknown }
  brands?: Brand[]
  cities?: City[]
  stores?: Store[]
  token: string
  company: { company_id: string; [key: string]: unknown }
  [key: string]: unknown
}

export interface CompanyOption {
  id: string
  company_id?: string
  brands: Pick<Brand, 'id' | 'brand_name'>[]
}

/** Tài khoản thuộc nhiều công ty: phải chọn công ty rồi gọi selectCompany với temp_token */
export interface CompanyChoice {
  companies: CompanyOption[]
  temp_token?: string
}

export interface RegisterBody {
  full_name: string
  country_id: string
  email: string
  password: string
}

export const isCompanyChoice = (data: SessionPayload | CompanyChoice): data is CompanyChoice =>
  Array.isArray((data as CompanyChoice).companies) && (data as CompanyChoice).companies.length > 0

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api.post<Envelope<SessionPayload | CompanyChoice>>('api/iam/v1/auth/login', body, { noAuth: true }).then(res => res.data),
  selectCompany: (body: { company_uid: string; temp_token?: string }) =>
    api.post<Envelope<SessionPayload>>('api/iam/v1/auth/select-company', body, { noAuth: true }).then(res => res.data),
  register: (body: RegisterBody) =>
    api.post('api/accounts/v1/owners', { ...body, confirm_password: body.password }, { noAuth: true }),
  requestVerifyEmail: (email: string) =>
    api.post('api/accounts/v1/verification/email/token', { email }, { noAuth: true }),
  requestAccess: (email: string) =>
    api.post('api/iam/v1/user/product/request-access', { path: '/micro/employee/access', email }, { noAuth: true }),
  logout: () => api.post('api/accounts/v1/user/logout'),
}

/** Câu lỗi backend trả về (ưu tiên `error.message` như host cũ); không có thì nơi gọi dùng câu chung */
export function apiErrorMessage(error: unknown): string | undefined {
  const body = (error as Partial<ApiError> | undefined)?.data as
    | { message?: string; error?: { message?: string } }
    | undefined
  return body?.error?.message || body?.message
}

// Host cũ nhận diện "tài khoản chưa được cấp quyền FABI" bằng đúng câu tiếng Việt backend trả.
// Giữ nguyên để không lệch hành vi; nên đề nghị backend trả mã lỗi riêng thay cho so khớp chuỗi.
const NO_PRODUCT_ACCESS = 'Bạn chưa có quyền truy cập sản phẩm này'
export const isNoProductAccess = (error: unknown) =>
  (error as Partial<ApiError> | undefined)?.status === 403 && !!apiErrorMessage(error)?.includes(NO_PRODUCT_ACCESS)
