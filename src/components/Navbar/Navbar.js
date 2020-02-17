import React, { Component } from "react";
import { withRouter, Link, Route } from "react-router-dom";
import { getAuthUser, logout } from "eazy-auth";
import { connect } from "react-redux";
import { NavbarToggler, Collapse } from "reactstrap";
import { getUnreadNotices, loadUnreadNotices } from '../../state/notices'
import classNames from "classnames";
import "./Navbar.scss";

class Navbar extends Component {
  state = {
    isOpen: false
  };

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };


  componentDidMount(){
    if(this.props.user && this.props.user.type === 'Parent'){
      this.props.loadUnreadNotices()
    }
  }

  componentDidUpdate(oldProps){
    if(oldProps.location !== this.props.location || this.props.user !== oldProps.user){
      if(this.props.user && this.props.user.type === 'Parent'){
        this.props.loadUnreadNotices()
      }
    }
  }

  render() {
    const { location, user, logout, unreadNotices } = this.props;

    //not rendering navbar when user is not logged in
    if(!user){
      return null
    }
    
    return <nav className="Navbar navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
    <NavbarToggler onClick={this.toggle} />
    <Collapse isOpen={this.state.isOpen} navbar>
      
      
      <ul className="navbar-nav mr-auto">
        
        <li 
          className={classNames("nav-item", {
            active: location.pathname.indexOf("/home") === 0
          })}>
          <Link to="/home" className="nav-link">
            Home
          </Link>
        </li>

        <li
          className={classNames("nav-item mr-2", {
            active: location.pathname.indexOf("/impostazioni") === 0
          })}>
          <Link to="/impostazioni" className="nav-link">
            Impostazioni
          </Link>
        </li>

        {user.type === 'Parent' && <li
          className={classNames("nav-item mr-2", {
            active: location.pathname.indexOf("/notifiche") === 0
          })}>
          <Link to="/notifiche" className="nav-link">
            Notifiche {unreadNotices && unreadNotices.length > 0 && <span className="badge badge-pill badge-danger">{unreadNotices.length}</span>}
          </Link>
        </li>}
        
        {/* links for "potenziamento-cognitivo and libreria sections" */}
        <Route path={['/potenziamento-cognitivo', '/libreria']} render={()=>{
          return (
            <React.Fragment>
            <li
              className={classNames("nav-item", {
                active:
                  location.pathname.indexOf("/potenziamento-cognitivo") === 0
              })}
            >
              <Link to="/potenziamento-cognitivo" className="nav-link">
                Potenziamento cognitivo
              </Link>
            </li>
            <li
              className={classNames("nav-item", {
                active: location.pathname.indexOf("/libreria") === 0
              })}
            >
              <Link to="/libreria" className="nav-link">
                Libreria
              </Link>
            </li>
            </React.Fragment>
            )
          }}>
        </Route>

      </ul>
        
      {user && (
        <ul className="navbar-nav">

          <span className="navbar-text mr-2">
            <span className="hello">{user.email}</span>
          </span>
          <form className="form-inline">
            <button
              className="btn btn-sm btn-link text-white"
              type="button"
              onClick={logout}
            >
              LOGOUT
            </button>
          </form>
        </ul>
      )}
    </Collapse>
  </nav>
  }
}

const mapStateToProps = state => ({
  user: getAuthUser(state),
  unreadNotices: getUnreadNotices(state),
});

export default withRouter(
  connect(
    mapStateToProps,
    { logout, loadUnreadNotices }
  )(Navbar)
);
