/**
 * 金額を3桁カンマ区切りでフォーマットする
 * @param amount 金額
 * @returns フォーマットされた文字列
 */
export const formatCurrency = (amount: number): string => amount.toLocaleString()

/**
 * 金額（円）を万円単位の文字列にフォーマットする
 * @param amount 金額（円）
 * @returns フォーマットされた文字列（万円）
 */
export const formatMan = (amount: number): string =>
  (amount / 10_000).toLocaleString(undefined, { maximumFractionDigits: 1 })
