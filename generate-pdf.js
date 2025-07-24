import fs from 'fs';
import { marked } from 'marked';
import pdf from 'html-pdf-node';

// Read the markdown file
const markdownContent = fs.readFileSync('VicSurf-Solution-Specifications.md', 'utf8');

// Convert markdown to HTML
const htmlContent = marked(markdownContent);

// Create a complete HTML document with styling
const fullHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>VicSurf Solution Specifications</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #0066cc;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 10px;
        }
        h2 {
            color: #0080ff;
            border-bottom: 1px solid #e1e5e9;
            padding-bottom: 5px;
            margin-top: 30px;
        }
        h3 {
            color: #0099ff;
            margin-top: 25px;
        }
        code {
            background-color: #f6f8fa;
            border-radius: 3px;
            padding: 2px 6px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9em;
        }
        pre {
            background-color: #f6f8fa;
            border-radius: 6px;
            padding: 16px;
            overflow-x: auto;
            border: 1px solid #e1e5e9;
        }
        pre code {
            background-color: transparent;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #0066cc;
            margin: 0;
            padding-left: 16px;
            color: #6a737d;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #e1e5e9;
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background-color: #f6f8fa;
            font-weight: 600;
        }
        .checkmark {
            color: #28a745;
            font-weight: bold;
        }
        ul, ol {
            padding-left: 20px;
        }
        li {
            margin: 5px 0;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>
`;

// PDF options
const options = {
    format: 'A4',
    margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
    },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size: 10px; width: 100%; text-align: center; color: #666;">VicSurf Solution Specifications</div>',
    footerTemplate: '<div style="font-size: 10px; width: 100%; text-align: center; color: #666;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
};

// Generate PDF
async function generatePDF() {
    try {
        const file = { content: fullHtml };
        const pdfBuffer = await pdf.generatePdf(file, options);
        
        // Write PDF to file
        fs.writeFileSync('VicSurf-Solution-Specifications.pdf', pdfBuffer);
        console.log('PDF generated successfully: VicSurf-Solution-Specifications.pdf');
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}

generatePDF();