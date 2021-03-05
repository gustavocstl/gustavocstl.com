import React from "react"
import { Link } from "gatsby"
import KafkaIcon from "../images/kafka.png"
import "../../static/base.css";
import "../../static/prism.css";

class Header extends React.Component {
  render() {
    return [
      <header className="site-header">
        <Link to="/">
          <img src={KafkaIcon} title="Franz Kafka, A Metamorfose" alt="Franz Kafka, A Metamorfose"/>
          <p>Artigos</p>
        </Link>
      </header>
    ]
  }
}

export default Header
