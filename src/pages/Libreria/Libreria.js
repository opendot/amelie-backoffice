import React from "react";
import { Container } from "reactstrap";
import ImagesList from "../../components/ImagesList";
import FeedbackList from "../../components/FeedbackList";
import classNames from "classnames";
import get from "lodash/get";
import "./Libreria.scss";

class Libreria extends React.PureComponent {
  handleSetTab = tabName => () => {
    this.props.history.push(`/libreria/${tabName}`, {
      preventAnimation: true
    });
  };

  render() {
    const tabName = get(this.props.match, "params.tabName", "cards");
    const tabs = [
      { slug: "cards", label: "Cards" },
      { slug: "rinforzi-deboli", label: "Rinforzi deboli" },
      { slug: "rinforzi-forti", label: "Rinforzi forti" }
    ];

    return (
      <Container fluid className="Libreria">
        <div className="row">
          <div className="col-12">
            <div className="main-title">
              <h5 className="m-0">Libreria</h5>
            </div>
          </div>
        </div>
        <div className="sticky-top bg-white-90">
          <div className="row">
            <div className="col-12">
              <nav className="nav nav-fill my-2">
                {tabs.map(({ slug, label }) => (
                  <div
                    key={slug}
                    onClick={this.handleSetTab(slug)}
                    className={classNames("nav-item nav-link", {
                      active: tabName === slug
                    })}
                  >
                    <h5 className="m-0">{label}</h5>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {tabName === "cards" && <ImagesList />}
        {tabName === "rinforzi-deboli" && <FeedbackList tag="positive" />}
        {tabName === "rinforzi-forti" && <FeedbackList tag="strong" />}
      </Container>
    );
  }
}

export default Libreria;
