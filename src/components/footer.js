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
              Linkedin
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
          <p>
            <a href="https://quebra.dev/" target="_blank" rel="noreferrer">
              QuebraDev
            </a>
          </p>
          <p>
            <a href="https://unixepoch.dev" target="_blank" rel="noreferrer">
              unixepoch.dev
            </a>
          </p>
        </section>
      </footer>,
    ]
  }
}

export default Footer
