export const STUDENT_DOMAIN = '@stu-lisaa.com'

export function isStudentEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(STUDENT_DOMAIN)
}

export const STUDENT_EMAIL_ERROR = `Seules les adresses ${STUDENT_DOMAIN} sont acceptées.`
