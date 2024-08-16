import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBx6rcdADN5ZWcJw8K77Ns4T7xmxeeHcYo";
const genAI = new GoogleGenerativeAI(API_KEY);

const uploadForm = document.getElementById("uploadForm");
const progressElement = document.getElementById("progress");
const promptResultElement = document.getElementById("prompt-result");
const descriptionInput = document.querySelector(".description-input");

const fields = {
  name: document.querySelector(".name"),
  jobRole: document.querySelector(".jobrole"),
  email: document.querySelector(".email"),
  mobile: document.querySelector(".mobile"),
  linkedIn: document.querySelector(".linkedin"),
  portfolio: document.querySelector(".portfolio"),
  projects: document.querySelector(".projects"),
  awardsAndRecognition: document.querySelector(".awards-and-recognition"),
  certifications: document.querySelector(".certifications"),
  education: document.querySelector(".education"),
  languages: document.querySelector(".languages"),
};

const matchingDetailsSection = document.querySelector(".matching-details");
const summarySection = document.querySelector(".summary");
const suggestionsSection = document.querySelector(".suggestions");

uploadForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  showLoader();
  progressElement.textContent = "Uploading...";

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      await useGenerativeAI(result.text);
    } else {
      handleError("Failed to extract text.");
    }
  } catch (error) {
    handleError("An error occurred during upload.");
  } finally {
    hideLoader();
    progressElement.textContent = "";
  }
});

function showLoader() {
  const loader = document.createElement("div");
  loader.classList.add("loader");
  promptResultElement.textContent = "";
  promptResultElement.appendChild(loader);
}

function hideLoader() {
  const loader = document.querySelector(".loader");
  if (loader && loader.parentNode === promptResultElement) {
    promptResultElement.removeChild(loader);
  }
}

async function useGenerativeAI(text) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = generatePrompt(text, descriptionInput.value);
    const result = await model.generateContent(prompt);

    const candidates = result.response.candidates;
    if (candidates.length > 0) {
      const responseContent = candidates[0].content;

      const responseText = responseContent.parts[0].text;
      const responseJson = JSON.parse(responseText);

      // Store the responseJson in sessionStorage
      sessionStorage.setItem("resumeReportData", JSON.stringify(responseJson));

      // Redirect to the report page
      window.location.href = "report.html";
    } else {
      handleError("No content available in the response.");
    }
  } catch (error) {
    console.error("Detailed Error with Generative AI:", error);
    handleError("An error occurred with Generative AI.");
  }
}

function generatePrompt(resumeText, jobDescription) {
  return `I have a job description and a resume. Please analyze the resume to determine how well it matches the job description. Provide a detailed JSON response with the following structure:

{
  "checkList": {
    "name": "Name or null if not available",
    "jobTitle": "Job Title/Position or null if not available",
    "number": "Mobile number or null if not available",
    "email": "Email address or null if not available",
    "linkedin": "LinkedIn profile hyperlink or null if not available",
    "location": "Location or null if not available",
    "portfolio": "Personal website or portfolio or null if not available",
    "summary": "Profile summary or objective or null if not available",
    "awardsAndRecognition": "Awards or null if not available",
    "education": "Degree",
    "projects": "title or null if not available",
    "certifications": "title",
    "languagesKnown": "Language 1, Language 2 or null if not available"
  },
  "matchingDetails": {
    "keywordsMatched": "List of keywords from the resume that match the job description or null if not available",
    "keywordsMissing": "List of keywords mentioned in the job description but missing from the resume or null if not available",
    "skillsMatched": "List of skills from the resume that match the job description or null if not available",
    "skillsMissing": "List of key skills mentioned in the job description but missing from the resume or null if not available",
    "experienceMatched": "List of relevant experiences from the resume that match the job description requirements or null if not available",
    "experienceMissing": "List of key experiences mentioned in the job description but missing from the resume or null if not available",
    "educationMatched": "Details of educational qualifications from the resume that match the job description or null if not available",
    "educationMissing": "Details of educational qualifications required by the job description but missing from the resume or null if not available",
    "overallScore": "A score out of 100 indicating how well the resume matches the job description or null if not available",
    "readability": "Readability grade of the resume (e.g., Excellent, Good, Fair) or null if not available",
    "actionVerbsUsed": "Count of action verbs used in the resume or null if not available",
    "estimatedReadingTime": "Estimated reading time of the resume in minutes or null if not available"
  },
  "summary": "A brief summary explaining the overall match between the resume and the job description",
  "suggestions": "Suggestions for improvement"
}

Here is the job description:

${jobDescription}

And here is the resume:

${resumeText}`;
}

function handleError(message) {
  console.error(message);
  promptResultElement.textContent = message;
}
