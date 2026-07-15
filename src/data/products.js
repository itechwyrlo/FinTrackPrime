// ============================================================
// FinTrack Prime — product catalog data
//
// Pure data module: no logic, no DOM access. Adding or editing
// a product never touches rendering or cart code.
//
// `image` is the product artwork shown on the catalog card. The PNGs
// are imported (not string paths) so Vite bundles and cache-busts them
// alongside the JS build.
//
// `file` is the deliverable inside public/downloads/ that buyers
// receive after checkout. To swap a deliverable, drop the new file in
// public/downloads/ and update this field — no code changes needed.
// ============================================================

import budgetPlannerArt from "../assets/BudgetPlanner.png";
import cashFlowDashboardArt from "../assets/Cash FlowDashboard.png";
import investmentPortfolioTrackerArt from "../assets/InvestmentPortfolioTracker.png";
import retirementPlannerArt from "../assets/RetirementPlanner.png";
import loanCalculatorArt from "../assets/LoanCalculator.png";
import financialStatementTemplateArt from "../assets/FinancialStatementTemplate.png";

export const products = [
  {
    id: "budget-planner",
    file: "Budget_Planner.xlsx",
    category: "Budgeting",
    title: "Budget Planner",
    description:
      "Zero-based monthly budget workbook with envelope categories, variance tracking, and a year-at-a-glance summary.",
    price: 19,
    image: budgetPlannerArt,
  },
  {
    id: "cash-flow-dashboard",
    file: "Cash_Flow_Dashboard.xlsx",
    category: "Cash Flow",
    title: "Cash Flow Dashboard",
    description:
      "Rolling 12-month cash flow dashboard that tracks income, fixed and variable spend, and projects end-of-month balances.",
    price: 29,
    image: cashFlowDashboardArt,
  },
  {
    id: "investment-portfolio-tracker",
    file: "Investment_Portfolio_Tracker.xlsx",
    category: "Investing",
    title: "Investment Portfolio Tracker",
    description:
      "Position-level portfolio tracker with asset allocation, cost basis, dividend log, and rebalancing targets.",
    price: 34,
    image: investmentPortfolioTrackerArt,
  },
  {
    id: "retirement-planner",
    file: "Retirement_Planner.xlsx",
    category: "Retirement",
    title: "Retirement Planner",
    description:
      "Long-horizon retirement model with contribution schedules, employer match, and inflation-adjusted drawdown scenarios.",
    price: 39,
    image: retirementPlannerArt,
  },
  {
    id: "loan-calculator",
    file: "Loan_Calculator.xlsx",
    category: "Lending",
    title: "Loan Calculator",
    description:
      "Amortization calculator for mortgages and personal loans with extra-payment scenarios and total-interest comparison.",
    price: 24,
    image: loanCalculatorArt,
  },
  {
    id: "financial-statement-template",
    file: "Financial_Statement_Template.xlsx",
    category: "Accounting",
    title: "Financial Statement Template",
    description:
      "Personal balance sheet, income statement, and net-worth statement formatted to lending-review standards.",
    price: 27,
    image: financialStatementTemplateArt,
  },
];

// Catalog lookup lives with the data it searches — every other module
// resolves ids through this one function instead of scanning the array.
export const findProduct = (productId) =>
  products.find(({ id }) => id === productId);
