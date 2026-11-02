// Cùng quy tắc với rule vee-validate của host Vue 2 (src/mixins/validate.js)
const EMAIL = /^[a-zA-Z0-9._%+&-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const DIGITS = /^[0-9]+$/
const PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)[a-zA-Z0-9`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]{6,}$/

export const isEmail = (value: string) => EMAIL.test(value.trim())
/** Tài khoản đăng nhập: email hoặc số điện thoại */
export const isAccount = (value: string) => isEmail(value) || DIGITS.test(value.trim())
/** Ít nhất 6 ký tự, có cả chữ và số */
export const isStrongPassword = (value: string) => PASSWORD.test(value)
