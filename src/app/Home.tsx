import Button from "@mui/material/Button";

export default function Home() {

  return (
        <div>
      <section>
        <h1>Home</h1>
        <h2>出費</h2>
        <ol>
          <li>家族構成</li>
          <li>子供の数＊小中高大＋結婚資金</li>
          <li>住宅ローン</li>
          <li>車</li>
          <li>趣味</li>
          <li>生活費</li>
        </ol>
      </section>

      <section>
        <h2>収入</h2>
        <ol>
          <li>現時点での貯金</li>
          <li>給与</li>
          <li>その他</li>
        </ol>
      </section>
      <section>
      <Button variant="contained">Hello world</Button>
      </section>
    </div>
  )
}


