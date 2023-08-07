import React from "react"

class Footer extends React.Component {
  render() {
    return [
      <footer>
        <section className="links">
          <p>
            <a
              href="https://twitter.com/gustv0_"
              target="_blank"
              rel="noreferrer"
            >
              Twitter
            </a>
          </p>
          <p>
            <a
              href="https://www.linkedin.com/in/gucastiliao"
              target="_blank"
              rel="noreferrer"
            >
              Linkedin
            </a>
          </p>
          <p>
            <a
              href="https://github.com/gustv000"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </p>
          <p>
            <a
              href="https://twitter.com/quebradev"
              target="_blank"
              rel="noreferrer"
            >
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
