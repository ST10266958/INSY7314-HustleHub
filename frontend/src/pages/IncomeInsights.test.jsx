import { render, screen, within } from '@testing-library/react';
import IncomeInsights from './IncomeInsights';
jest.mock('../auth',()=>({useAuth:jest.fn()}));

const months = Array.from({ length: 12 }, (_, i) => ({
  month: `2026-${String(((i + 2) % 12) + 1).padStart(2, '0')}`,
  label: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'][i] + ' 2026',
  income: i === 7 ? 6000 : 0,
}));

const taxEstimate = {
  taxYear: '2026/27',
  elapsedFraction: 0.6,
  yearToDateIncome: 6000,
  annualisedIncome: 10000,
  grossAnnualTax: 1800,
  primaryRebate: 17820,
  estimatedAnnualTax: 0,
  estimatedTaxToDate: 0,
  estimatedAfterTaxIncomeToDate: 6000,
  effectiveTaxRate: 0,
  bracketBreakdown: [
    { from: 0, to: 245100, rate: 0.18, taxedAmount: 10000, tax: 1800 },
    { from: 245100, to: 383100, rate: 0.26, taxedAmount: 0, tax: 0 },
    { from: 1878600, to: null, rate: 0.45, taxedAmount: 0, tax: 0 },
  ],
  assumptions: { caution: 'Early-year estimates are rough.' },
};

test('shows income, tax and after-tax figures', () => {
  render(<IncomeInsights income={{ totalIncome: 6000, completedBookings: 3, taxEstimate, monthlyIncome: months }} />);
  expect(screen.getByRole('heading', { name: 'Income and tax insights' })).toBeInTheDocument();
  expect(screen.getByText('Income this tax year').nextSibling).toHaveTextContent(/6\s?000/);
  expect(screen.getByText('Estimated tax so far')).toBeInTheDocument();
  expect(screen.getByText('After-tax income')).toBeInTheDocument();
  expect(screen.getByText('Effective tax rate').nextSibling).toHaveTextContent('0%');
});

test('draws both charts with accessible descriptions', () => {
  render(<IncomeInsights income={{ totalIncome: 6000, completedBookings: 3, taxEstimate, monthlyIncome: months }} />);
  const charts = screen.getAllByRole('img');
  expect(charts).toHaveLength(2);
  expect(charts[0]).toHaveAccessibleName(/Monthly income/);
  expect(charts[1]).toHaveAccessibleName(/set aside for tax/);
  expect(screen.getByText('Income per month, March to February (ZAR)')).toBeInTheDocument();
});

test('explains the calculation and only lists brackets that apply', () => {
  render(<IncomeInsights income={{ totalIncome: 6000, completedBookings: 3, taxEstimate, monthlyIncome: months }} />);
  expect(screen.getByRole('heading', { name: 'How this estimate is calculated' })).toBeInTheDocument();
  const table = screen.getByRole('table');
  expect(within(table).getAllByRole('row')).toHaveLength(2); // header + the one bracket with income
  expect(within(table).getByText('18%')).toBeInTheDocument();
  expect(screen.getByText(/not tax advice/i)).toBeInTheDocument();
  expect(screen.getByText(/Early-year estimates are rough/)).toBeInTheDocument();
});

test('shows an empty state and no charts when there is no income yet', () => {
  const empty = { ...taxEstimate, yearToDateIncome: 0, annualisedIncome: 0, estimatedAfterTaxIncomeToDate: 0, bracketBreakdown: taxEstimate.bracketBreakdown.map((r) => ({ ...r, taxedAmount: 0, tax: 0 })) };
  render(<IncomeInsights income={{ totalIncome: 0, completedBookings: 0, taxEstimate: empty, monthlyIncome: months }} />);
  expect(screen.getByText(/No income recorded this tax year yet/)).toBeInTheDocument();
  expect(screen.queryAllByRole('img')).toHaveLength(0);
});

test('falls back gracefully when the API sends no tax estimate', () => {
  render(<IncomeInsights income={{ totalIncome: 0, completedBookings: 0 }} />);
  expect(screen.getByText('Tax estimate unavailable right now.')).toBeInTheDocument();
});
