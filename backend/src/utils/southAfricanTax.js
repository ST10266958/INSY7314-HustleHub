/**
 * Approximate South African individual income tax estimator.
 * Rates and the primary rebate are for the 2027 year of assessment
 * (1 March 2026 to 28 February 2027). The estimate assumes a taxpayer
 * under 65 and does not account for deductions, credits or other income.
 */
const TAX_YEAR = Object.freeze({
  label: '2026/27',
  start: new Date('2026-03-01T00:00:00.000Z'),
  end: new Date('2027-03-01T00:00:00.000Z'),
  primaryRebate: 17820,
});

const TAX_BRACKETS = Object.freeze([
  { limit: 245100, baseTax: 0, rate: 0.18 },
  { limit: 383100, baseTax: 44118, rate: 0.26 },
  { limit: 530200, baseTax: 79998, rate: 0.31 },
  { limit: 695800, baseTax: 125599, rate: 0.36 },
  { limit: 887000, baseTax: 185215, rate: 0.39 },
  { limit: 1878600, baseTax: 259783, rate: 0.41 },
  { limit: Infinity, baseTax: 666339, rate: 0.45 },
]);

function getTaxYearPeriod() {
  return { start: new Date(TAX_YEAR.start), end: new Date(TAX_YEAR.end) };
}

function calculateAnnualTax(taxableIncome) {
  const income = Number(taxableIncome);
  if (!Number.isFinite(income) || income <= 0) return 0;

  const bracket = TAX_BRACKETS.find((item) => income <= item.limit);
  const lowerLimit = TAX_BRACKETS[TAX_BRACKETS.indexOf(bracket) - 1]?.limit || 0;
  const baseTax = bracket.baseTax || (lowerLimit === 0 ? 0 : undefined);
  const grossTax = baseTax === undefined
    ? bracket.baseTax + (income - lowerLimit) * bracket.rate
    : (bracket.baseTax + (income - lowerLimit) * bracket.rate);

  return Math.max(0, grossTax - TAX_YEAR.primaryRebate);
}

function estimateTaxOnYearToDateIncome(yearToDateIncome, asOfDate = new Date()) {
  const income = Number(yearToDateIncome);
  if (!Number.isFinite(income) || income < 0) {
    throw new TypeError('Year-to-date income must be a non-negative number.');
  }

  if (!(asOfDate instanceof Date) || !Number.isFinite(asOfDate.getTime())) {
    throw new TypeError('The tax estimate date must be a valid Date.');
  }

  const { start, end } = getTaxYearPeriod();
  const elapsed = Math.min(Math.max(asOfDate.getTime() - start.getTime(), 0), end.getTime() - start.getTime());
  const taxYearDuration = end.getTime() - start.getTime();
  const elapsedFraction = taxYearDuration === 0 ? 0 : elapsed / taxYearDuration;
  const annualisedIncome = elapsedFraction > 0 ? income / elapsedFraction : 0;
  const estimatedAnnualTax = calculateAnnualTax(annualisedIncome);
  const estimatedTaxToDate = estimatedAnnualTax * elapsedFraction;

  return {
    taxYear: TAX_YEAR.label,
    taxYearStart: start.toISOString(),
    taxYearEnd: new Date(end.getTime() - 1).toISOString(),
    yearToDateIncome: Math.round(income * 100) / 100,
    annualisedIncome: Math.round(annualisedIncome * 100) / 100,
    estimatedAnnualTax: Math.round(estimatedAnnualTax * 100) / 100,
    estimatedTaxToDate: Math.round(estimatedTaxToDate * 100) / 100,
    estimatedAfterTaxIncomeToDate: Math.round((income - estimatedTaxToDate) * 100) / 100,
    effectiveTaxRate: annualisedIncome > 0
      ? Math.round((estimatedAnnualTax / annualisedIncome) * 10000) / 100
      : 0,
    assumptions: {
      currency: 'ZAR',
      taxpayerAgeBand: 'Under 65 (primary rebate only)',
      method: 'Year-to-date platform income is annualised using the elapsed portion of the tax year, then the annual tax estimate is prorated back to year-to-date.',
      exclusions: ['Other income', 'Allowable business expenses and deductions', 'Medical tax credits', 'Retirement contributions', 'Secondary and tertiary age rebates', 'Provisional tax payments'],
    },
  };
}

module.exports = { calculateAnnualTax, estimateTaxOnYearToDateIncome, getTaxYearPeriod };
