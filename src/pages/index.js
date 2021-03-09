import React from "react"
import Layout from "../components/layout"
import { Link, graphql } from "gatsby"

const Index = ({data}) => {
  const { allMarkdownRemark } = data

  return (
    <Layout title="GUSTV0 - Artigos" key="Out">
      <div>
        <p>Alguns estudos pessoais sobre desenvolvimento de software. Também faço parte de um podcast, <a href="https://twitter.com/quebradev" target="_blank" rel="noreferrer">@quebradev</a></p>
        <ul className="posts">
          {allMarkdownRemark.edges.map((edge, index) => 
            <li>
              <Link key={index} to={edge.node.frontmatter.slug}>{edge.node.frontmatter.title}</Link>
            </li>
          )}
        </ul>
      </div>
    </Layout>
  )
}

export const query = graphql`
query ArticlesQuery {
  allMarkdownRemark(
    sort: { order: DESC, fields: [frontmatter___date] }
    limit: 1000
  ) {
    edges {
      node {
        frontmatter {
          slug
          title
        }
      }
    }
  }
}
`

export default Index
