import { IS_DEMO } from './config'
import { otpDemo } from './demo/otp.demo'
import { otpApi } from './api/otp.api'

/**
 * Servicio de códigos de un solo uso (OTP). Utilizado tanto por el login
 * interno como por los flujos públicos de solicitud y consulta de estatus.
 * En modo demo el código siempre es 123456; en modo API se delega a los
 * endpoints /auth/request-otp, /auth/verify-otp, /public/status/request-otp
 * y /public/status/verify.
 */
export const otpService = IS_DEMO ? otpDemo : otpApi
