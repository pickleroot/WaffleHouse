
import { supabase } from '@/lib/supabase';

export async function getCourse(courseId: string) {
    const {data, error} = await supabase
        .from('courses')
        .select('*')
        .eq('id',courseId)
    if (error) throw error;
    return data;
}

export async function getSchedule(userId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, courses(*)')   // joins course data in one call
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

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


