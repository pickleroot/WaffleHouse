import type { Professor } from "@/lib/types"
import { formatProfessorName } from "@/lib/utils"

const GROVE_CITY_COLLEGE_ID = "U2Nob29sLTM4NA=="
const RATE_MY_PROFESSOR_ENDPOINT = "/api/ratemyprofessors"

const TEACHER_SEARCH_QUERY = `
    query TeacherSearch($query: TeacherSearchQuery!, $count: Int!) {
        newSearch {
            teachers(query: $query, first: $count) {
                edges {
                    node {
                        id
                        legacyId
                        firstName
                        lastName
                        department
                        avgRating
                        numRatings
                        wouldTakeAgainPercent
                        avgDifficulty
                    }
                }
            }
        }
    }
`

interface RateMyProfessorTeacherNode {
    id: string
    legacyId: number
    firstName: string
    lastName: string
    department: string | null
    avgRating: number | null
    numRatings: number | null
    wouldTakeAgainPercent: number | null
    avgDifficulty: number | null
}

interface RateMyProfessorResponse {
    data?: {
        newSearch?: {
            teachers?: {
                edges?: Array<{
                    node?: RateMyProfessorTeacherNode | null
                }>
            }
        }
    }
    errors?: Array<{
        message?: string
    }>
}

export interface RateMyProfessorMatch {
    id: string
    legacyId: number
    professorName: string
    department: string
    overallQuality: number | null
    ratingsCount: number
    wouldTakeAgainPercent: number | null
    difficulty: number | null
    profileUrl: string
}

const professorMatchCache = new Map<string, Promise<RateMyProfessorMatch | null>>()

function normalizeName(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
}

function buildProfileUrl(legacyId: number): string {
    return `https://www.ratemyprofessors.com/professor/${legacyId}`
}

function toMatch(node: RateMyProfessorTeacherNode): RateMyProfessorMatch {
    const professorName = `${node.firstName} ${node.lastName}`.trim()

    return {
        id: node.id,
        legacyId: node.legacyId,
        professorName,
        department: node.department || "Department unavailable",
        overallQuality: node.avgRating,
        ratingsCount: node.numRatings ?? 0,
        wouldTakeAgainPercent: node.wouldTakeAgainPercent,
        difficulty: node.avgDifficulty,
        profileUrl: buildProfileUrl(node.legacyId),
    }
}

function getBestExactMatch(
    professorName: string,
    nodes: RateMyProfessorTeacherNode[]
): RateMyProfessorMatch | null {
    const normalizedProfessorName = normalizeName(professorName)
    const exactMatches = nodes
        .filter((node) => normalizeName(`${node.firstName} ${node.lastName}`) === normalizedProfessorName)
        .map(toMatch)
        .sort((left, right) => right.ratingsCount - left.ratingsCount)

    return exactMatches[0] ?? null
}

async function fetchProfessorMatch(professorName: string): Promise<RateMyProfessorMatch | null> {
    const response = await fetch(RATE_MY_PROFESSOR_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: TEACHER_SEARCH_QUERY,
            variables: {
                count: 10,
                query: {
                    text: professorName,
                    schoolID: GROVE_CITY_COLLEGE_ID,
                },
            },
        }),
    })

    if (!response.ok) {
        throw new Error(`Rate My Professors request failed with ${response.status}`)
    }

    const payload = (await response.json()) as RateMyProfessorResponse
    if (payload.errors && payload.errors.length > 0) {
        const message = payload.errors[0]?.message || "Unknown Rate My Professors error"
        throw new Error(message)
    }

    const nodes = payload.data?.newSearch?.teachers?.edges
        ?.map((edge) => edge.node)
        .filter((node): node is RateMyProfessorTeacherNode => Boolean(node)) ?? []

    return getBestExactMatch(professorName, nodes)
}

export async function getRateMyProfessorMatch(
    professorName: string
): Promise<RateMyProfessorMatch | null> {
    const normalizedProfessorName = normalizeName(professorName)
    if (!normalizedProfessorName || normalizedProfessorName === "unknown professor") {
        return null
    }

    const existingRequest = professorMatchCache.get(normalizedProfessorName)
    if (existingRequest) {
        return existingRequest
    }

    const request = fetchProfessorMatch(professorName).catch((error) => {
        professorMatchCache.delete(normalizedProfessorName)
        throw error
    })
    professorMatchCache.set(normalizedProfessorName, request)

    return request
}

export async function getRateMyProfessorMatches(professors: Professor[]): Promise<Array<{
    professor: Professor
    match: RateMyProfessorMatch
}>> {
    const matches = await Promise.all(
        professors.map(async (professor) => {
            const professorName = formatProfessorName(professor)
            const match = await getRateMyProfessorMatch(professorName)

            return match ? { professor, match } : null
        })
    )

    return matches.filter((entry): entry is { professor: Professor; match: RateMyProfessorMatch } => Boolean(entry))
}
