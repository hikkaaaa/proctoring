import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

export async function POST(request: Request) {
    try {
        let { filename } = await request.json();

        const reportsDir = path.join(process.cwd(), 'reports');

        if (!filename) {
            if (!fs.existsSync(reportsDir)) {
                return NextResponse.json({ error: 'No reports directory found' }, { status: 404 });
            }
            const files = fs.readdirSync(reportsDir)
                .filter(f => f.endsWith('.txt'))
                .map(f => ({ name: f, time: fs.statSync(path.join(reportsDir, f)).mtime.getTime() }))
                .sort((a, b) => b.time - a.time);

            if (files.length === 0) {
                return NextResponse.json({ error: 'No reports found' }, { status: 404 });
            }
            filename = files[0].name;
        }

        const filePath = path.join(reportsDir, filename);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        const reportContent = fs.readFileSync(filePath, 'utf8');

        // Check for API Key
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            // Mock analysis for testing
            console.log('OpenAI API Key not found, returning mock analysis');
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

            return NextResponse.json({
                rawContent: reportContent,
                verdict: "SUSPICIOUS",
                confidence: 85,
                summary: "Mock Analysis: The student showed frequent gaze violations toward the end of the session, coinciding with multiple tab switches. This patterns suggests unauthorized research. No multiple faces detected.",
                timeline: [
                    { time: "00:45", event: "Tab Switch Detected" },
                    { time: "01:12", event: "Gaze Violation (Left)" },
                    { time: "05:30", event: "Gaze Violation (Left)" }
                ]
            });
        }

        const openai = new OpenAI({ apiKey });

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a strict Exam Proctor AI. Analyze the following log of student behavior.
Look for patterns:
- Frequent gaze violations + tab switches = Likely looking up answers.
- 'Multiple Faces' = Critical Cheating.
- 'Person Missing' for long periods = Suspicious.
Reconstruct the student's workflow and give a final verdict: PASS, SUSPICIOUS, or FAIL, with a confidence score (0-100%) and a summary of why.
Return the result strictly in JSON format:
{
  "verdict": "PASS" | "SUSPICIOUS" | "FAIL",
  "confidence": number,
  "summary": "string",
  "analysis": "string"
}`
                },
                {
                    role: "user",
                    content: reportContent
                }
            ],
            response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(response.choices[0].message.content || "{}");

        return NextResponse.json({
            rawContent: reportContent,
            ...analysis
        });

    } catch (error: any) {
        console.error('Analysis Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
