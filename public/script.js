import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBx6rcdADN5ZWcJw8K77Ns4T7xmxeeHcYo";
const genAI = new GoogleGenerativeAI(API_KEY);

const uploadForm = document.getElementById("uploadForm");
const progressElement = document.getElementById("progress");
const promptResultElement = document.getElementById("prompt-result");
const descriptionInput = document.querySelector(".description-input");

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
      sessionStorage.setItem("resumeReportData", responseText);

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
    "name": "Name",
    "jobRole": "Job Title/Position",
    "number": "Mobile number",
    "email": "Email address",
    "linkedIn": "LinkedIn profile hyperlink",
    "location": "Location",
    "portfolio": "Personal website or portfolio",
    "summary": "Profile summary or objective",
    "awardsAndRecognition": "Awards",
    "education": "Degree",
    "projects": "title",
    "certifications": "title",
    "languagesKnown": "Language 1, Language 2"
  },
  "matchingDetails": {
    "keywordsMatched": "keywords from the resume that match the job description (e.g., frontend, problem-solving)",
    "keywordsMissing": "keywords mentioned in the job description but missing from the resume (e.g., frontend, problem-solving)",
    "skillsMatched": "skills from the resume that match the job description (e.g., html, css)",
    "skillsMissing": "key skills mentioned in the job description but missing from the resume (e.g., html, css)",
    "experienceMatched": "relevant experiences from the resume that match the job description requirements (e.g., frontend, webdevelopment)",
    "experienceMissing": "key experiences mentioned in the job description but missing from the resume (e.g., frontend, webdevelopment)",
    "educationMatched": "Details of educational qualifications from the resume that match the job description (e.g., bca)",
    "educationMissing": "Details of educational qualifications required by the job description but missing from the resume (e.g., bca)",
    "overallScore": "A score out of 100 indicating how well the resume matches the job description",
    "readability": "Readability grade of the resume (e.g., Excellent, Good, Fair, Poor)",
    "actionVerbsUsed": "Count of action verbs used in the resume",
    "estimatedReadingTime": "Estimated reading time of the resume"
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
