import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { content, filename } = await request.json();

        // Define the reports directory in the project root
        // Process.cwd() in Next.js points to the project root (where package.json is)
        const reportsDir = path.join(process.cwd(), 'reports');

        // Ensure the directory exists
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const filePath = path.join(reportsDir, filename);

        // Write the file
        fs.writeFileSync(filePath, content, 'utf8');

        return NextResponse.json({
            success: true,
            message: `Report saved to ${filePath}`
        });

    } catch (error: any) {
        console.error('Save Report Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
