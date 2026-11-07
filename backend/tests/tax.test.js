const {
  calculateAnnualTax,
  estimateTaxOnYearToDateIncome,
  getBracketBreakdown,
  buildMonthlySeries,
  getTaxYearPeriod,
} = require('../src/utils/southAfricanTax');

describe('calculateAnnualTax (SARS 2026/27 tables)', () => {
  test.each([
    [0, 0],
    [-50, 0],
    [90000, 0], // below the tax threshold: the rebate wipes out the tax
    [240000, 25380], // 240,000 x 18% - 17,820
    [360000, 56172], // 44,118 + 26% above 245,100, minus the rebate
    [500000, 98417], // 79,998 + 31% above 383,100, minus the rebate
  ])('income %p gives tax %p', (income, expected) => {
    expect(Math.round(calculateAnnualTax(income))).toBe(expected);
  });

  test('top bracket uses 45% above R1,878,600', () => {
    const tax = calculateAnnualTax(2000000);
    expect(Math.round(tax)).toBe(666339 + Math.round(0.45 * (2000000 - 1878600)) - 17820);
  });

  test('ignores non-numeric input safely', () => {
    expect(calculateAnnualTax('abc')).toBe(0);
    expect(calculateAnnualTax(NaN)).toBe(0);
  });
});

describe('getBracketBreakdown', () => {
  test('splits income across brackets and the tax adds up', () => {
    const rows = getBracketBreakdown(400000);
    expect(rows).toHaveLength(7);
    expect(rows[0].taxedAmount).toBe(245100);
    expect(rows[1].taxedAmount).toBe(138000);
    expect(rows[2].taxedAmount).toBe(16900);
    expect(rows[3].taxedAmount).toBe(0);
    expect(rows.reduce((sum, r) => sum + r.taxedAmount, 0)).toBe(400000);
  });
});

describe('estimateTaxOnYearToDateIncome', () => {
  const halfWay = new Date('2026-08-31T12:00:00.000Z'); // roughly half the tax year

  test('annualises year-to-date income and prorates the tax back', () => {
    const estimate = estimateTaxOnYearToDateIncome(150000, halfWay);
    expect(estimate.elapsedFraction).toBeGreaterThan(0.49);
    expect(estimate.elapsedFraction).toBeLessThan(0.51);
    expect(estimate.annualisedIncome).toBeGreaterThan(290000);
    expect(estimate.estimatedAnnualTax).toBeGreaterThan(0);
    // elapsedFraction is rounded to 4 decimals in the output, so allow a tiny tolerance
    const expectedToDate = estimate.estimatedAnnualTax * estimate.elapsedFraction;
    expect(Math.abs(estimate.estimatedTaxToDate - expectedToDate) / expectedToDate).toBeLessThan(0.001);
    expect(estimate.estimatedAfterTaxIncomeToDate).toBeCloseTo(150000 - estimate.estimatedTaxToDate, 2);
    expect(estimate.bracketBreakdown).toHaveLength(7);
    expect(estimate.marginalTaxRate).toBe(0.26);
  });

  test('zero income gives zero tax and a zero rate', () => {
    const estimate = estimateTaxOnYearToDateIncome(0, halfWay);
    expect(estimate.estimatedAnnualTax).toBe(0);
    expect(estimate.effectiveTaxRate).toBe(0);
  });

  test('before the tax year starts nothing is annualised', () => {
    const estimate = estimateTaxOnYearToDateIncome(1000, new Date('2026-01-01T00:00:00.000Z'));
    expect(estimate.elapsedFraction).toBe(0);
    expect(estimate.annualisedIncome).toBe(0);
  });

  test('rejects negative income and invalid dates', () => {
    expect(() => estimateTaxOnYearToDateIncome(-1)).toThrow(TypeError);
    expect(() => estimateTaxOnYearToDateIncome(10, new Date('nope'))).toThrow(TypeError);
    expect(() => estimateTaxOnYearToDateIncome(10, 'today')).toThrow(TypeError);
  });

  test('states its assumptions so the logic can be explained', () => {
    const { assumptions } = estimateTaxOnYearToDateIncome(1000, halfWay);
    expect(assumptions.currency).toBe('ZAR');
    expect(assumptions.exclusions.length).toBeGreaterThan(3);
  });
});

describe('buildMonthlySeries', () => {
  test('always returns the 12 months of the tax year, March to February', () => {
    const series = buildMonthlySeries([{ _id: '2026-05', income: 700 }]);
    const { start } = getTaxYearPeriod();
    expect(series).toHaveLength(12);
    expect(series[0].month).toBe(`${start.getUTCFullYear()}-03`);
    expect(series[11].month).toBe('2027-02');
    expect(series.find((m) => m.month === '2026-05').income).toBe(700);
    expect(series.filter((m) => m.income === 0)).toHaveLength(11);
  });

  test('works with no data', () => {
    expect(buildMonthlySeries()).toHaveLength(12);
  });
});
