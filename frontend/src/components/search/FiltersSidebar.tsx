/**
 * Filters sidebar. Owns the filter state and triggers re-queries through
 * `setResults` whenever a field changes.
 *
 * @author Ina Tang
 */

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import type { Course } from "@/lib/types"
import { Input } from "@/components/ui/input"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
} from "@/components/ui/combobox"
import { fetchFilterOptions, filterCourses, type FilterParams } from "@/services/search"

interface FiltersSidebarProps {
    setResults: (results: Course[]) => void
}

const CREDITS_MIN = 0
const CREDITS_MAX = 4
const DAYS: { value: string; label: string }[] = [
    { value: "M", label: "M" },
    { value: "T", label: "T" },
    { value: "W", label: "W" },
    { value: "R", label: "R" },
    { value: "F", label: "F" },
]

function FiltersSidebarInner({ setResults }: FiltersSidebarProps) {
    const [year, setYear] = useState("")
    const [semester, setSemester] = useState("")
    const [dept, setDept] = useState<string | null>(null)
    const [name, setName] = useState("")
    const [credits, setCredits] = useState<[number, number]>([CREDITS_MIN, CREDITS_MAX])
    const [days, setDays] = useState<string[]>([])
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [profs, setProfs] = useState<string[]>([])

    const [subjectOptions, setSubjectOptions] = useState<string[]>([])
    const [facultyOptions, setFacultyOptions] = useState<string[]>([])

    useEffect(() => {
        let cancelled = false
        fetchFilterOptions().then(({ subjects, faculty }) => {
            if (cancelled) return
            setSubjectOptions(subjects)
            setFacultyOptions(faculty)
        }).catch(err => console.error("Failed to load filter options:", err))
        return () => { cancelled = true }
    }, [])

    const params: FilterParams = useMemo(() => {
        const creditsFilter = credits[0] === CREDITS_MIN && credits[1] === CREDITS_MAX
            ? null
            : { min: credits[0], max: credits[1] }

        const time = (days.length > 0 || startTime || endTime)
            ? {
                days: days.length > 0 ? days : undefined,
                start_time: startTime ? startTime.split(":").map(Number) : undefined,
                end_time: endTime ? endTime.split(":").map(Number) : undefined,
            }
            : null

        return {
            year: year.trim() || null,
            semester: semester.trim() || null,
            dept: dept || null,
            name: name.trim() || null,
            credits: creditsFilter,
            prof: profs.length > 0 ? profs : null,
            time,
        }
    }, [year, semester, dept, name, credits, days, startTime, endTime, profs])

    useEffect(() => {
        let cancelled = false
        filterCourses(params)
            .then(results => { if (!cancelled) setResults(results) })
            .catch(err => console.error("Filter error:", err))
        return () => { cancelled = true }
    }, [params, setResults])

    return (
        <Sidebar variant="floating" collapsible="offcanvas">
            <SidebarHeader className="px-4 py-3 text-lg font-semibold">Filters</SidebarHeader>
            <SidebarContent className="px-2">
                <SidebarGroup>
                    <SidebarGroupLabel>Year</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <Input
                            id="year"
                            type="number"
                            placeholder="2024"
                            value={year}
                            onChange={e => setYear(e.target.value)}
                        />
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Semester</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <Input
                            id="semester"
                            placeholder="Fall, Spring, Winter_Online..."
                            value={semester}
                            onChange={e => setSemester(e.target.value)}
                        />
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Department</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <Combobox
                            items={subjectOptions}
                            value={dept ?? ""}
                            onValueChange={(v: string) => setDept(v || null)}
                        >
                            <ComboboxInput placeholder="Department" showClear={!!dept}>
                                <ComboboxContent>
                                    <ComboboxList>
                                        <ComboboxEmpty>No departments</ComboboxEmpty>
                                        {subjectOptions.map(s => (
                                            <ComboboxItem key={s} value={s}>{s}</ComboboxItem>
                                        ))}
                                    </ComboboxList>
                                </ComboboxContent>
                            </ComboboxInput>
                        </Combobox>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Course name</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <Input
                            id="course-name"
                            placeholder="Course name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>
                        Number of credits{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                            ({credits[0] === credits[1] ? credits[0] : `${credits[0]}–${credits[1]}`})
                        </span>
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="px-2 py-2">
                        <Slider
                            min={CREDITS_MIN}
                            max={CREDITS_MAX}
                            step={1}
                            value={credits}
                            onValueChange={(v: number[]) => setCredits([v[0], v[1]] as [number, number])}
                        />
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Days of the week</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <ToggleGroup
                            type="multiple"
                            variant="outline"
                            value={days}
                            onValueChange={setDays}
                        >
                            {DAYS.map(d => (
                                <ToggleGroupItem key={d.value} value={d.value} aria-label={d.value}>
                                    {d.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Time range</SidebarGroupLabel>
                    <SidebarGroupContent className="flex gap-2">
                        <Input
                            id="start-time"
                            type="time"
                            min="08:00"
                            max="21:00"
                            step="900"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                        />
                        <Input
                            id="end-time"
                            type="time"
                            min="08:00"
                            max="21:00"
                            step="900"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                        />
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Professors</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <Combobox
                            items={facultyOptions}
                            multiple
                            value={profs}
                            onValueChange={(v: string[]) => setProfs(v)}
                        >
                            <ComboboxChips>
                                {profs.map(p => (
                                    <ComboboxChip key={p}>
                                        <ComboboxValue>{p}</ComboboxValue>
                                    </ComboboxChip>
                                ))}
                                <ComboboxChipsInput placeholder={profs.length ? "" : "Select one or more..."} />
                            </ComboboxChips>
                            <ComboboxContent>
                                <ComboboxList>
                                    <ComboboxEmpty>No professors</ComboboxEmpty>
                                    {facultyOptions.map(f => (
                                        <ComboboxItem key={f} value={f}>{f}</ComboboxItem>
                                    ))}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}

/**
 * Memoized so that toggling the sidebar's open/collapsed state (which
 * triggers SidebarProvider to re-render) does not re-render this subtree
 * when `setResults` is a stable reference.
 */
export const FiltersSidebar = React.memo(FiltersSidebarInner)
