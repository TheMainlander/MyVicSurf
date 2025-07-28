import { db } from './db.js';
import { marketingDocuments } from '../shared/schema.js';
import fs from 'fs';

async function addSEOReportToMarketing() {
  try {
    // Read the generated SEO report
    const reportContent = fs.readFileSync('docs/LIGHTHOUSE-SEO-REPORT-2025.md', 'utf8');
    
    // Insert into marketing documents
    const newDocument = await db.insert(marketingDocuments).values({
      title: 'Google Lighthouse SEO Audit Report 2025',
      type: 'report',
      content: reportContent,
      category: 'seo-analysis',
      tags: ['SEO', 'Lighthouse', 'Performance', 'Competitive Analysis', 'Marketing Strategy', 'Google Audit'],
      format: 'md',
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log('✅ SEO Report successfully added to marketing documents');
    console.log(`Document ID: ${newDocument[0].id}`);
    console.log(`Title: ${newDocument[0].title}`);
    console.log(`Category: ${newDocument[0].category}`);
    
  } catch (error) {
    console.error('❌ Failed to add SEO report:', error);
  }
}

addSEOReportToMarketing();