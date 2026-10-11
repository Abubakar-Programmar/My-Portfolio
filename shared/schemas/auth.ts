import { z } from 'zod'

export const passwordRule = z
  .string()
  .min(10, 'Use at least 10 characters')
  .max(128)
  .regex(/[a-z]/, 'Add a lowercase letter')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/\d/, 'Add a number')

export const loginSchema = z.object({
  email: z.email('Enter a valid email').max(200),
  password: z.string().min(1, 'Enter your password').max(128),
  totp: z.string().trim().max(10).optional()
})

export const forgotPasswordSchema = z.object({ email: z.email('Enter a valid email').max(200) })

export const verifyOtpSchema = z.object({
  email: z.email('Enter a valid email').max(200),
  otp: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code')
})

export const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  password: passwordRule
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password').max(128),
  newPassword: passwordRule
})

export const totpCodeSchema = z.object({ code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code') })
