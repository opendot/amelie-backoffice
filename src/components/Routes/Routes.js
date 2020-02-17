import React, { Component } from "react";
import { Switch, withRouter } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import get from 'lodash/get'
import "./Routes.scss";

class Routes extends Component {
  prevKey = null

  render() {
    const { location, children } = this.props

    // Key is a special react props when change over the time cause
    // mounting / unmounting of components tree...
    // if location state contain preventAnimation we use the prveius
    // key to avoid this behaviour
    let key
    if (get(location, 'state.preventAnimation', false) && this.prevKey !== null) {
      key = this.prevKey
    } else {
      key = location.key
      this.prevKey = key
    }

    return (
      <TransitionGroup
        className="Routes"
        childFactory={(child, v) =>
          React.cloneElement(child, {
            classNames:
              location.state && location.state.transition
                ? location.state.transition
                : "fade"
          })
        }
      >
        <CSSTransition key={key} timeout={300}>
          <section className="route-section">
            <Switch location={location}>{children}</Switch>
          </section>
        </CSSTransition>
      </TransitionGroup>
    )
  }
}

export default withRouter(Routes);
