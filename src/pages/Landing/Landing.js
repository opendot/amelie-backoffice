import React from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";
import { getAuthUser } from "eazy-auth";
import { Link } from 'react-router-dom'
import './Landing.scss'


const LinkPotenziamento = () =>  <Link to="/potenziamento-cognitivo">Potenziamento cognitivo</Link>
const LinkUsers = () =>  <Link to="/gestione-utenti">Gestione utenti</Link>
const LinkDashboard = () =>  <Link to="/dashboard">Dashboard dati</Link>
const LinkDownload = () =>  <Link to="/package-download">Scaricamento dati</Link>



class Landing extends React.PureComponent {
  render() {
    const { user } = this.props

    // #TODO: find exact strings ..
    // Superadmin, Therapist, Parent, Researcher, Teacher.
    const isAdmin = user.type === 'Superadmin'
    const isResearcher = user.type === 'Researcher'
    const isCareGiver = user.type === 'Therapist'
    const isParent = user.type === 'Parent'
    const isInvited = user.type === 'Invited'
    
    return (
      <React.Fragment>
        <Container fluid className="Landing d-flex flex-column pb-4">
          <div className="p-4">
            <h1>Benvenuto {user.type}</h1>
            
          </div>
          <div className="flex-1 px-2">
            
            <div className="h-50 d-flex">
              <div className="w-50 flex-1 p-2">
                <div className="h-100 w-100 border d-flex align-items-center justify-content-center">
                {(isAdmin || isParent) && <LinkUsers/>}
                {(isCareGiver || isInvited ) && <LinkDashboard/>}
                {isResearcher && <LinkDownload/>}
                </div>
              </div>
              {(isAdmin || isParent) && <div className="w-50 flex-1 p-2">
                <div className="h-100 w-100 border d-flex align-items-center justify-content-center">
                  {isAdmin && <LinkPotenziamento/>}
                  {isParent && <LinkDashboard/>}
                </div>
              </div>}
            </div>
              
            {isAdmin && <div className="h-50 d-flex">
              <div className="w-50 flex-1 p-2">
                <div className="h-100 w-100 border d-flex align-items-center justify-content-center">
                    <LinkDashboard/>
                </div>
              </div>
              <div className="w-50 flex-1 p-2">
                <div className="h-100 w-100 border d-flex align-items-center justify-content-center">
                    <LinkDownload/>
                </div>
              </div>
            </div>}
            
          </div>
          
        </Container>
        
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  user: getAuthUser(state)
});

export default connect(
  mapStateToProps,
  {
  
  }
)(Landing);
