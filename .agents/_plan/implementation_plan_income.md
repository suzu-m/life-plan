# 収入入力画面の修正計画

ユーザーの要望に基づき、ボーナス項目を削除し、退職金項目を追加します。また、入力内容に応じた年間の合計額をリアルタイムで表示するように変更します。

## 概要

1. **ストアの修正 (`src/store/useIncomeStore.ts`)**
   - `MemberIncome` から `bonusSummer`, `bonusWinter` を削除。
   - `MemberIncome` に `retirementAllowance` (退職金・万円) を追加。
2. **UIの修正 (`src/app/Income.tsx`)**
   - ボーナス入力欄を削除。
   - 退職金入力欄を追加（会社員の場合のみ表示）。
   - 世帯全体の「年間合計収入」および各メンバーの収入をリアルタイムで集計表示するカードを追加。

## 変更詳細

### データ構造の変更

```diff
 export type MemberIncome = {
   occupation: Occupation
   annualSalary: number | null     // 年収（万円）
-  bonusSummer: number | null      // 夏ボーナス（万円）
-  bonusWinter: number | null      // 冬ボーナス（万円）
+  retirementAllowance: number | null // 退職金（万円）
   retirementAge: number | null    // 退職年齢
 }
```

### UI コンポーネントの修正

- 生活費画面と同様に、画面上部に「世帯の年間合計収入」を表示するサマリーカードを配置します。
- 各メンバーの入力欄のすぐ下などに、その人の年間収入（額面）が表示されるようにします。

## Open Questions

1. **退職金の扱い**:
   - 退職金は定年時の一時金としてシミュレーションに反映する想定でよろしいでしょうか？（今回の修正では入力欄の追加のみを行いますが、将来的にResultsでその年に加算するようにします）
2. **合計額の計算対象**:
   - 「年の合計」には、本人・配偶者の年収に加えて「不労所得」も合算する形でよろしいでしょうか？
