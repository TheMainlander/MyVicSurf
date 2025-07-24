import fs from 'fs';
import { marked } from 'marked';

// Read the markdown file
const markdownContent = fs.readFileSync('VicSurf-Solution-Specifications.md', 'utf8');

// Convert markdown to HTML
const htmlContent = marked(markdownContent);

// Create a complete HTML document with PDF-friendly styling
const fullHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>VicSurf Solution Specifications</title>
    <style>
        @media print {
            body { margin: 0.5in; }
            .page-break { page-break-before: always; }
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            font-size: 12px;
        }
        h1 {
            color: #0066cc;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 10px;
            font-size: 24px;
        }
        h2 {
            color: #0080ff;
            border-bottom: 1px solid #e1e5e9;
            padding-bottom: 5px;
            margin-top: 30px;
            font-size: 18px;
        }
        h3 {
            color: #0099ff;
            margin-top: 25px;
            font-size: 16px;
        }
        h4 {
            color: #333;
            margin-top: 20px;
            font-size: 14px;
        }
        code {
            background-color: #f6f8fa;
            border-radius: 3px;
            padding: 2px 6px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 11px;
        }
        pre {
            background-color: #f6f8fa;
            border-radius: 6px;
            padding: 16px;
            overflow-x: auto;
            border: 1px solid #e1e5e9;
            font-size: 10px;
        }
        pre code {
            background-color: transparent;
            padding: 0;
        }
        ul, ol {
            padding-left: 20px;
        }
        li {
            margin: 3px 0;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 10px 0;
            font-size: 11px;
        }
        th, td {
            border: 1px solid #e1e5e9;
            padding: 6px 8px;
            text-align: left;
        }
        th {
            background-color: #f6f8fa;
            font-weight: 600;
        }
    </style>
</head>
<body>
    ${htmlContent}
    
    <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e1e5e9; font-size: 10px; color: #666; text-align: center;">
        <p><strong>VicSurf Solution Specifications</strong></p>
        <p>Generated: July 24, 2025 | Version: Production-ready v1.0</p>
        <p>Platform: Replit + Neon Database | Author: VicSurf Development Team</p>
    </div>
</body>
</html>
`;

// Write HTML to file
fs.writeFileSync('VicSurf-Solution-Specifications.html', fullHtml);
console.log('HTML version generated: VicSurf-Solution-Specifications.html');
console.log('You can open this HTML file in your browser and use "Print to PDF" to create a PDF version.');