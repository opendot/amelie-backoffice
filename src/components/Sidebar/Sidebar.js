import React, { PureComponent } from "react";
import { withRouter, Link } from "react-router-dom";
import classNames from "classnames";
import "./Sidebar.scss";

class Navbar extends PureComponent {
  render() {
    const { location } = this.props;

    const pages = [
      { link: "/", label: "Home" },
      { link: "/progetto", label: "Il progetto" },
      { link: "/software", label: "Software" },
      { link: "/video-tutorial", label: "Video tutorial" },
      { link: "/supporto", label: "Supporto" },
      { link: "/team", label: "Team" }
    ];

    return (
      <div className="Sidebar text-white d-flex flex-column">
        <div>
          <h3>logo</h3>
        </div>
        <div className="menu">
          <nav className="nav nav-pills flex-column">
            {pages.map(({ link, label }) => (
              <Link
                to={{
                  state: {
                    preventAnimation: true
                  },
                  pathname: link
                }}
                key={label}
                className={classNames("nav-link", {
                  active: location.pathname === link
                })}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto">
          <p>
            <Link to="/potenziamento-cognitivo">Area riservata</Link>
          </p>
          <div className="btn-group" role="group" aria-label="Language">
            <button type="button" className="btn btn-primary">
              ITA
            </button>
            <button type="button" className="btn btn-primary">
              ENG
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Navbar);
