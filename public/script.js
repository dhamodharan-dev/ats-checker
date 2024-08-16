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
  return `Please analyze the following resume in comparison to the provided job description and deliver a detailed JSON response structured as follows:

{
  "checkList": {
    "name": "Full Name",
    "jobRole": "Job Title/Position",
    "contact": {
      "number": "Phone Number",
      "email": "Email Address"
    },
    "socialProfiles": {
      "linkedIn": "LinkedIn Profile URL",
      "portfolio": "Personal Website/Portfolio"
    },
    "location": "Location (City, State, Country)",
    "summary": "Professional Summary/Objective",
    "awardsAndRecognition": "Awards and Recognitions",
    "education": "Highest Degree Earned",
    "projects": "List of Projects (Title)",
    "certifications": "List of Certifications (Title)",
    "languagesKnown": "Languages Spoken/Written (e.g., English, Spanish)"
  },
  "matchingDetails": {
    "keywordsMatched": "Keywords in the resume matching the job description (e.g., JavaScript, teamwork)",
    "keywordsMissing": "Keywords in the job description missing from the resume (e.g., JavaScript, teamwork)",
    "skillsMatched": "Skills in the resume matching the job description (e.g., JavaScript, React)",
    "skillsMissing": "Key skills required by the job description but missing in the resume (e.g., JavaScript, React)",
    "experienceMatched": "Relevant experiences in the resume matching the job description (e.g., frontend development, team leadership)",
    "experienceMissing": "Key experiences required by the job description but missing in the resume (e.g., frontend development, team leadership)",
    "educationMatched": "Educational qualifications in the resume that match the job description (e.g., Bachelor's in Computer Science)",
    "educationMissing": "Educational qualifications required by the job description but missing from the resume (e.g., Bachelor's in Computer Science)",
    "overallScore": "A score from 0 to 100 indicating how well the resume matches the job description",
    "readability": "Readability level of the resume (e.g., Excellent, Good, Fair)",
    "actionVerbsUsed": "Number of action verbs used in the resume",
    "estimatedReadingTime": "Estimated time to read the resume in minutes"
  },
  "summary": "A brief summary of how well the resume aligns with the job description",
  "suggestions": "Suggestions for improving the resume to better match the job description"
}

Job Description:

${jobDescription}

Resume Text:

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
