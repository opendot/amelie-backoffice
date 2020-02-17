import React from "react";
import Markdown from "markdown-to-jsx";
import ReactPlayer from "react-player";
import { Link } from "react-router-dom";
import "./Home.scss";
import HomeText from "./Home.md";

class Home extends React.PureComponent {
  state = { md: null };
  componentWillMount() {
    fetch(HomeText)
      .then(res => res.text())
      .then(md => {
        this.setState({ md });
      });
  }

  render() {
    const { md } = this.state;
    return (
      md && (
        <div className="row Home">
          <div className="col-12">
            <div className="wrapper">
              <Markdown
                children={md}
                options={{
                  overrides: {
                    ReactPlayer: {
                      component: ReactPlayer
                    }
                  }
                }}
              />
              <p>
                <Link
                  to={{
                    state: {
                      preventAnimation: true
                    },
                    pathname: "/progetto"
                  }}
                >
                  Continua a leggere
                </Link>
              </p>
            </div>
          </div>
        </div>
      )
    );
  }
}

export default Home;
