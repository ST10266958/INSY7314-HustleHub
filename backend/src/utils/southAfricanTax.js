/**
 * Approximate South African individual income tax estimator (SARS 2026/27 tables).
 *
 * Tax year: 1 March 2026 to 28 February 2027. Brackets and the primary rebate come from the
 * SARS "Rates of tax for individuals" page. The estimate assumes a taxpayer under 65 and ignores
 * deductions, credits and other income, so it is a planning aid, not a tax assessment.
 *
 * Method:
 *   1. Take the income earned on the platform so far this tax year (year-to-date).
 *   2. Annualise it: year-to-date income / fraction of the tax year that has passed.
 *   3. Apply the progressive brackets to the annualised income, then subtract the primary rebate.
 *   4. Pro-rate the annual tax back to the part of the year that has passed.
 */
const TAX_YEAR = Object.freeze({
  label: '2026/27',
  start: new Date('2026-03-01T00:00:00.000Z'),
  end: new Date('2027-03-01T00:00:00.000Z'),
  primaryRebate: 17820,
});

// `limit` is the upper end of each bracket. Tax in a bracket = (income inside the bracket) x rate.
const TAX_BRACKETS = Object.freeze([
  { limit: 245100, rate: 0.18 },
  { limit: 383100, rate: 0.26 },
  { limit: 530200, rate: 0.31 },
  { limit: 695800, rate: 0.36 },
  { limit: 887000, rate: 0.39 },
  { limit: 1878600, rate: 0.41 },
  { limit: Infinity, rate: 0.45 },
]);

const round2 = (value) => Math.round(value * 100) / 100;

function getTaxYearPeriod() {
  return { start: new Date(TAX_YEAR.start), end: new Date(TAX_YEAR.end) };
}

/** Shows how much of an annual income falls in each bracket and the tax it produces. */
function getBracketBreakdown(annualIncome) {
  const income = Number(annualIncome);
  const safeIncome = Number.isFinite(income) && income > 0 ? income : 0;
  let lower = 0;

  return TAX_BRACKETS.map(({ limit, rate }) => {
    const taxedAmount = Math.max(0, Math.min(safeIncome, limit) - lower);
    const row = {
      from: lower,
      to: Number.isFinite(limit) ? limit : null,
      rate,
      taxedAmount: round2(taxedAmount),
      tax: round2(taxedAmount * rate),
    };
    lower = limit;
    return row;
  });
}

/** Annual tax before the rebate. */
function calculateGrossTax(taxableIncome) {
  return getBracketBreakdown(taxableIncome).reduce((sum, row) => sum + row.tax, 0);
}

/** Annual tax after the primary rebate (never below zero). */
function calculateAnnualTax(taxableIncome) {
  return Math.max(0, calculateGrossTax(taxableIncome) - TAX_YEAR.primaryRebate);
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
  const taxYearDuration = end.getTime() - start.getTime();
  const elapsed = Math.min(Math.max(asOfDate.getTime() - start.getTime(), 0), taxYearDuration);
  const elapsedFraction = elapsed / taxYearDuration;
  const annualisedIncome = elapsedFraction > 0 ? income / elapsedFraction : 0;

  const grossAnnualTax = calculateGrossTax(annualisedIncome);
  const estimatedAnnualTax = calculateAnnualTax(annualisedIncome);
  const estimatedTaxToDate = estimatedAnnualTax * elapsedFraction;
  const breakdown = getBracketBreakdown(annualisedIncome);
  const marginal = [...breakdown].reverse().find((row) => row.taxedAmount > 0);

  return {
    taxYear: TAX_YEAR.label,
    taxYearStart: start.toISOString(),
    taxYearEnd: new Date(end.getTime() - 1).toISOString(),
    elapsedFraction: Math.round(elapsedFraction * 10000) / 10000,
    yearToDateIncome: round2(income),
    annualisedIncome: round2(annualisedIncome),
    grossAnnualTax: round2(grossAnnualTax),
    primaryRebate: TAX_YEAR.primaryRebate,
    estimatedAnnualTax: round2(estimatedAnnualTax),
    estimatedTaxToDate: round2(estimatedTaxToDate),
    estimatedAfterTaxIncomeToDate: round2(income - estimatedTaxToDate),
    effectiveTaxRate: annualisedIncome > 0 ? round2((estimatedAnnualTax / annualisedIncome) * 100) : 0,
    marginalTaxRate: marginal ? marginal.rate : 0,
    bracketBreakdown: breakdown,
    assumptions: {
      currency: 'ZAR',
      taxpayerAgeBand: 'Under 65 (primary rebate only)',
      method:
        'Year-to-date platform income is annualised using the elapsed portion of the tax year, then the progressive brackets and the primary rebate are applied, and the annual tax is prorated back to year-to-date.',
      exclusions: [
        'Other income',
        'Allowable business expenses and deductions',
        'Medical tax credits',
        'Retirement contributions',
        'Secondary and tertiary age rebates',
        'Provisional tax payments',
      ],
      caution: 'Estimates are less reliable early in the tax year because a small amount of income is scaled up to a full year.',
    },
  };
}

/** Turns grouped monthly totals into 12 entries (March to February) so charts always have every month. */
function buildMonthlySeries(rows = []) {
  const totals = new Map(rows.map((r) => [r._id, r.income]));
  const { start } = getTaxYearPeriod();
  const formatter = new Intl.DateTimeFormat('en-ZA', { month: 'short', year: 'numeric', timeZone: 'UTC' });

  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    return { month: key, label: formatter.format(d), income: round2(totals.get(key) || 0) };
  });
}

module.exports = {
  TAX_YEAR,
  TAX_BRACKETS,
  calculateAnnualTax,
  calculateGrossTax,
  getBracketBreakdown,
  estimateTaxOnYearToDateIncome,
  getTaxYearPeriod,
  buildMonthlySeries,
};
