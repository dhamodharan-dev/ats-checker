document.addEventListener("DOMContentLoaded", () => {

  const resumeReportData = JSON.parse(
    sessionStorage.getItem("resumeReportData")
  );

  if (resumeReportData) {
    populateFields(resumeReportData);
    console.log(resumeReportData);
  } else {
    document.querySelector(".report-section").textContent =
      "No report data available.";
  }
});

function populateFields(responseJson) {
  const checkListFields = {
    name: document.querySelector(".name"),
    jobRole: document.querySelector(".jobrole"),
    email: document.querySelector(".email"),
    number: document.querySelector(".mobile"),
    linkedIn: document.querySelector(".linkedin"),
    portfolio: document.querySelector(".portfolio"),
    projects: document.querySelector(".projects"),
    awardsAndRecognition: document.querySelector(".awards-and-recognition"),
    certifications: document.querySelector(".certifications"),
    education: document.querySelector(".education"),
    languagesKnown: document.querySelector(".languages"),
  };

  const overAllFields = {
    readability: document.querySelector(".readability"),
    estimatedReadingTime: document.querySelector(".estimated-reading-time"),
    actionVerbsUsed: document.querySelector(".action-verbs-used"),
    overallScore: document.querySelector(".overall-score"),
  };

  const missingDetailsFields = {
    educationMissing: document.querySelector(".education-missing"),
    experienceMissing: document.querySelector(".experience-missing"),
    keywordsMissing: document.querySelector(".keywords-missing"),
    skillsMissing: document.querySelector(".skills-missing"),
  };

  const summarySection = document.querySelector(".summary");
  const suggestionsSection = document.querySelector(".suggestions");

  try {
    for (const property in checkListFields) {
      setFieldContent(
        checkListFields[property],
        responseJson.checkList[property]
      );
    }

    for (const property in overAllFields) {
      setFieldContent(
        overAllFields[property],
        responseJson.matchingDetails[property]
      );
    }

    for (const property in missingDetailsFields) {
      setFieldContent(
        missingDetailsFields[property],
        responseJson.matchingDetails[property]
      );
    }

    setFieldContent(summarySection, responseJson.summary);
    setFieldContent(suggestionsSection, responseJson.suggestions);
  } catch (error) {
    console.error("Error populating fields:", error.message);
  }
}

function setFieldContent(fieldElement, content) {
  if (fieldElement) {
    fieldElement.textContent = content || "N/A";
  }
}
