import { type RepaymentType, type OwnLoan } from '@/store/useHomeStore'

/**
 * ローンの月額返済額を計算する
 * 元利均等返済の計算式: M = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
 * M: 月々の返済額, P: 借入総額, r: 月利, n: 返済回数
 * @param amount 借入総額（円）
 * @param period 返済期間（年）
 * @param interestRate 年利（%）
 * @param repaymentType 返済方式
 * @param elapsedMonths 経過月数（元金均等返済の場合に必要。0-indexed）
 * @returns 月額返済額（円）
 */
export const calculateMonthlyPayment = (
  amount: number | null,
  period: number | null,
  interestRate: number | null,
  repaymentType: RepaymentType,
  elapsedMonths: number = 0
): number => {
  if (!amount || !period || !repaymentType) return 0

  const monthlyRate = (interestRate ?? 0) / 100 / 12
  const totalMonths = period * 12

  if (repaymentType === 'equal-principal-interest') {
    if (monthlyRate === 0) return amount / totalMonths
    const ratePower = Math.pow(1 + monthlyRate, totalMonths)
    return (amount * monthlyRate * ratePower) / (ratePower - 1)
  } else if (repaymentType === 'equal-principal') {
    const monthlyPrincipal = amount / totalMonths
    if (elapsedMonths >= totalMonths) return 0
    // 元金均等返済: 毎月の元金返済分 + その時点の残高に対する利息
    const remainingBalance = amount - monthlyPrincipal * elapsedMonths
    return monthlyPrincipal + remainingBalance * monthlyRate
  }
  return 0
}

/**
 * 住宅ローンの年間コストを計算する
 * @param loan ローン情報
 * @param elapsedYears 経過年数（0-indexed）
 * @returns 年間返済額（円）
 */
export const calculateYearlyLoanCost = (loan: OwnLoan | undefined, elapsedYears: number): number => {
  if (!loan) return 0
  const amount = loan.amount ?? 0
  const period = loan.period ?? 0
  const repaymentType = loan.repaymentType

  if (amount <= 0 || period <= 0 || elapsedYears < 0 || elapsedYears >= period || !repaymentType) return 0

  if (repaymentType === 'equal-principal-interest') {
    return calculateMonthlyPayment(amount, period, loan.interestRate, repaymentType) * 12
  } else if (repaymentType === 'equal-principal') {
    let yearlyTotal = 0
    // 1年分（12ヶ月）の返済額を合算
    for (let month = 0; month < 12; month++) {
      yearlyTotal += calculateMonthlyPayment(
        amount,
        period,
        loan.interestRate,
        repaymentType,
        elapsedYears * 12 + month
      )
    }
    return yearlyTotal
  }
  return 0
}
