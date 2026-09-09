import { useMemo, useState } from "react";
import { formatCurrency } from "../../utils/analytics";
import "./LoanDashboard.css";
import {
  applyTransactionsToSchedule,
  calculateLoanProgress,
  countPaidEmis,
  generateRepaymentSchedule,
} from "../../utils/loanCalculations";

/**
 * Step 3 — Loan dashboard with two tabs:
 *   • Overview — loan summary cards and progress
 *   • Repayment Schedule — month-by-month EMI table
 */
function LoanDashboard({ loan, loanForm, transactions, onPayLoan, onRefresh }) {
  const [activeTab, setActiveTab] = useState("overview");

  const progress = calculateLoanProgress(
    loan.disbursedAmount,
    loan.principalAmountLeft,
  );
  const paidEmis = countPaidEmis(transactions);

  // Build amortization table and overlay paid transactions
  const schedule = useMemo(() => {
    const base = generateRepaymentSchedule(
      loan.disbursedAmount,
      loan.disbursedInterest,
      loan.disbursedDuration,
      loan.disbursedDate,
    );
    return applyTransactionsToSchedule(base, transactions);
  }, [loan, transactions]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const statusBadge = (status) => {
    const map = {
      paid: { label: "Paid", className: "loan-badge--paid" },
      pending: { label: "Upcoming", className: "loan-badge--pending" },
      "partial-prepay": { label: "Prepaid", className: "loan-badge--prepay" },
      closed: { label: "Closed", className: "loan-badge--closed" },
    };
    const info = map[status] || map.pending;
    return <span className={`loan-badge ${info.className}`}>{info.label}</span>;
  };

  return (
    <div className="loan-flow">
      {/* Loan header card */}
      <div className="loan-dashboard-header">
        <div className="loan-dashboard-header__info">
          <span className="loan-hero__badge">Active Loan</span>
          <h2>{formatCurrency(loan.disbursedAmount)} Personal Loan</h2>
          <p>
            Disbursed on {formatDate(loan.disbursedDate)} ·{" "}
            {loan.disbursedInterest}% p.a. · {loan.disbursedDuration} months
          </p>
        </div>
        <div className="loan-dashboard-header__actions">
          <button
            type="button"
            className="auth-button auth-button--secondary"
            onClick={onRefresh}
          >
            ↻ Refresh
          </button>
          <button
            type="button"
            className="auth-button loan-btn-primary"
            onClick={onPayLoan}
          >
            Make Payment →
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="dashboard-card loan-progress-card">
        <div className="loan-progress-card__header">
          <span>Repayment Progress</span>
          <strong>{progress}% repaid</strong>
        </div>
        <div className="loan-progress-bar">
          <div
            className="loan-progress-bar__fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="loan-progress-card__stats">
          <div>
            <small>Principal Left</small>
            <strong>{formatCurrency(loan.principalAmountLeft)}</strong>
          </div>
          <div>
            <small>EMIs Paid</small>
            <strong>
              {paidEmis} / {loan.disbursedDuration}
            </strong>
          </div>
          <div>
            <small>Monthly EMI</small>
            <strong>{formatCurrency(loan.emiAmount)}</strong>
          </div>
          <div>
            <small>Next EMI Due</small>
            <strong>
              {paidEmis < loan.disbursedDuration
                ? formatDate(schedule[paidEmis]?.dueDate)
                : "—"}
            </strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="loan-tabs">
        <button
          type="button"
          className={`loan-tab ${activeTab === "overview" ? "loan-tab--active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          className={`loan-tab ${activeTab === "schedule" ? "loan-tab--active" : ""}`}
          onClick={() => setActiveTab("schedule")}
        >
          Repayment Schedule
        </button>
        <button
          type="button"
          className={`loan-tab ${activeTab === "history" ? "loan-tab--active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Payment History
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="loan-overview-grid">
          <div className="dashboard-card loan-detail-card">
            <h4>Loan Details</h4>
            <dl className="loan-detail-list">
              <div>
                <dt>Loan ID</dt>
                <dd>{loan._id.slice(-8).toUpperCase()}</dd>
              </div>
              <div>
                <dt>Disbursed Amount</dt>
                <dd>{formatCurrency(loan.disbursedAmount)}</dd>
              </div>
              <div>
                <dt>Interest Rate</dt>
                <dd>{loan.disbursedInterest}% p.a.</dd>
              </div>
              <div>
                <dt>Tenure</dt>
                <dd>{loan.disbursedDuration} months</dd>
              </div>
              <div>
                <dt>Monthly EMI</dt>
                <dd>{formatCurrency(loan.emiAmount)}</dd>
              </div>
              <div>
                <dt>Principal Remaining</dt>
                <dd>{formatCurrency(loan.principalAmountLeft)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <span className="loan-badge loan-badge--paid">Active</span>
                </dd>
              </div>
            </dl>
          </div>

          {loanForm && (
            <div className="dashboard-card loan-detail-card">
              <h4>Applicant Details</h4>
              <dl className="loan-detail-list">
                <div>
                  <dt>Name</dt>
                  <dd>{loanForm.applicantName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{loanForm.applicantEmail}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{loanForm.applicantPhone}</dd>
                </div>
                <div>
                  <dt>PAN</dt>
                  <dd>{loanForm.panNumber}</dd>
                </div>
                <div>
                  <dt>Purpose</dt>
                  <dd>{loanForm.loanPurpose}</dd>
                </div>
                <div>
                  <dt>Credit Score</dt>
                  <dd>{loanForm.creditScore}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="dashboard-card loan-detail-card loan-detail-card--highlight">
            <div className="loan-quick-pay-copy">
              <h4>Quick Pay</h4>
              <p>
                Pay your current month EMI of{" "}
                <strong>{formatCurrency(loan.emiAmount)}</strong>
              </p>
            </div>
            <button
              type="button"
              className="auth-button loan-btn-primary"
              onClick={onPayLoan}
            >
              Pay Now →
            </button>
          </div>
        </div>
      )}

      {activeTab === "schedule" && (
        <div className="dashboard-card">
          <div className="expenses-table-wrap">
            <table className="expenses-table loan-schedule-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Due Date</th>
                  <th>EMI</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr
                    key={row.month}
                    className={row.status === "paid" ? "loan-row--paid" : ""}
                  >
                    <td>{row.month}</td>
                    <td>{formatDate(row.dueDate)}</td>
                    <td>{formatCurrency(row.emi)}</td>
                    <td>{formatCurrency(row.principal)}</td>
                    <td>{formatCurrency(row.interest)}</td>
                    <td>{formatCurrency(row.balance)}</td>
                    <td>{statusBadge(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="dashboard-card">
          {transactions.length === 0 ? (
            <div className="loan-empty-state">
              <p>No payments recorded yet.</p>
              <button
                type="button"
                className="auth-button loan-btn-primary"
                onClick={onPayLoan}
              >
                Make your first payment →
              </button>
            </div>
          ) : (
            <div className="expenses-table-wrap">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Payment ID</th>
                  </tr>
                </thead>
                <tbody>
                  {[...transactions]
                    .sort(
                      (a, b) =>
                        new Date(b.transactionDate) -
                        new Date(a.transactionDate),
                    )
                    .map((txn) => (
                      <tr key={txn._id}>
                        <td>{formatDate(txn.transactionDate)}</td>
                        <td>
                          <span
                            className={`loan-badge loan-badge--${txn.transactionType === "EMI" ? "paid" : "prepay"}`}
                          >
                            {txn.transactionType}
                          </span>
                        </td>
                        <td>{formatCurrency(txn.transactionAmount)}</td>
                        <td className="loan-payment-id">
                          {txn.razorpayPaymentId}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LoanDashboard;
