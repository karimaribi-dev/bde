export const STUDENT_DOMAIN = '@stu-lisaa.com'
const ADMIN_EMAIL = 'karimaribi@gmail.com'

export function isStudentEmail(email: string): boolean {
  const e = email.trim().toLowerCase()
  return e.endsWith(STUDENT_DOMAIN) || e === ADMIN_EMAIL
}

export const STUDENT_EMAIL_ERROR = `Seules les adresses ${STUDENT_DOMAIN} sont acceptées.`
