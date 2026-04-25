/**
 * ローンの月額返済額を計算する
 * @param amount 借入総額（円）
 * @param period 返済期間（年）
 * @param interestRate 年利（%）
 * @param repaymentType 返済方式
 * @returns 月額返済額（円）
 */
export const calculateMonthlyPayment = (
  amount: number | null,
  period: number | null,
  interestRate: number | null,
  repaymentType: 'equal-principal-interest' | 'equal-principal' | ''
): number => {
  if (!amount || !period || !repaymentType) return 0

  const monthlyRate = (interestRate ?? 0) / 100 / 12
  const totalMonths = period * 12

  if (repaymentType === 'equal-principal-interest') {
    if (monthlyRate === 0) return amount / totalMonths
    const ratePower = Math.pow(1 + monthlyRate, totalMonths)
    return (amount * monthlyRate * ratePower) / (ratePower - 1)
  } else if (repaymentType === 'equal-principal') {
    // 元金均等返済 (初回返済額を基準とする)
    const monthlyPrincipal = amount / totalMonths
    return monthlyPrincipal + amount * monthlyRate
  }
  return 0
}
