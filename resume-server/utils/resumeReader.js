// a nodejs code to read a PDF file at a fixed path.
const fs = require("fs");
const pdf = require("pdf-parse");
const { parse } = require("docx-parser");

// const filePath = "resume-server/Resumes";

async function getResumePath() {
  let filePath = "Resumes";
  const files = fs.readdirSync(filePath);
  console.log(`getCurrentPath: ${files}`);
  filePath = `${filePath}/${files[0]}`;
  return filePath;
}

async function readDocx(filePath) {
  const doc = await parse(filePath);
  return doc;
}

async function readPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

async function readResume() {
  const files = await getResumePath();
  console.log(`readResume: ${files}`);
  const extension = files.split(".").pop();
  console.log(`Extension: ${extension}`);
  switch (extension) {
    case "pdf":
      return await readPdf(files);
    case "docx":
      return await readDocx(files);
    default:
      return "Unsupported file type";
  }
}

module.exports = { readResume };
