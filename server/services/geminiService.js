require("dotenv").config();

// NOTE: We call the Gemini REST endpoint directly with fetch instead of the
// @google/genai SDK. As of writing, the SDK's internal auth handling is
// incompatible with newer "AQ."-prefix API keys and returns 401
// ACCESS_TOKEN_TYPE_UNSUPPORTED, even though the same key works fine against
// the REST endpoint with a plain ?key= query param. This is a known,
// currently-unresolved issue on Google's side, not something wrong in our code.
const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const recommendInternships = async (profile, internships) => {
  // Only send the fields Gemini actually needs, keyed by stable _id,
  // so we can merge the response back without fragile string matching.
  const candidates = internships.map((i) => ({
    id: i._id.toString(),
    title: i.title,
    company: i.company,
    description: i.description,
    skillsRequired: i.skillsRequired,
    matchedSkills: i.matchedSkills,
    matchScore: i.matchScore,
  }));

  const prompt = `
You are an AI internship recommendation assistant.

Student Profile:

Branch: ${profile.branch}
CGPA: ${profile.cgpa}

Skills:
${profile.skills.join(", ")}

Interests:
${profile.interests.join(", ")}

Candidate Internships (already pre-filtered and scored by a rule-based
matcher on skills, branch and CGPA):

${JSON.stringify(candidates, null, 2)}

Use the existing matchScore as a starting point, but also consider:

- internship description
- student's interests
- matched skills
- company
- overall suitability

Re-rank the candidates if needed and write a short reason for each.

Return ONLY valid JSON: an array where each item contains exactly:

id     (copy the candidate's "id" field exactly, unchanged)
score  (0-100)
reason (one or two sentences)
`;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to server/.env and restart the server."
    );
  }

  const GEMINI_TIMEOUT_MS = 20000; // fail loudly instead of hanging forever

  const withTimeout = (promise, ms) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Gemini API call timed out after ${ms}ms`)),
          ms
        )
      ),
    ]);

  const response = await withTimeout(
    fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }),
    GEMINI_TIMEOUT_MS
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Gemini API request failed (${response.status}): ${errorBody}`
    );
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error("Unexpected Gemini response shape:", JSON.stringify(data));
    throw new Error("Gemini response did not contain any text content.");
  }

  const cleaned = text.replace(/```json|```/g, "").trim();

  let result;
  try {
    result = JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse Gemini response:", text);
    throw err;
  }

  return result;
};

module.exports = {
  recommendInternships,
};