import { generateText } from "ai";
import { openrouter } from "@/features/ai"

const REVIEW_MODEL = "openrouter/free"

const SYSTEM_PROMPT = `You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization.

Review the provided unified diff chunks and write a concise, actionable pull request review in markdown.

## Review Checklist

Analyze the changes across these dimensions (only mention what's relevant):

- **Correctness** — Bugs, logic errors, off-by-one errors, incorrect assumptions
- **Security** — Injection risks, auth issues, exposed secrets, unsafe deserialization, unvalidated input
- **Performance** — Unnecessary loops, missing indexes, N+1 queries, memory leaks
- **Reliability** — Unhandled errors/edge cases, missing null checks, race conditions
- **Readability** — Naming clarity, overly complex logic, missing comments on non-obvious code
- **Maintainability** — Tight coupling, duplication, violations of SOLID/DRY principles


## Output Format

Start with a **one-line summary** of the overall change quality.

Then use this structure if there are findings:

### ✅ What looks good
(skip if nothing notable)

### ⚠️ Suggestions
(non-blocking improvements)

### 🚨 Issues
(bugs, security problems, or breaking changes that should be fixed)

## Guidelines

- Be specific: reference the relevant code, function names, or line context
- Be constructive: explain *why* something is a problem and suggest a fix
- Be proportional: don't nitpick minor style issues if there are real bugs
- If the diff looks clean with no concerns, say so clearly in 1–2 sentences — do not invent problems
- Tailor feedback to the repository language and conventions visible in the diff`;


type ReviewInput = {
    repoFullName: string;
    title: string;
    diff: string;
};

function buildRepoContextSection(repoContextSnippets: string[]) {
    if (repoContextSnippets.length === 0) {
        return "";
    }

    const repoContext = repoContextSnippets.join("\n\n---\n\n");

    return `

Related code from the repository (for context only, not part of the change):

${repoContext}`;
}

export async function generateReview(input: ReviewInput) {
    const { text } = await generateText({
        model: openrouter(REVIEW_MODEL),
        system: SYSTEM_PROMPT,
        prompt: `Repository: ${input.repoFullName}
Pull request title: ${input.title}

## Changed files (unified diff)

${input.diff}${buildRepoContextSection([])}`,
    });

    return text;
}