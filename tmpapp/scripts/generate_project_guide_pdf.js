const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

async function createGuidePDF() {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Palette
  const colorEspresso = rgb(0.17, 0.13, 0.12);   // #2C221E
  const colorGold = rgb(0.66, 0.58, 0.36);       // #A8935D
  const colorDarkGold = rgb(0.55, 0.45, 0.25);
  const colorGrey = rgb(0.42, 0.37, 0.31);       // #6B5E50
  const colorLightBg = rgb(0.97, 0.96, 0.95);    // #F8F7F4
  const colorBorder = rgb(0.90, 0.88, 0.86);     // #E5E2DC
  const colorWhite = rgb(1, 1, 1);

  function addHeaderFooter(page, pageNum, totalPages) {
    const { width, height } = page.getSize();
    
    // Top brass bar
    page.drawRectangle({
      x: 40,
      y: height - 40,
      width: width - 80,
      height: 2,
      color: colorGold,
    });

    page.drawText('GRACE & PEACE  |  FUNERAL OPERATIONS & MEMORIAL SUITE', {
      x: 40,
      y: height - 34,
      size: 8,
      font: fontBold,
      color: colorGold,
    });

    // Footer
    page.drawRectangle({
      x: 40,
      y: 45,
      width: width - 80,
      height: 1,
      color: colorBorder,
    });

    page.drawText('System Architecture & Operations Guide', {
      x: 40,
      y: 32,
      size: 8,
      font: fontRegular,
      color: colorGrey,
    });

    page.drawText(`Page ${pageNum} of ${totalPages}`, {
      x: width - 90,
      y: 32,
      size: 8,
      font: fontRegular,
      color: colorGrey,
    });
  }

  // ==========================================
  // PAGE 1: Executive Overview & Architecture
  // ==========================================
  const page1 = pdfDoc.addPage([612, 792]); // Letter size
  const { width: p1W, height: p1H } = page1.getSize();

  // Hero Card Background
  page1.drawRectangle({
    x: 40,
    y: p1H - 180,
    width: p1W - 80,
    height: 125,
    color: colorLightBg,
    borderColor: colorBorder,
    borderWidth: 1,
  });

  page1.drawRectangle({
    x: 40,
    y: p1H - 58,
    width: p1W - 80,
    height: 3,
    color: colorGold,
  });

  page1.drawText('Grace & Peace Operations Suite', {
    x: 58,
    y: p1H - 90,
    size: 20,
    font: fontBold,
    color: colorEspresso,
  });

  page1.drawText('Comprehensive Architecture, Workflows & Operational Specification', {
    x: 58,
    y: p1H - 108,
    size: 11,
    font: fontItalic,
    color: colorDarkGold,
  });

  page1.drawText('A unified, modern enterprise platform built specifically for independent funeral homes, mortuaries,', {
    x: 58,
    y: p1H - 132,
    size: 9.5,
    font: fontRegular,
    color: colorGrey,
  });
  page1.drawText('and care directors to orchestrate intakes, tribute generation, family messaging, compliance, and 3D vigils.', {
    x: 58,
    y: p1H - 146,
    size: 9.5,
    font: fontRegular,
    color: colorGrey,
  });

  let currentY = p1H - 210;

  function drawSectionTitle(page, title, y) {
    page.drawText(title.toUpperCase(), {
      x: 40,
      y: y,
      size: 11,
      font: fontBold,
      color: colorEspresso,
    });
    page.drawRectangle({
      x: 40,
      y: y - 4,
      width: 532,
      height: 1.5,
      color: colorGold,
    });
    return y - 20;
  }

  currentY = drawSectionTitle(page1, '1. System Overview & Core Capabilities', currentY);

  const capabilities = [
    {
      title: 'First-Call Intake & Case Ledger',
      desc: 'Step-by-step intake wizard capturing vital statistics (DOB, DOD, place of death, next-of-kin, service preferences) with real-time case filtering and status lifecycles.',
    },
    {
      title: 'Generative AI Obituary Studio',
      desc: 'Multi-tone AI tribute authoring (Traditional, Celebratory, Poetic, Religious, Minimalist) with customizable length, instant regeneration, and inline staff editing.',
    },
    {
      title: 'Multi-Channel Family Communications Hub',
      desc: 'Integrated SMS notifications (Twilio) and professional branded emails (Resend) for instant service coordinates, obituary approvals, and family dispatch.',
    },
    {
      title: 'Legal Compliance & Document Engine',
      desc: 'Automated state-compliant PDF generator for Cremation/Burial Authorizations, Vital Statistics Worksheets, and Chapel Bulletins using pdf-lib.',
    },
    {
      title: '3D WebGL Perpetual Flame & Memorial Studio',
      desc: 'Interactive Three.js 3D perpetual candlelight, floating remembrance stars, customizable chapel lighting ambiances, and fluid pointer orbit physics.',
    },
    {
      title: 'Multi-Tenant Row-Level Security (RLS)',
      desc: 'Complete data isolation across funeral homes via Supabase PostgreSQL policies, guaranteeing zero cross-organization record leakage.',
    },
  ];

  for (const cap of capabilities) {
    page1.drawCircle({
      x: 48,
      y: currentY - 2,
      size: 2.5,
      color: colorGold,
    });
    page1.drawText(cap.title, {
      x: 58,
      y: currentY,
      size: 10,
      font: fontBold,
      color: colorEspresso,
    });
    page1.drawText(cap.desc, {
      x: 58,
      y: currentY - 13,
      size: 8.5,
      font: fontRegular,
      color: colorGrey,
    });
    currentY -= 32;
  }

  currentY -= 8;
  currentY = drawSectionTitle(page1, '2. Technology Stack & Architecture', currentY);

  const techRows = [
    ['Frontend Application', 'Next.js 14 (App Router, Server Components & React 18)'],
    ['Styling & Design System', 'Tailwind CSS (Bespoke Warm Editorial & Brass Aesthetic)'],
    ['3D Graphics & Rendering', 'Three.js (Custom GLSL Shaders, PBR Materials, Lighting)'],
    ['Database & Auth Engine', 'Supabase (PostgreSQL with Row Level Security & Auth)'],
    ['AI Generation Service', 'OpenAI / OpenRouter API (GPT-4o / Claude 3.5 Sonnet)'],
    ['PDF Document Engine', 'PDF-Lib (Real-time dynamic legal document generation)'],
    ['Telecommunications', 'Twilio (SMS / Alerts) & Resend (Transactional Email)'],
  ];

  for (const [col1, col2] of techRows) {
    page1.drawRectangle({
      x: 40,
      y: currentY - 14,
      width: 532,
      height: 18,
      color: colorLightBg,
      borderColor: colorBorder,
      borderWidth: 0.5,
    });
    page1.drawText(col1, {
      x: 50,
      y: currentY - 9,
      size: 8.5,
      font: fontBold,
      color: colorEspresso,
    });
    page1.drawText(col2, {
      x: 210,
      y: currentY - 9,
      size: 8.5,
      font: fontRegular,
      color: colorGrey,
    });
    currentY -= 20;
  }

  // ==========================================
  // PAGE 2: End-to-End Operational Workflow
  // ==========================================
  const page2 = pdfDoc.addPage([612, 792]);
  let p2Y = p1H - 70;

  p2Y = drawSectionTitle(page2, '3. End-to-End Director Workflow', p2Y);

  const workflowSteps = [
    {
      step: 'Step 1: First-Call Intake',
      desc: 'When a family calls to report a passing, the director opens the New Case Intake wizard (/dashboard/cases/new). The system captures decedent information, next-of-kin contacts, service type, and SMS opt-in status. A unique case ledger file is automatically created.',
    },
    {
      step: 'Step 2: AI Obituary Drafting & Fine-Tuning',
      desc: 'Within the Obituary Studio (/dashboard/cases/[id]/obituary), the director selects tone presets (Traditional, Poetic, Celebratory) and length. The AI crafts a compassionate draft incorporating family memories and vital dates. Staff refine the text with live word-count and version tracking.',
    },
    {
      step: 'Step 3: Family Review & Multi-Channel Dispatch',
      desc: 'Through the Family Communication Hub, the director sends the obituary draft to the family via Resend email and service confirmation alerts via Twilio SMS. Every interaction is logged in the communication ledger with delivery status receipts.',
    },
    {
      step: 'Step 4: Compliance Paperwork & PDF Generation',
      desc: 'In the Compliance & Documents view (/dashboard/cases/[id]/documents), the system compiles legal paperwork: Form 104-A (Cremation/Burial Authorization), Vital Statistics Worksheet, and 4-panel Order of Service bulletins ready for physical printing.',
    },
    {
      step: 'Step 5: 3D Perpetual Flame & Family Keepsake',
      desc: 'The decedent’s digital file features the 3D WebGL Tribute Studio. Family and remote relatives can light a virtual memorial vigil candle, watch remembrance stars ascend, and choose chapel lighting themes in perpetual celebration of their loved one.',
    },
  ];

  for (const item of workflowSteps) {
    page2.drawRectangle({
      x: 40,
      y: p2Y - 48,
      width: 532,
      height: 52,
      color: colorLightBg,
      borderColor: colorBorder,
      borderWidth: 1,
    });
    page2.drawRectangle({
      x: 40,
      y: p2Y - 48,
      width: 4,
      height: 52,
      color: colorGold,
    });

    page2.drawText(item.step, {
      x: 52,
      y: p2Y - 14,
      size: 9.5,
      font: fontBold,
      color: colorEspresso,
    });

    // Wrapped description
    const words = item.desc.split(' ');
    let line1 = '';
    let line2 = '';
    for (const w of words) {
      if (line1.length + w.length < 90) {
        line1 += (line1 ? ' ' : '') + w;
      } else {
        line2 += (line2 ? ' ' : '') + w;
      }
    }

    page2.drawText(line1, {
      x: 52,
      y: p2Y - 27,
      size: 8,
      font: fontRegular,
      color: colorGrey,
    });
    if (line2) {
      page2.drawText(line2, {
        x: 52,
        y: p2Y - 39,
        size: 8,
        font: fontRegular,
        color: colorGrey,
      });
    }

    p2Y -= 60;
  }

  p2Y -= 10;
  p2Y = drawSectionTitle(page2, '4. Database Schema & Security Architecture', p2Y);

  const schemaTables = [
    { name: 'funeral_homes', role: 'Tenant entity (name, state, license, contact phone/email).' },
    { name: 'staff_profiles', role: 'Staff membership linking auth.users to a specific funeral home ID with director/staff roles.' },
    { name: 'cases', role: 'Primary case records: decedent vital stats, informant details, service coordinates, status enum.' },
    { name: 'documents', role: 'Obituary revisions, generated PDF storage URLs, compliance forms, and approval signatures.' },
    { name: 'communication_logs', role: 'Immutable log of every SMS (Twilio) and Email (Resend) dispatched with delivery receipts.' },
  ];

  for (const table of schemaTables) {
    page2.drawText(`• ${table.name}`, {
      x: 48,
      y: p2Y,
      size: 8.5,
      font: fontBold,
      color: colorEspresso,
    });
    page2.drawText(table.role, {
      x: 170,
      y: p2Y,
      size: 8.5,
      font: fontRegular,
      color: colorGrey,
    });
    p2Y -= 18;
  }

  p2Y -= 12;
  p2Y = drawSectionTitle(page2, '5. Security & Multi-Tenant Compliance', p2Y);

  page2.drawText('All SQL tables are protected with strict PostgreSQL Row Level Security (RLS). Every query automatically', {
    x: 40,
    y: p2Y,
    size: 8.5,
    font: fontRegular,
    color: colorGrey,
  });
  page2.drawText('scopes data to the authenticated staff member\'s funeral_home_id. This guarantees complete data isolation', {
    x: 40,
    y: p2Y - 12,
    size: 8.5,
    font: fontRegular,
    color: colorGrey,
  });
  page2.drawText('and prevents unauthorized access across different funeral homes or third-party organizations.', {
    x: 40,
    y: p2Y - 24,
    size: 8.5,
    font: fontRegular,
    color: colorGrey,
  });

  // Stamp header & footer on all pages
  addHeaderFooter(page1, 1, 2);
  addHeaderFooter(page2, 2, 2);

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.resolve('c:/Users/DanielKing/Music/funeralhome/grace_and_peace_system_guide.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`PDF successfully created at: ${outputPath}`);
}

createGuidePDF().catch(console.error);
