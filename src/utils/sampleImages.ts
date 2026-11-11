import { ImageItem } from '../types';

export function createSampleImages(): Promise<ImageItem[]> {
  return new Promise((resolve) => {
    const samples: ImageItem[] = [];

    // Helper to generate canvas image
    const generate = (
      name: string,
      width: number,
      height: number,
      draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
    ): ImageItem => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      draw(ctx, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const approxBytes = Math.round((dataUrl.length * 3) / 4);

      return {
        id: 'sample_' + Math.random().toString(36).substring(2, 9),
        name,
        originalSrc: dataUrl,
        currentSrc: dataUrl,
        width,
        height,
        sizeBytes: approxBytes,
        rotation: 0,
        flipH: false,
        flipV: false,
        filters: { brightness: 100, contrast: 100, grayscale: 0, blur: 0, saturation: 100 }
      };
    };

    // Sample 1: Business Invoice / বিল
    const doc1 = generate('Invoice_INV-2026-089.jpg', 800, 1100, (ctx, w, h) => {
      // Paper background
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, w, h);

      // Header Banner
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(40, 40, w - 80, 80);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('NEXUS DESIGN STUDIO', 65, 88);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('INVOICE / বিল চালান', w - 210, 88);

      // Metadata
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Billed To: Tech Corp Ltd.', 65, 170);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Date: 10 Nov 2026', 65, 195);
      ctx.fillText('Invoice #: INV-2026-089', 65, 218);
      ctx.fillText('Due: Upon Receipt', 65, 241);

      // Table Header
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(65, 280, w - 130, 36);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('DESCRIPTION', 80, 303);
      ctx.fillText('QTY', 440, 303);
      ctx.fillText('RATE', 540, 303);
      ctx.fillText('AMOUNT', 650, 303);

      // Table Rows
      const items = [
        ['Brand Identity & UI Design System', '1', '$1,800.00', '$1,800.00'],
        ['Mobile App Architecture & Wireframes', '1', '$1,250.00', '$1,250.00'],
        ['High-Fidelity Prototyping & Testing', '1', '$850.00', '$850.00'],
        ['Cloud Asset Export & Documentation', '1', '$350.00', '$350.00']
      ];

      items.forEach((item, idx) => {
        const y = 350 + idx * 45;
        ctx.fillStyle = idx % 2 === 0 ? '#f1f5f9' : '#ffffff';
        ctx.fillRect(65, y - 25, w - 130, 40);

        ctx.fillStyle = '#1e293b';
        ctx.font = '13px sans-serif';
        ctx.fillText(item[0], 80, y);
        ctx.fillText(item[1], 450, y);
        ctx.fillText(item[2], 540, y);
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(item[3], 650, y);
      });

      // Total Box
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.fillRect(450, 560, 285, 120);
      ctx.strokeRect(450, 560, 285, 120);

      ctx.fillStyle = '#475569';
      ctx.font = '13px sans-serif';
      ctx.fillText('Subtotal:', 470, 595);
      ctx.fillText('$4,250.00', 660, 595);
      ctx.fillText('Tax (0%):', 470, 625);
      ctx.fillText('$0.00', 660, 625);

      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Total Due:', 470, 660);
      ctx.fillText('$4,250.00', 645, 660);

      // Stamp / Signature
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(200, 620, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('PAID IN FULL', 160, 625);

      // Footer
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('Thank you for your business! / ধন্যবাদ!', 65, 980);
      ctx.fillText('Nexus Studio · info@nexus.example.com · www.nexus.example.com', 65, 1005);
    });
    samples.push(doc1);

    // Sample 2: Certificate of Achievement / প্রশংসাপত্র
    const doc2 = generate('Certificate_Achievement.jpg', 1100, 800, (ctx, w, h) => {
      // Cream Parchment
      ctx.fillStyle = '#fefce8';
      ctx.fillRect(0, 0, w, h);

      // Gold Double Border
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, w - 60, h - 60);

      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.strokeRect(45, 45, w - 90, h - 90);

      // Seal / Ribbon
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(w / 2, 130, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★', w / 2, 138);

      // Title
      ctx.fillStyle = '#14532d';
      ctx.font = 'bold 36px serif';
      ctx.fillText('CERTIFICATE OF RECOGNITION', w / 2, 230);

      ctx.fillStyle = '#4b5563';
      ctx.font = 'italic 16px serif';
      ctx.fillText('This document certifies that', w / 2, 280);

      // Recipient
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('Mehedi Hassan Mejan', w / 2, 340);

      // Underline
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 200, 360);
      ctx.lineTo(w / 2 + 200, 360);
      ctx.stroke();

      // Description
      ctx.fillStyle = '#475569';
      ctx.font = '16px sans-serif';
      ctx.fillText('Has successfully completed the Full-Stack Engineering Masterclass', w / 2, 410);
      ctx.fillText('with distinction in Software Architecture and Document Systems.', w / 2, 440);

      // Signatures
      ctx.textAlign = 'left';
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText('Dr. Julian Vance', 180, 580);
      ctx.fillText('Director of Academic Affairs', 180, 600);
      ctx.beginPath();
      ctx.moveTo(180, 560);
      ctx.lineTo(350, 560);
      ctx.stroke();

      ctx.textAlign = 'right';
      ctx.fillText('Sarah Jenkins, M.Sc.', w - 180, 580);
      ctx.fillText('Lead Curriculum Officer', w - 180, 600);
      ctx.beginPath();
      ctx.moveTo(w - 350, 560);
      ctx.lineTo(w - 180, 560);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = '12px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Serial ID: CERT-88219-PRO · Verified Digital Record', w / 2, 700);
    });
    samples.push(doc2);

    // Sample 3: Technical Blueprint / রিপোর্ট নোট
    const doc3 = generate('Report_Architecture_Specs.jpg', 800, 1050, (ctx, w, h) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Blueprint grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 40; x < w - 40; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 40);
        ctx.lineTo(x, h - 40);
        ctx.stroke();
      }
      for (let y = 40; y < h - 40; y += 40) {
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(w - 40, y);
        ctx.stroke();
      }

      // Title Card
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(50, 50, w - 100, 80);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('SPECIFICATION // SYSTEM SCHEMATIC', 75, 95);
      ctx.font = '13px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Project: Real-Time Vector Pipeline v2', 75, 115);

      // Diagram boxes
      const boxes = [
        { label: 'CLIENT INGESTION', x: 80, y: 180, w: 280, h: 90, color: '#0284c7' },
        { label: 'CANVAS PRE-PROCESSOR', x: 440, y: 180, w: 280, h: 90, color: '#0d9488' },
        { label: 'DOCUMENT FILTER ENGINE', x: 80, y: 340, w: 280, h: 90, color: '#16a34a' },
        { label: 'PDF STREAM COMPRESSOR', x: 440, y: 340, w: 280, h: 90, color: '#d97706' }
      ];

      boxes.forEach(b => {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, b.y, b.w, b.h);

        ctx.fillStyle = b.color;
        ctx.font = 'bold 14px monospace';
        ctx.fillText(b.label, b.x + 20, b.y + 40);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.fillText('STATUS: OPERATIONAL [ACTIVE]', b.x + 20, b.y + 65);
      });

      // Metric section
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(80, 500, w - 160, 200);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('BENCHMARK RUNTIME SUMMARY', 105, 540);

      ctx.font = '13px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Throughput: 60 FPS (Client Canvas)', 105, 580);
      ctx.fillText('Latency: 12ms Per Page Generation', 105, 610);
      ctx.fillText('Memory Overhead: < 45MB V8 Heap', 105, 640);
      ctx.fillText('Accuracy Rate: 100% Vector Parity', 105, 670);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText('Archived Document · Confidential Specification · Sheet 01 of 01', 80, 960);
    });
    samples.push(doc3);

    resolve(samples);
  });
}
