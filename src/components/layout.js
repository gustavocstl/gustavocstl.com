import React from "react"
import SEO from "./seo"
import Header from "./header"
import Footer from "./footer"

export default class Layout extends React.Component {
  render() {
    return [
      <SEO key="Seo" title={this.props.title} article={this.props.article} description={this.props.description}/>,
      <Header key="header"/>,
      <section className="site-content">{this.props.children}</section>,
      <Footer key="footer"/>
    ]
  }
}
