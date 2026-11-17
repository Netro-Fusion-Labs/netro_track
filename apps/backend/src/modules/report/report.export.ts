import PDFDocument from 'pdfkit';

export function rowsToCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>): string {
  const escape = (value: string | number | null | undefined): string => {
    const raw = value === null || value === undefined ? '' : String(value);
    if (/[",\n\r]/.test(raw)) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  };

  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(row.map(escape).join(','));
  }
  return `${lines.join('\n')}\n`;
}

export async function buildSimplePdf(input: {
  title: string;
  subtitle: string;
  headers: string[];
  rows: Array<Array<string | number | null | undefined>>;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).text(input.title, { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#444444').text(input.subtitle);
    doc.moveDown();
    doc.fillColor('#000000');

    const colCount = Math.max(input.headers.length, 1);
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidth = pageWidth / colCount;

    doc.fontSize(9).font('Helvetica-Bold');
    input.headers.forEach((header, index) => {
      doc.text(header, doc.page.margins.left + index * colWidth, doc.y, {
        width: colWidth - 4,
        continued: index < input.headers.length - 1,
      });
    });
    doc.text('');
    doc.moveDown(0.4);
    doc.font('Helvetica');

    for (const row of input.rows) {
      if (doc.y > doc.page.height - 60) {
        doc.addPage();
      }
      const startY = doc.y;
      row.forEach((cell, index) => {
        doc.text(cell === null || cell === undefined ? '' : String(cell), doc.page.margins.left + index * colWidth, startY, {
          width: colWidth - 4,
          continued: index < row.length - 1,
        });
      });
      doc.text('');
      doc.moveDown(0.25);
    }

    doc.end();
  });
}
