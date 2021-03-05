import React from "react"
import Layout from "../components/layout"
import { Link } from "gatsby"

const Index = () => (
  <Layout title="GUSTV0 - Artigos" key="Out">
    <div>
      <p>Alguns estudos pessoais sobre desenvolvimento de software. Também faço parte de um podcast, <a href="https://twitter.com/quebradev" target="_blank" rel="noreferrer">@quebradev</a></p>
      <ul className="posts">
        <li><Link to="/o-padrao-special-case-com-golang">O padrão Special Case com Golang</Link></li>
      </ul>
    </div>
  </Layout>
)

export default Index
