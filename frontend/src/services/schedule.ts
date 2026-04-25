import { supabase } from '@/lib/supabase';
import type { Course } from "@/lib/types"

interface RawEnrollment {
  course_id: number | string
}

interface RawCourseData {
  id: number
  subject: string
  course_number: number
  section: string
  name: string
  faculty: string | null
  credits: number
  open_seats: number
  total_seats: number
  semester: string
  is_lab: boolean
  is_open: boolean
  location: string
}

interface RawCourseTime {
  course_id: number | string
  day: string
  start_time: string
  end_time: string
}

function getCourseKey(id: number | string): string {
  return String(id);
}

function transformRawCourse(raw: RawCourseData): Course {
  const year = parseInt(raw.semester.split('_')[0], 10)

  return {
    id: raw.id,
    subject: raw.subject,
    code: raw.course_number,
    section: raw.section,
    name: raw.name,
    professors: raw.faculty ? [{ firstName: raw.faculty, lastName: "" }] : [],
    creditHours: raw.credits,
    openSeats: raw.open_seats,
    totalSeats: raw.total_seats,
    year,
    semester: raw.semester,
    times: [],
    isLab: raw.is_lab,
    isOpen: raw.is_open,
    location: raw.location,
  }
}

export async function getCourse(courseId: string) {
    const [courseResponse, timesResponse] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('course_times').select('*').eq('course_id', courseId)
    ]);

    if (courseResponse.error) throw courseResponse.error;
    if (timesResponse.error) throw timesResponse.error;

    const course = courseResponse.data;
    const times = timesResponse.data;

    return {
        ...course,
        times: times || []
    };
}

export async function getSchedule(userId: string): Promise<Course[]> {
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('user_id', userId)

  if (enrollmentsError) throw enrollmentsError
  if (!enrollments || enrollments.length === 0) return []

  const orderedCourseIds = (enrollments as RawEnrollment[]).map((enrollment) => enrollment.course_id)
  const uniqueCourseIds = Array.from(new Set(orderedCourseIds.map(getCourseKey)))

  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select('*')
    .in('id', uniqueCourseIds)

  if (coursesError) throw coursesError

  const courses = ((coursesData as RawCourseData[] | null) ?? []).map(transformRawCourse)
  const courseMap = new Map<string, Course>(
    courses.map((course) => [getCourseKey(course.id), course])
  )

  const { data: timesData, error: timesError } = await supabase
    .from('course_times')
    .select('*')
    .in('course_id', uniqueCourseIds)

  if (timesError) throw timesError

  if (timesData) {
    const timesMap = new Map<string, RawCourseTime[]>()
    ;(timesData as RawCourseTime[]).forEach((time) => {
      const courseKey = getCourseKey(time.course_id)
      if (!timesMap.has(courseKey)) {
        timesMap.set(courseKey, [])
      }
      timesMap.get(courseKey)!.push(time)
    })

    courses.forEach((course) => {
      const courseTimes = timesMap.get(getCourseKey(course.id)) || []
      course.times = courseTimes.map((time) => ({
        day: time.day,
        start_time: time.start_time,
        end_time: time.end_time,
      }))
    })
  }

  return orderedCourseIds
    .map((courseId) => courseMap.get(getCourseKey(courseId)))
    .filter((course): course is Course => Boolean(course))
}

/**
 * adds a course to a given schedule
 * @param userId 
 * @param courseId 
 * @returns 
 */
export async function addCourseToSchedule(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .insert({ user_id: userId, course_id: courseId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeCourseFromSchedule(userId: string, courseId: string) {
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId);
  if (error) throw error;
}
