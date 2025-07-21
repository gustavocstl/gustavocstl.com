import React from "react"

class Footer extends React.Component {
  render() {
    return [
      <footer>
        <section className="links">
          <p>
            <a
              href="https://www.linkedin.com/in/gustavocastiliao"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </p>
          <p>
            <a
              href="https://github.com/gustavocstl"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </p>
        </section>
      </footer>,
    ]
  }
}

export default Footer
