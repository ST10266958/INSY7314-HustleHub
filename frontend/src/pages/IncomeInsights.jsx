import { money } from '../components';

const pct = (value) => `${Math.round(Number(value) * 10000) / 100}%`;
const compact = (value) => new Intl.NumberFormat('en-ZA', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

/**
 * Monthly income bar chart drawn with plain SVG. No chart library is used so the
 * production Content Security Policy (script-src 'self', style-src 'self') stays strict.
 */
export function MonthlyIncomeChart({ months }) {
  const width = 640;
  const height = 240;
  const pad = { top: 16, right: 12, bottom: 34, left: 52 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...months.map((m) => m.income), 1);
  const slot = innerW / months.length;
  const barW = slot * 0.62;
  const ticks = [0, 0.5, 1];

  return (
    <figure className="chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Monthly income for the tax year. Highest month: ${money(max === 1 ? 0 : max)}.`}
      >
        {ticks.map((t) => {
          const y = pad.top + innerH - t * innerH;
          return (
            <g key={t}>
              <line className="chart-grid" x1={pad.left} x2={width - pad.right} y1={y} y2={y} />
              <text className="chart-axis" x={pad.left - 8} y={y + 4} textAnchor="end">
                {compact(max * t)}
              </text>
            </g>
          );
        })}
        {months.map((m, i) => {
          const h = (m.income / max) * innerH;
          const x = pad.left + i * slot + (slot - barW) / 2;
          return (
            <g key={m.month}>
              <rect className="chart-bar" x={x} y={pad.top + innerH - h} width={barW} height={h} rx="3">
                <title>{`${m.label}: ${money(m.income)}`}</title>
              </rect>
              <text className="chart-axis" x={x + barW / 2} y={height - 12} textAnchor="middle">
                {m.label.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>Income per month, March to February (ZAR)</figcaption>
    </figure>
  );
}

/** One horizontal bar split into estimated tax and what the freelancer keeps. */
export function TaxSplitChart({ income, tax }) {
  const width = 640;
  const barH = 34;
  const total = Math.max(income, 0);
  const taxShare = total > 0 ? Math.min(tax / total, 1) : 0;
  const taxW = width * taxShare;

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${width} ${barH + 8}`} role="img" aria-label={`Of ${money(total)} earned so far, about ${money(tax)} (${pct(taxShare)}) is set aside for tax.`}>
        <rect className="chart-keep" x="0" y="4" width={width} height={barH} rx="8" />
        {taxW > 0 && <rect className="chart-tax" x="0" y="4" width={Math.max(taxW, 6)} height={barH} rx="8" />}
      </svg>
      <figcaption>
        <span className="swatch swatch-tax" aria-hidden="true" /> Estimated tax {money(tax)}
        <span className="swatch swatch-keep" aria-hidden="true" /> You keep {money(total - tax)}
      </figcaption>
    </figure>
  );
}

export default function IncomeInsights({ income }) {
  const tax = income?.taxEstimate;
  const months = income?.monthlyIncome;

  if (!tax) {
    return (
      <section className="panel" aria-labelledby="insights-title">
        <h2 id="insights-title">Income and tax insights</h2>
        <p className="empty">Tax estimate unavailable right now.</p>
      </section>
    );
  }

  const hasIncome = tax.yearToDateIncome > 0;
  const usedBrackets = tax.bracketBreakdown.filter((row) => row.taxedAmount > 0);

  return (
    <section className="panel insights" aria-labelledby="insights-title">
      <div className="section-head">
        <div>
          <span className="eyebrow">Tax year {tax.taxYear}</span>
          <h2 id="insights-title">Income and tax insights</h2>
        </div>
      </div>

      <div className="stats insight-stats">
        <div className="card"><span>Income this tax year</span><strong>{money(tax.yearToDateIncome)}</strong></div>
        <div className="card"><span>Estimated tax so far</span><strong>{money(tax.estimatedTaxToDate)}</strong></div>
        <div className="card"><span>After-tax income</span><strong>{money(tax.estimatedAfterTaxIncomeToDate)}</strong></div>
      </div>
      <div className="stats insight-stats">
        <div className="card"><span>Projected annual income</span><strong>{money(tax.annualisedIncome)}</strong></div>
        <div className="card"><span>Projected annual tax</span><strong>{money(tax.estimatedAnnualTax)}</strong></div>
        <div className="card"><span>Effective tax rate</span><strong>{tax.effectiveTaxRate}%</strong></div>
      </div>

      {!hasIncome ? (
        <p className="empty">No income recorded this tax year yet. Charts appear after your first completed booking.</p>
      ) : (
        <>
          {Array.isArray(months) && <MonthlyIncomeChart months={months} />}
          <TaxSplitChart income={tax.yearToDateIncome} tax={tax.estimatedTaxToDate} />
        </>
      )}

      <h3>How this estimate is calculated</h3>
      <ol className="method">
        <li>Income earned on HustleHub+ this tax year is {money(tax.yearToDateIncome)}, and {pct(tax.elapsedFraction)} of the tax year has passed.</li>
        <li>That is scaled up to a full year: {money(tax.yearToDateIncome)} ÷ {pct(tax.elapsedFraction)} = {money(tax.annualisedIncome)}.</li>
        <li>SARS brackets are applied to the projected income (table below), giving {money(tax.grossAnnualTax)} before the primary rebate of {money(tax.primaryRebate)}.</li>
        <li>The result, {money(tax.estimatedAnnualTax)} a year, is scaled back to the part of the year that has passed: {money(tax.estimatedTaxToDate)}.</li>
      </ol>

      {usedBrackets.length > 0 && (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Tax brackets applied to projected annual income</caption>
            <thead><tr><th>Bracket</th><th>Rate</th><th>Income taxed</th><th>Tax</th></tr></thead>
            <tbody>
              {usedBrackets.map((row) => (
                <tr key={row.from}>
                  <td>{money(row.from)} – {row.to === null ? 'and above' : money(row.to)}</td>
                  <td>{pct(row.rate)}</td>
                  <td>{money(row.taxedAmount)}</td>
                  <td>{money(row.tax)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="hint disclaimer">
        This is an approximation for planning only, not tax advice. It assumes you are under 65, uses only your HustleHub+ income, and
        ignores deductions, medical credits, retirement contributions and provisional tax payments. {tax.assumptions?.caution}
      </p>
    </section>
  );
}
