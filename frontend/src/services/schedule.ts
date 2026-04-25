
import { supabase } from '@/lib/supabase';
import type { Course, Timeslot } from "@/lib/types"

export async function getCourse(courseId: string) {
    const [courseResponse, timesResponse] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('course_times').select('*').eq('course_id', courseId)
    ]);

    if (courseResponse.error) throw courseResponse.error;
    if (timesResponse.error) throw timesResponse.error;

    return { ...courseResponse.data, times: timesResponse.data || [] };
}

async function getUserScheduleId(userId: string): Promise<number | null> {
    const { data, error } = await supabase
        .from('schedules')
        .select('id')
        .eq('user', userId)
        .maybeSingle();
    if (error) throw error;
    return data?.id ?? null;
}

export async function getSchedule(userId: string): Promise<Course[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User is not authenticated");

    const scheduleId = await getUserScheduleId(userId);
    if (scheduleId === null) return [];

    const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select('course_id, courses(*)')
        .eq('schedule_id', scheduleId);
    if (error) throw error;
    if (!enrollments || enrollments.length === 0) return [];

    const courseIds = enrollments.map((e: any) => e.course_id);
    const { data: timesData } = await supabase
        .from('course_times')
        .select('*')
        .in('course_id', courseIds);

    const timesMap = new Map<number, Timeslot[]>();
    (timesData || []).forEach((t: any) => {
        if (!timesMap.has(t.course_id)) timesMap.set(t.course_id, []);
        timesMap.get(t.course_id)!.push({ day: t.day, start_time: t.start_time, end_time: t.end_time });
    });

    return enrollments.map((e: any): Course => {
        const c = e.courses;
        const year = parseInt(c.semester?.split('_')[0] ?? '0', 10);
        return {
            id: c.id,
            subject: c.subject,
            code: c.course_number,
            section: c.section,
            name: c.name,
            professors: c.faculty ? [{ firstName: c.faculty, lastName: "" }] : [],
            creditHours: c.credits,
            openSeats: c.open_seats,
            totalSeats: c.total_seats,
            year,
            semester: c.semester,
            times: timesMap.get(c.id) || [],
            isLab: c.is_lab,
            isOpen: c.is_open,
            location: c.location,
        };
    });
}

export async function addCourseToSchedule(userId: string, courseId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User is not authenticated");

    let scheduleId = await getUserScheduleId(userId);
    if (scheduleId === null) {
        const { data: newSchedule, error } = await supabase
            .from('schedules')
            .insert({ user: userId })
            .select('id')
            .single();
        if (error) throw error;
        scheduleId = newSchedule.id;
    }

    const { data, error } = await supabase
        .from('enrollments')
        .insert({ schedule_id: scheduleId, course_id: Number(courseId) })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function removeCourseFromSchedule(userId: string, courseId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User is not authenticated");

    const scheduleId = await getUserScheduleId(userId);
    if (scheduleId === null) return;

    const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('schedule_id', scheduleId)
        .eq('course_id', Number(courseId));
    if (error) throw error;
}
