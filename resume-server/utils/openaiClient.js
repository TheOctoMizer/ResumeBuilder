// utils/openaiClient.js

import OpenAI from "openai";


const openAiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'http://localhost:1234/v1',
});

const MODEL = "gemma-2-9b-it"; // Replace with your model

async function processJobContent(content, {signal} = {}){
    const systemInstruction = `
    Extract the following entities from the job posting text:
    {
      "COMPANY": "The company name",
      "TITLE": "Job title",
      "SALARY": "Salary information",
      "LOCATION": "Location",
      "EXPERIENCE": "List of experience levels (in years)",
      "EDUCATION": ["Array of educational qualifications"],
      "SKILL": ["List of required skills (concise entities)"],
      "WORK_LOCATION": "Remote, Onsite, Hybrid, or None",
      "WORK_ARRANGEMENT": "Full-time, Part-time, Internship, Contract, or None"
    }
    Use "None" if "WORK_LOCATION" or "WORK_ARRANGEMENT" is not mentioned 
    `;

    try {
        const response = await openAiClient.chat.completions.create({
            stream:false,
            model: MODEL,
            messages: [
                {role: "system", content: systemInstruction},
                {role: "user", content: content.trim()},
            ],
            temperature: 0.0,
            signal,
            response_format: {
                "type": "json_schema",
                "json_schema": {
                    "name": "job_details",
                    "description": "Extracted job details in a structured JSON format",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "COMPANY": {
                                "description": "The name of the company offering the job",
                                "type": "string"
                            },
                            "TITLE": {
                                "description": "The title of the job position",
                                "type": "string"
                            },
                            "SALARY": {
                                "description": "The salary range or amount for the job",
                                "type": "string"
                            },
                            "LOCATION": {
                                "description": "The location where the job is based",
                                "type": "string"
                            },
                            "EXPERIENCE": {
                                "description": "Minimum number of years of relevant experience required, specified as an array of numbers",
                                "type": "array",
                                "items": {"type": "number"}
                            },
                            "EDUCATION": {
                                "description": "Educational qualifications required for the job, specified as an array of strings",
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "SKILL": {
                                "description": "Key skills required for the job, specified as an array of strings",
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "WORK_LOCATION": {
                                "description": "The work location (e.g., on-site, remote, hybrid)",
                                "type": "string",
                                "enum": ["Onsite", "Remote", "Hybrid", "None"]
                            },
                            "WORK_ARRANGEMENT": {
                                "description": "The work arrangement (e.g., full-time, contract)",
                                "type": "string",
                                "enum": ["Full-time", "Internship","Part-time", "Contract", "None"]
                            },
                            "RESPONSIBILITIES": {
                                "description": "List of main responsibilities of the job role, specified as an array of strings",
                                "type": "array",
                                "items": {"type": "string"}
                            },
                        },
                        "required": [
                            "COMPANY", "TITLE", "SALARY", "LOCATION", "EXPERIENCE", "EDUCATION",
                            "SKILL", "WORK_ARRANGEMENT", "RESPONSIBILITIES", "WORK_LOCATION"
                        ],
                        "additionalProperties": false
                    }
                }
            }
        });

        // const messageContent = response.data.choices[0].message.content;
        const messageContent = await response.choices[0].message.content;
        // remove ```json and ```
        const match = messageContent.match(/```json([\s\S]*?)```/);

        if (match) {
            const jsonContent = match[1].trim(); // Extracted JSON content and remove extra spaces/newlines
            // console.log(jsonContent);

            // Parse it into a JSON object if needed
            // console.log(jsonObject);
            return JSON.parse(jsonContent);
        } else {
            // console.log("No JSON content found.");
            return JSON.parse(messageContent);
        }
    } catch (error) {
        console.error("Error calling OpenAI API:", error.message);
        return null;
    }
};

export {
    processJobContent
}
