// generatePdf.js

const PDFDocument = require("pdfkit");
const fs = require("fs");
const resumeData = require("./resumeData");

const createPdfResume = () => {
  const doc = new PDFDocument({ margin: 50, size: "LETTER" });

  // Pipe the PDF into a writable stream
  doc.pipe(fs.createWriteStream("Jane_Doe_Resume.pdf"));

  // Define some basic styles
  const headerFontSize = 20;
  const subHeaderFontSize = 14;
  const normalFontSize = 12;
  const lineSpacing = 4;

  // Helper function to add a heading
  const addHeading = (text) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(headerFontSize)
      .text(text, { underline: false, align: "left" })
      .moveDown(0.5);
  };

  // Helper function to add subheadings
  const addSubHeading = (text) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(subHeaderFontSize)
      .text(text, { align: "left" })
      .moveDown(0.25);
  };

  // Helper function to add normal text
  const addText = (text, options = {}) => {
    doc
      .font("Helvetica")
      .fontSize(normalFontSize)
      .text(text, options)
      .moveDown(0.25);
  };

  // Header
  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .text(resumeData.personalInfo.name, { align: "center" })
    .moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(12)
    .text(
      `${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.location}`,
      { align: "center" }
    )
    .moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(12)
    .text(
      `LinkedIn: ${resumeData.personalInfo.linkedin} | GitHub: ${resumeData.personalInfo.github} | Portfolio: ${resumeData.personalInfo.portfolio}`,
      { align: "center" }
    )
    .moveDown(1);

  // Technical Summary
  addHeading("Technical Summary");
  addText(resumeData.technicalSummary);
  doc.moveDown(0.5);

  // Core Technical Skills
  addHeading("Core Technical Skills");
  addSubHeading("Programming Languages");
  addText(resumeData.coreSkills.programmingLanguages.join(" | "));
  addSubHeading("ML Frameworks");
  addText(resumeData.coreSkills.mlFrameworks.join(" | "));
  addSubHeading("Cloud Platforms");
  addText(resumeData.coreSkills.cloudPlatforms.join(" | "));
  addSubHeading("Tools");
  addText(resumeData.coreSkills.tools.join(" | "));
  doc.moveDown(0.5);

  // Professional Experience
  addHeading("Professional Experience");
  resumeData.workExperience.forEach((job) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(`${job.title} | ${job.company}`, { continued: true });
    doc.font("Helvetica").text(`\t${job.dates}`, { align: "right" });
    addText(job.location, { italics: true });

    job.achievements.forEach((achievement) => {
      doc.moveDown(0.1);
      doc.circle(0, 0, 2).stroke(); // Bullet point
      doc.text(`\u2022 ${achievement}`, { indent: 20, lineGap: lineSpacing });
    });
    doc.moveDown(0.5);
  });

  // Education
  addHeading("Education");
  resumeData.education.forEach((edu) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(`${edu.degree}`, { continued: true });
    doc.font("Helvetica").text(`\t(${edu.graduationYear})`, { align: "right" });
    addText(edu.institution);

    if (edu.relevantCoursework) {
      addText(`Relevant Coursework: ${edu.relevantCoursework.join(", ")}`);
    }
    doc.moveDown(0.5);
  });

  // Technical Projects
  addHeading("Technical Projects");
  resumeData.technicalProjects.forEach((project) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(`${project.name}`, { continued: true });
    doc
      .font("Helvetica")
      .text(`\t(${project.technologies.join(", ")})`, { align: "right" });
    addText(project.description);

    project.outcomes.forEach((outcome) => {
      doc.moveDown(0.1);
      doc.circle(0, 0, 2).stroke(); // Bullet point
      doc.text(`\u2022 ${outcome}`, { indent: 20, lineGap: lineSpacing });
    });
    doc.moveDown(0.5);
  });

  // Certifications
  if (resumeData.certifications.length > 0) {
    addHeading("Certifications");
    resumeData.certifications.forEach((cert) => {
      doc.circle(0, 0, 2).stroke(); // Bullet point
      doc.text(`\u2022 ${cert}`, { indent: 20, lineGap: lineSpacing });
    });
    doc.moveDown(0.5);
  }

  // Additional Information
  addHeading("Additional Information");
  addSubHeading("Languages");
  addText(resumeData.additionalSkills.languages.join(", "));
  addSubHeading("Open Source Contributions");
  resumeData.additionalSkills.openSourceContributions.forEach(
    (contribution) => {
      doc.circle(0, 0, 2).stroke(); // Bullet point
      doc.text(`\u2022 ${contribution}`, { indent: 20, lineGap: lineSpacing });
    }
  );

  // Finalize the PDF and end the stream
  doc.end();
  console.log("PDF Resume generated successfully!");
};

createPdfResume();
