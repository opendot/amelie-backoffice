import React from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";
import { getAuthUser } from "eazy-auth";
import ImpostazioniForm from '../../components/ImpostazioniForm'
import ProfileForm from '../../components/ProfileForm'
import { loadPreferences, getPreferences, updatePreferences } from '../../state/preferences'
import {
  updateUserMap,
  getUpdateUserMap,
  changePassword,
  getChangePasswordMessage,
  resetChangePassword
} from '../../state/users'
import { handleSumbissionErrors } from '../../components/form/submitError'
import './Impostazioni.scss'
import ChangePasswordForm from "../../components/ChangePasswordForm/ChangePasswordForm";


class Impostazioni extends React.PureComponent {

  componentDidMount(){
    this.props.loadPreferences()
  }

  componentWillUnmount() {
    this.props.resetChangePassword()
  }


  render() {
    const { preferences, user } = this.props
    return (
      <React.Fragment>
        <div className="Impostazioni">
          <nav aria-label="breadcrumb" className="Breadcrumb">
            <ol className="breadcrumb d-flex justify-content-between align-items-center">
              <li className="breadcrumb-item ">
              Impostazioni
              </li>
            </ol>
          </nav>
          <Container fluid>

          <div className="row">
            <div className="col-sm-6">
              <h4>Profilo utente</h4>
              {!!user && <ProfileForm 
                  initialValues={{name: user.name, surname: user.surname, email: user.email}}
                  onSubmit={(userData) => {
                    return this.props.updateUserMap({id: user.id, ...userData}).catch(handleSumbissionErrors)
                  }}
                />}
                <br/>
              <h4>Cambio Password</h4>
              {!!user && <ChangePasswordForm
                  onSubmit={(pass) => {
                    return this.props.changePassword(pass).catch(handleSumbissionErrors)
                  }}
              />}
              {this.props.getChangePasswordMessage && <div className="password-change">{this.props.getChangePasswordMessage.message}</div>}
            </div>
            {user && user.type === 'Superadmin' && <div className="col-sm-6">
              <h4>Impostazioni di sistema</h4>
              {!!preferences && <ImpostazioniForm 
                onSubmit={preferences => {
                  return this.props.updatePreferences(preferences).catch(handleSumbissionErrors)
                }}
              initialValues={preferences} />}  
            </div>}
            
          </div>

            
                      
          </Container>
          
        </div>
        
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  user: getAuthUser(state),
  preferences: getPreferences(state),
  updateUserMap: getUpdateUserMap(state),
  getChangePasswordMessage: getChangePasswordMessage(state)
  
});

export default connect(
  mapStateToProps,
  {
    loadPreferences,
    updatePreferences,
    updateUserMap,
    changePassword,
    resetChangePassword

  }
)(Impostazioni);
