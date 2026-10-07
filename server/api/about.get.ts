import { asc } from 'drizzle-orm'
import { certification, education, experience, skill } from '../database/schema'

export default defineEventHandler(async () => {
  const db = useDb()
  const [skills, experiences, educations, certifications] = await Promise.all([
    db.select().from(skill).orderBy(asc(skill.category), asc(skill.sortOrder)),
    db.select().from(experience).orderBy(asc(experience.sortOrder)),
    db.select().from(education).orderBy(asc(education.sortOrder)),
    db.select().from(certification).orderBy(asc(certification.sortOrder))
  ])
  return { skills, experiences, educations, certifications }
})
