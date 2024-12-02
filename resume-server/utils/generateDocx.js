// generateDocx.js

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TabStopType,
  TabStopPosition,
} = require("docx");
const fs = require("fs");
const resumeData = require("./resumeData");

const createDocxResume = () => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.personalInfo.name,
                bold: true,
                size: 32,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun(resumeData.personalInfo.email),
              new TextRun(" | "),
              new TextRun(resumeData.personalInfo.phone),
              new TextRun(" | "),
              new TextRun(resumeData.personalInfo.location),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100 },
            font: "Arial",
            size: 24,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `LinkedIn: ${resumeData.personalInfo.linkedin}`,
                style: "Hyperlink",
              }),
              new TextRun(" | "),
              new TextRun({
                text: `GitHub: ${resumeData.personalInfo.github}`,
                style: "Hyperlink",
              }),
              new TextRun(" | "),
              new TextRun({
                text: `Portfolio: ${resumeData.personalInfo.portfolio}`,
                style: "Hyperlink",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100 },
            font: "Arial",
            size: 24,
          }),
          // Technical Summary
          new Paragraph({
            text: "Technical Summary",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
          }),
          new Paragraph({
            text: resumeData.technicalSummary,
            spacing: { after: 300 },
            font: "Arial",
            size: 24,
          }),
          // Core Technical Skills
          new Paragraph({
            text: "Core Technical Skills",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
          }),
          // Programming Languages
          new Paragraph({
            children: [
              new TextRun({ text: "Programming Languages: ", bold: true }),
              new TextRun(
                resumeData.coreSkills.programmingLanguages.join(" | ")
              ),
            ],
            spacing: { after: 100 },
            font: "Arial",
            size: 24,
          }),
          // ML Frameworks
          new Paragraph({
            children: [
              new TextRun({ text: "ML Frameworks: ", bold: true }),
              new TextRun(resumeData.coreSkills.mlFrameworks.join(" | ")),
            ],
            spacing: { after: 100 },
            font: "Arial",
            size: 24,
          }),
          // Cloud Platforms
          new Paragraph({
            children: [
              new TextRun({ text: "Cloud Platforms: ", bold: true }),
              new TextRun(resumeData.coreSkills.cloudPlatforms.join(" | ")),
            ],
            spacing: { after: 100 },
            font: "Arial",
            size: 24,
          }),
          // Tools
          new Paragraph({
            children: [
              new TextRun({ text: "Tools: ", bold: true }),
              new TextRun(resumeData.coreSkills.tools.join(" | ")),
            ],
            spacing: { after: 300 },
            font: "Arial",
            size: 24,
          }),
          // Professional Experience
          new Paragraph({
            text: "Professional Experience",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
          }),
          ...resumeData.workExperience
            .map((job) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${job.title} | ${job.company}`,
                    bold: true,
                  }),
                  new TextRun({
                    text: `\t${job.dates}`,
                    tab: true,
                  }),
                ],
                spacing: { after: 100 },
                font: "Arial",
                size: 24,
              }),
              new Paragraph({
                text: job.location,
                italics: true,
                spacing: { after: 100 },
                font: "Arial",
                size: 24,
              }),
              ...job.achievements.map(
                (achievement) =>
                  new Paragraph({
                    text: achievement,
                    bullet: { level: 0 },
                    font: "Arial",
                    size: 24,
                  })
              ),
              new Paragraph({
                text: "",
                spacing: { after: 100 },
              }),
            ])
            .flat(),
          // Education
          new Paragraph({
            text: "Education",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
          }),
          ...resumeData.education
            .map((edu) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${edu.degree}`,
                    bold: true,
                  }),
                  new TextRun({
                    text: `\t(${edu.graduationYear})`,
                    tab: true,
                  }),
                ],
                spacing: { after: 100 },
                font: "Arial",
                size: 24,
              }),
              new Paragraph({
                text: edu.institution,
                spacing: { after: 100 },
                font: "Arial",
                size: 24,
              }),
              edu.relevantCoursework &&
                new Paragraph({
                  children: [
                    new TextRun({ text: "Relevant Coursework: ", bold: true }),
                    new TextRun(edu.relevantCoursework.join(", ")),
                  ],
                  spacing: { after: 100 },
                  font: "Arial",
                  size: 24,
                }),
              new Paragraph({
                text: "",
                spacing: { after: 100 },
              }),
            ])
            .flat(),
          // Technical Projects
          new Paragraph({
            text: "Technical Projects",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
          }),
          ...resumeData.technicalProjects
            .map((project) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${project.name}`,
                    bold: true,
                  }),
                  new TextRun({
                    text: `\t(${project.technologies.join(", ")})`,
                    tab: true,
                  }),
                ],
                spacing: { after: 100 },
                font: "Arial",
                size: 24,
              }),
              new Paragraph({
                text: project.description,
                spacing: { after: 100 },
                font: "Arial",
                size: 24,
              }),
              ...project.outcomes.map(
                (outcome) =>
                  new Paragraph({
                    text: outcome,
                    bullet: { level: 0 },
                    font: "Arial",
                    size: 24,
                  })
              ),
              new Paragraph({
                text: "",
                spacing: { after: 100 },
              }),
            ])
            .flat(),
          // Certifications
          resumeData.certifications.length > 0 &&
            new Paragraph({
              text: "Certifications",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 100 },
            }),
          ...resumeData.certifications.map(
            (cert) =>
              new Paragraph({
                text: cert,
                bullet: { level: 0 },
                font: "Arial",
                size: 24,
              })
          ),
          // Additional Information
          new Paragraph({
            text: "Additional Information",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
          }),
          // Languages
          new Paragraph({
            children: [
              new TextRun({ text: "Languages: ", bold: true }),
              new TextRun(resumeData.additionalSkills.languages.join(", ")),
            ],
            spacing: { after: 100 },
            font: "Arial",
            size: 24,
          }),
          // Open Source Contributions
          new Paragraph({
            children: [
              new TextRun({ text: "Open Source Contributions: ", bold: true }),
            ],
            spacing: { after: 100 },
            font: "Arial",
            size: 24,
          }),
          ...resumeData.additionalSkills.openSourceContributions.map(
            (contribution) =>
              new Paragraph({
                text: contribution,
                bullet: { level: 0 },
                font: "Arial",
                size: 24,
              })
          ),
        ],
      },
    ],
  });

  Packer.toBuffer(doc)
    .then((buffer) => {
      fs.writeFileSync("Jane_Doe_Resume.docx", buffer);
      console.log("DOCX Resume generated successfully!");
    })
    .catch((err) => {
      console.error("Error generating DOCX:", err);
    });
};

createDocxResume();
