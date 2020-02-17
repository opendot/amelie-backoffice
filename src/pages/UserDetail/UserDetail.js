import React from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";
import { getAuthUser } from "eazy-auth";
import { 
  loadUser, unloadUser, getUserLoading, getUser, updateUser, deleteUser,
  addUserPatient, deleteUserPatient,
 } from '../../state/users'
import { Link } from 'react-router-dom'
import ConfirmDelete from '../GestioneUtenti/ConfirmDelete'
import UserCreateModal from '../../components/UserCreateModal'
import CareReceiversTable from './CareReceiversTable'
import './UserDetail.scss'

class UserDetail extends React.PureComponent {

  state = {
    editUser: false
  }

  toggleEditUser = () => {
    this.setState({editUser: !this.state.editUser})
  }

  componentDidMount(){
    const { match } = this.props
    this.props.loadUser({id: match.params.userId})
  }

  componentWillUnmount(){
    this.props.unloadUser()
  }

  render() {
    const { user, updateUser, deleteUser, history, deleteUserPatient, addUserPatient } = this.props
    const { editUser } = this.state
    
    
    return (
      <React.Fragment>
        <div className="UserDetail">
          <nav aria-label="breadcrumb" className="Breadcrumb">
            <ol className="breadcrumb d-flex justify-content-between align-items-center" style={{marginBottom: 0}}>
              <li className="breadcrumb-item ">
                <Link to="/gestione-utenti/">Gestione utenti</Link>
              </li>
            </ol>
          </nav>
          {user && <div className="flex-1">
            <div className="row no-gutters h-100">

              {/* left column: user info and edit */}
              <div className="col-sm-3 bg-light py-2 px-4">
                <div>{user.type}</div>
                <h2>{user.name} {user.surname}</h2>
                {user.type === 'Parent' && <div>
                  Status: {user.status === 'disabled' ? 'Disabilitato' : 'Abilitato'}
                </div>}
                <div>
                  {user.email}
                </div>
                <div className="text-muted">
                  ID: {user.id}
                </div>

                <button type="button" className="btn btn-link" onClick={this.toggleEditUser}>
                  Modifica profilo utente
                </button>

                <div className="d-flex align-items-center justify-content-center">
                  <ConfirmDelete className="btn btn-sm btn-block btn-outline-dark" user={user} onClick={() => {
                      deleteUser(user.id)
                      .then(resp => {
                        history.push('/gestione-utenti')
                      })
                  }}>
                    Elimina utente
                  </ConfirmDelete>
                </div>
              </div>
              
              {/* right column: user-type specific controls */}
              <div className="col-sm-9 p-3">
                  {user.type === 'Therapist' && <CareReceiversTable patients={user.patients} user={user} addUserPatient={addUserPatient} deleteUserPatient={deleteUserPatient}/>}
                  {user.type === 'Teacher' && <CareReceiversTable patients={user.patients} user={user} addUserPatient={addUserPatient} deleteUserPatient={deleteUserPatient}/>}
                  {user.type === 'Parent' && <CareReceiversTable patients={user.patients} user={user} readOnly/>}
                  
              </div>

            </div>
          
          
          </div>}
          
        </div>

        {user && <UserCreateModal 
          initialValues={user}
          // withDisabled={user.type === 'Parent'}
          onCancel={this.toggleEditUser}
          onSubmit={(patient) => updateUser(patient)}
          onSubmitSuccess={data => {
            this.toggleEditUser()
          }}
          isOpen={editUser} toggle={this.toggleEditUser}/>}
        
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  user: getUser(state),
  userLoading: getUserLoading(state),
});

export default connect(
  mapStateToProps,
  {
    loadUser,
    unloadUser,
    updateUser,
    deleteUser,
    addUserPatient,
    deleteUserPatient,
  }
)(UserDetail);
