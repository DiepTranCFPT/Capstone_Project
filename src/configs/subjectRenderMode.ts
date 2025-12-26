/**
 * Configuration for subject render modes in FRQ questions.
 * 
 * Render Modes:
 * - "latex": For subjects requiring mathematical formulas (Math, Physics, Chemistry)
 * - "splitscreen": For subjects with long text answers (History, English)
 * - "normal": Default mode for other subjects
 * 
 * To add a new subject:
 * 1. Add the subject code or name to the appropriate array
 * 2. The matching is case-insensitive and checks both code AND name
 */

export type SubjectRenderMode = "latex" | "splitscreen" | "normal";

/**
 * Subject identifiers for LaTeX mode (math formulas).
 * Include both subject codes and names for flexible matching.
 */
export const LATEX_SUBJECT_IDENTIFIERS: string[] = [
    // Codes
    "MATH",
    "PHY",
    "CHEM",
    "CALC",
    "ALG",
    "GEOM",
    "TRIG",
    "STAT",
    // Names
    "Mathematics",
    "Physics",
    "Chemistry",
    "Calculus",
    "Algebra",
    "Geometry",
    "Trigonometry",
    "Statistics",
    // AP STEM subjects (LaTeX mode)
    "AP Calculus AB",
    "AP Calculus BC",
    "AP Statistics",
    "AP Chemistry",
    "AP Physics 1",
    "AP Physics 2",
    "AP Physics C: Mechanics",
    "AP Physics C: Electricity and Magnetism",
    "AP Biology",
    "AP Computer Science A",
    "AP Computer Science Principles",
    "AP Precalculus",
];

/**
 * Subject identifiers for split screen mode (long text answers).
 * Include both subject codes and names for flexible matching.
 */
export const SPLITSCREEN_SUBJECT_IDENTIFIERS: string[] = [
    // Codes
    "AP 092",
    "HIST",
    "ENG",
    "LIT",
    "GEO",
    "SOC",
    "PHIL",
    // Names
    "History",
    "AP English Language",
    "Literature",
    "English",
    "Geography",
    "Social Studies",
    "Philosophy",
    // AP Text-heavy subjects (Split screen mode)
    "AP Psychology",
    "AP Environmental Science",
    "AP US History",
    "AP World History",
    "AP World History: Modern",
    "AP European History",
    "AP US Government and Politics",
    "AP Comparative Government and Politics",
    "AP Human Geography",
    "AP Macroeconomics",
    "AP Microeconomics",
    "AP English Language and Composition",
    "AP English Literature and Composition",
    "AP Art History",
    "AP Music Theory",
    "AP Spanish Language and Culture",
    "AP Spanish Literature and Culture",
    "AP French Language and Culture",
    "AP German Language and Culture",
    "AP Italian Language and Culture",
    "AP Japanese Language and Culture",
    "AP Chinese Language and Culture",
    "AP Latin",
    "AP African American Studies",
    "AP Seminar",
    "AP Research",
];

/**
 * Get the render mode for a given subject.
 * Matches against both subject code and name.
 * 
 * @param subjectCodeOrName - The code or name of the subject from the API
 * @returns The render mode for the subject
 */
export const getSubjectRenderMode = (subjectCodeOrName: string): SubjectRenderMode => {
    const normalized = subjectCodeOrName.toLowerCase().trim();

    // Check for LaTeX subjects (by code or name)
    const isLatex = LATEX_SUBJECT_IDENTIFIERS.some(
        (identifier) => identifier.toLowerCase() === normalized
    );
    if (isLatex) return "latex";

    // Check for split screen subjects (by code or name)
    const isSplitscreen = SPLITSCREEN_SUBJECT_IDENTIFIERS.some(
        (identifier) => identifier.toLowerCase() === normalized
    );
    if (isSplitscreen) return "splitscreen";

    // Default to normal mode
    return "normal";
};

/**
 * Get the render mode by checking both code and name of a subject.
 * Use this when you have access to the full subject object from API.
 * 
 * @param code - The subject code (e.g., "MATH", "AP 092")
 * @param name - The subject name (e.g., "Mathematics", "AP English Language")
 * @returns The render mode for the subject
 */
export const getSubjectRenderModeByCodeAndName = (
    code: string | undefined,
    name: string
): SubjectRenderMode => {
    // First try to match by code (more reliable)
    if (code) {
        const modeByCode = getSubjectRenderMode(code);
        if (modeByCode !== "normal") return modeByCode;
    }

    // Fallback to matching by name
    return getSubjectRenderMode(name);
};
