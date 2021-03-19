import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"

export default function Template({
  data,
}) {
  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark

  return (
    <Layout title={frontmatter.title} key="Out" article={true} description={frontmatter.description}>
      <header className="article-head">
        <h1>{frontmatter.title}</h1>
        <p>{frontmatter.date}</p>
      </header>
      <article className="article-content" dangerouslySetInnerHTML={{ __html: html }}>
      </article>
    </Layout>
  )
}

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      html
      frontmatter {
        date(formatString: "DD/MM/YYYY")
        slug
        title
        description
      }
    }
  }
`