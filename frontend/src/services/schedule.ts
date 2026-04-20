
import { supabase } from '@/lib/supabase';
import {  } from "@/lib/types"

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

export async function getSchedule(userId: string) {
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("User is not authenticated");
  }

  // get the course ids. 
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, courses(*)')   // joins course data in one call
    .eq('user_id', userId);
  if (error) throw error;

  //console.log(data);
  
  if (data && data.length > 0) {
    // Fetch course times for all courses in the schedule
    const courseIds = data.map(enrollment => enrollment.course_id);
    const { data: timesData, error: timesError } = await supabase
      .from('course_times')
      .select('*')
      .in('course_id', courseIds);

    if (!timesError && timesData) {
      // Map times to their respective courses
      const timesMap = new Map<number, typeof timesData>();
      (timesData as any[]).forEach(time => {
        if (!timesMap.has(time.course_id)) {
          timesMap.set(time.course_id, []);
        }
        timesMap.get(time.course_id)!.push(time);
      });

      // Attach times to courses in enrollments
      data.forEach(enrollment => {
        const courseTimes = timesMap.get(enrollment.course_id) || [];
        if (enrollment.courses) {
          enrollment.courses.times = courseTimes.map(t => ({
            day: t.day,
            start_time: t.start_time,
            end_time: t.end_time
          }));
        }
      });
    }
  }

  return data;
}

/**
 * adds a course to a given schedule
 * @param userId 
 * @param courseId 
 * @returns 
 */
export async function addCourseToSchedule(userId: string, courseId: string) {
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("User is not authenticated");
  }

  const { data, error } = await supabase
    .from('enrollments')
    .insert({ user_id: userId, course_id: courseId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeCourseFromSchedule(userId: string, courseId: string) {
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("User is not authenticated");
  }

  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId);
  if (error) throw error;
}


