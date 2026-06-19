import type { RoastMode, RecruiterPersona, RoastResult } from '../types'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

const TONE_MAP: Record<RoastMode, string> = {
  friendly: 'Be gentle, warm, and encouraging — roast with love and positivity.',
  recruiter: 'Be professional but wickedly sarcastic — like a recruiter who has seen too many CVs.',
  brutal: 'Be brutally honest and hilariously savage — pull absolutely no punches (but stay workplace-appropriate).',
}

const PERSONA_MAP: Record<RecruiterPersona, string> = {
  friendly_recruiter: 'You are a Friendly Recruiter who wants to help candidates succeed. Focus on potential and encouragement.',
  senior_hr: 'You are a Senior HR Manager who values clarity, professionalism, ATS optimization, and formatting precision.',
  startup_founder: 'You are a Startup Founder who cares about impact, ownership, initiative, and scrappy problem-solving.',
  corporate_hiring: 'You are a Corporate Hiring Manager who prioritizes structure, metrics, hierarchy alignment, and polished presentation.',
  tech_lead: 'You are a Tech Lead who scrutinizes technical depth, measurable achievements, technology choices, and engineering impact.',
}

export async function roastCV(
  cvText: string,
  mode: RoastMode,
  persona: RecruiterPersona,
): Promise<RoastResult> {
  if (!GROQ_API_KEY) {
    throw new Error('VITE_GROQ_API_KEY is not set. Please add it to your .env file.')
  }

  const systemPrompt = `You are an experienced recruiter and professional comedian.
${PERSONA_MAP[persona]}
Analyze the resume provided by the user.
Tone: ${TONE_MAP[mode]}
Do not use offensive language, personal attacks, discrimination, or inappropriate jokes.
Return ONLY valid JSON — no markdown, no code fences, just raw JSON.`

  const userPrompt = `Analyze this CV and return JSON in EXACTLY this structure:
{
  "roastScore": <integer 1-100, how roastable this CV is>,
  "atsScore": <integer 0-100, ATS compatibility score>,
  "roastLevel": <"Mild" | "Medium" | "Spicy" | "Savage">,
  "roastSummary": "<funny overall roast paragraph>",
  "recruiterReaction": "<one funny recruiter reaction starting with an emoji, e.g. '😬 The recruiter searched desperately for achievements.'>",
  "strengths": ["<genuine strength 1>", "<genuine strength 2>", "<genuine strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "missingKeywords": [
    {"keyword": "<keyword>", "reason": "<why it helps>"},
    {"keyword": "<keyword>", "reason": "<why it helps>"},
    {"keyword": "<keyword>", "reason": "<why it helps>"}
  ],
  "funnyObservations": ["<obs 1>", "<obs 2>", "<obs 3>"],
  "beforeAfterExamples": [
    {"before": "<weak original bullet>", "after": "<improved version with metrics>"},
    {"before": "<weak original bullet>", "after": "<improved version with metrics>"}
  ],
  "suggestions": ["<sug 1>", "<sug 2>", "<sug 3>", "<sug 4>", "<sug 5>"],
  "finalVerdict": "<one punchy verdict line with emoji, e.g. '⚡ Needs Minor Improvements'>",
  "atsBreakdown": {
    "keywordOptimization": <integer 0-100>,
    "formattingCompatibility": <integer 0-100>,
    "sectionCompleteness": <integer 0-100>
  }
}

CV to analyze:
${cvText.slice(0, 8000)}`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Groq API error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content ?? '{}'
  return JSON.parse(content) as RoastResult
}
