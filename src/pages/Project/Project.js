import React from "react";
import Markdown from "markdown-to-jsx";
import ProjectText from "./Project.md";
import "./Project.scss";

class Project extends React.PureComponent {
  state = { md: null };
  componentWillMount() {
    fetch(ProjectText)
      .then(res => res.text())
      .then(md => {
        this.setState({ md });
      });
  }

  render() {
    const { md } = this.state;
    return (
      md && (
        <div className="row">
          <div className="col-12">
            <Markdown children={md} />
          </div>
        </div>
      )
    );
  }
}

export default Project;
