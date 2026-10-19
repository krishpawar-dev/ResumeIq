const fs = require('fs');

function generateValidPdf(filename, lines) {
  let stream = 'BT /F1 10 Tf 40 760 Td 13 TL\n';
  for (const line of lines) {
    const escaped = line
      .replaceAll('\\', '\\\\')
      .replaceAll('(', '\\(')
      .replaceAll(')', '\\)');
    stream += `(${escaped}) ' \n`;
  }
  stream += 'ET\n';

  const streamLength = Buffer.byteLength(stream, 'utf-8');

  const header = '%PDF-1.4\n';
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n';
  const obj4 = `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}endstream\nendobj\n`;
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';

  const o1 = header.length;
  const o2 = o1 + obj1.length;
  const o3 = o2 + obj2.length;
  const o4 = o3 + obj3.length;
  const o5 = o4 + obj4.length;
  const xrefOffset = o5 + obj5.length;

  const pad = (n) => String(n).padStart(10, '0');

  const xref =
    'xref\n' +
    '0 6\n' +
    '0000000000 65535 f \n' +
    pad(o1) + ' 00000 n \n' +
    pad(o2) + ' 00000 n \n' +
    pad(o3) + ' 00000 n \n' +
    pad(o4) + ' 00000 n \n' +
    pad(o5) + ' 00000 n \n';

  const trailer =
    'trailer\n' +
    '<< /Size 6 /Root 1 0 R >>\n' +
    'startxref\n' +
    xrefOffset +
    '\n' +
    '%%EOF\n';

  const finalPdf = header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;
  fs.writeFileSync(filename, finalPdf, 'utf-8');
}

const resumeLines = [
  'ALEX MORGAN',
  'alex.morgan@example.com | (415) 555-0199 | San Francisco, CA | linkedin.com/in/alexmorgan | github.com/alexmorgan',
  '',
  'EXECUTIVE SUMMARY',
  'Results-driven Senior Full Stack Software Engineer with 7+ years of expertise designing distributed microservices and reactive cloud applications.',
  'Track record of optimizing system throughput by 42%, cutting AWS cloud expenditures by $180,000 annually, and leading cross-functional engineering teams.',
  '',
  'TECHNICAL COMPETENCIES & SKILLS',
  'Languages: JavaScript (ES6+), TypeScript, Python, Go, SQL',
  'Frameworks & Runtimes: React, Node.js, Express, Next.js, Redux Toolkit, Tailwind CSS',
  'Cloud, DevOps & Architecture: AWS (ECS, Lambda, S3, RDS), Docker, Kubernetes, CI/CD, Git, Terraform, Linux',
  'Databases & Caching: PostgreSQL, MongoDB, Redis, Elasticsearch, DynamoDB',
  'Methodologies: Test-Driven Development (TDD), Agile Scrum, System Design, REST APIs, GraphQL',
  '',
  'PROFESSIONAL EXPERIENCE',
  'Apex Cloud Technologies - Lead Software Engineer (2021 - Present)',
  '- Spearheaded architecture of distributed payment processing microservice handling $45M in annual transactions with 99.99% uptime.',
  '- Accelerated core API response latency by 38% through Redis query caching and database index optimization.',
  '- Orchestrated enterprise migration to AWS Kubernetes clusters, reducing infrastructure expenditure by $180,000 annually.',
  '- Mentored 8 junior developers on clean code architecture, design patterns, and TDD methodologies.',
  '',
  'NexGen Interactive - Senior Software Engineer (2018 - 2021)',
  '- Engineered real-time collaborative workspace serving 250,000 daily active users using React, TypeScript, and WebSockets.',
  '- Optimized client-side bundle size by 45%, improving initial page load time from 3.8s to 1.1s.',
  '- Automated continuous integration pipelines using GitHub Actions, decreasing deployment cycle time by 65%.',
  '- Formulated robust authentication mechanisms leveraging OAuth2 and JWT with encrypted token rotation.',
  '',
  'EDUCATION & CERTIFICATIONS',
  'University of California, Berkeley - Bachelor of Science in Computer Science (2014 - 2018)',
  'AWS Certified Solutions Architect - Associate (2022)'
];

generateValidPdf('./test_resume.pdf', resumeLines);
console.log('Generated test_resume.pdf successfully.');
