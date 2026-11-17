import { rowsToCsv } from '../report.export';

describe('rowsToCsv', () => {
  it('escapes commas and quotes', () => {
    const csv = rowsToCsv(
      ['Name', 'Notes'],
      [
        ['Ada', 'Hello, world'],
        ['Bob', 'Said "hi"'],
      ],
    );

    expect(csv).toContain('Name,Notes');
    expect(csv).toContain('"Hello, world"');
    expect(csv).toContain('"Said ""hi"""');
  });
});
