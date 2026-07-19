require("dotenv").config(); // add this too, see point 2 from before

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const recommendInternships = async (profile, internships) => {
  const prompt = `
You are an AI internship recommendation assistant.

Student Profile:

Branch: ${profile.branch}
CGPA: ${profile.cgpa}

Skills:
${profile.skills.join(", ")}

Interests:
${profile.interests.join(", ")}

Available Internships:

${JSON.stringify(internships, null, 2)}

You are an AI career advisor.

The internships already include a calculated matchScore based on skills, branch and CGPA.

Use this score as a starting point, but also consider:

- internship description
- student's interests
- matched skills
- company
- overall suitability

Re-rank them if needed.



Return ONLY valid JSON.

Each internship should contain:

title
company
score
reason
`;

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;

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