import React from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";
import { getAuthUser } from "eazy-auth";
import UserCreateModal from '../../components/UserCreateModal'
import PatientCreateModal from '../../components/PatientCreateModal'
import ParentInviteModal from '../../components/ParentInviteModal'

import { handleSumbissionErrors } from '../../components/form/submitError'

import { loadUsers, unloadUsers, createUser, getUsers, getUsersLoading, deleteUser } from '../../state/users'
import { loadPatients, unloadPatients, createPatient, getPatients, getPatientsLoading, deletePatient } from '../../state/patients'
import { createInvites } from '../../state/invites';
import { Link } from 'react-router-dom'
import './GestioneUtenti.scss'
import TherapistsList from './TherapistsList'
import ParentsList from './ParentsList'
import CareReceiversList from './CareReceiversList'
import ParentCareReceiversList from './ParentCareReceiversList'
import TeachersList from './TeachersList'
import ResearchersList from './ResearchersList'
import qs from 'query-string'


class GestioneUtenti extends React.PureComponent {

  state = {
    currentList: 'Therapists',
    addingUser: false,
    addingPatient: false,
    addingInvites: false,
    latestUserAdded: null,
    latestPatientAdded: null,
    invitesSent: null,
  }

  setCurrentList = currentList => () => {
    // this.setState({currentList})
    const { history, location } = this.props
    const params = qs.parse(location.search)
    const newLocation = {
      pathName: '/gestione-utenti',
      search: qs.stringify({userType: currentList, search: params.search || ''}),
      state: { preventAnimation: true }
    }
    history.push(newLocation)
  }

  toggleAddUser = () => {
    const newState = {
      addingUser: !this.state.addingUser,
    }
    if(!newState.addingUser){
      newState.latestUserAdded = null
    }
    this.setState(newState)
  }

  toggleAddPatient = () => {
    const newState = {
      addingPatient: !this.state.addingPatient,
    }
    if(!newState.addingPatient){
      newState.latestPatientAdded = null
    }
    this.setState(newState)
  }

  toggleAddInvites = () => {
    const newState = {
      addingInvites: !this.state.addingInvites,
    }
    if(!newState.addingInvites){
      newState.invitesSent = null
    }
    this.setState(newState)
  }
  

  getCurrentList = () => {
    const { location, user } = this.props
    const params = qs.parse(location.search)
    return user.type === 'Superadmin' 
      ? params.userType || 'Therapist'
      : 'CareReceiver'
  }


  componentDidMount(){
    const { user } = this.state
    if(user && user.type !== 'Superadmin'){
      this.setCurrentList('CareReceiver')
    }
  }

  componentDidUpdate(){
    const { user } = this.state
    if(user && user.type !== 'Superadmin'){
      this.setCurrentList('CareReceiver')
    }
  }

  render() {
    const { user, users, loadUsers, unloadUsers, 
      loadPatients, unloadPatients, patients, 
      createUser, deleteUser, createPatient, deletePatient,
      createInvites,
    } = this.props
    const { addingUser, addingPatient, addingInvites, 
      latestUserAdded, latestPatientAdded, invitesSent } = this.state
    const currentList = this.getCurrentList()
    const isAdmin = user.type === 'Superadmin'
    
    return (
      user && <React.Fragment>
        <div className="GestioneUtenti">
          <nav aria-label="breadcrumb" className="Breadcrumb">
            <ol className="breadcrumb d-flex justify-content-between align-items-center">
              <li className="breadcrumb-item ">
                Gestione utenti
              </li>
              {user.type === 'Superadmin' && <button 
                onClick={this.toggleAddUser}
                className="btn btn-sm btn-dark">Aggiungi utente</button>}
              {user.type === 'Parent' && <div>
                <button 
                  onClick={this.toggleAddPatient}
                  className="btn btn-sm btn-dark mr-2">Aggiungi care receiver</button>
                <button 
                  onClick={this.toggleAddInvites}
                  className="btn btn-sm btn-dark">Invita utenti</button>
              </div>}
            </ol>
          </nav>
          <Container fluid>
            <div className="border">
              <div className="border-bottom">
                <ul className="nav nav-fill nav-justified">
                  {isAdmin && <li className={`nav-item ${currentList === 'Therapist' ? 'active' : ''}`}>
                    <span 
                      onClick={this.setCurrentList('Therapist')}
                      className={`nav-link`}>Care givers</span>
                  </li>}
                  {isAdmin && <li className={`nav-item ${currentList === 'Parent' ? 'active' : ''}`}>
                    <span 
                      onClick={this.setCurrentList('Parent')}
                      className={`nav-link`}>Genitori</span>
                  </li>}
                  <li className={`nav-item ${currentList === 'CareReceiver' ? 'active' : ''}`}>
                    <span 
                      onClick={this.setCurrentList('CareReceiver')}
                      className={`nav-link`}>Care receivers</span>
                  </li>
                  {isAdmin && <li className={`nav-item ${currentList === 'Teacher' ? 'active' : ''}`}>
                    <span 
                      onClick={this.setCurrentList('Teacher')}
                      className={`nav-link`}>Teachers</span>
                  </li>}
                  {isAdmin && <li className={`nav-item ${currentList === 'Researcher' ? 'active' : ''}`}>
                    <span 
                      onClick={this.setCurrentList('Researcher')}
                      className={`nav-link`}>Ricercatori</span>
                  </li>}
                </ul>

              </div>

              <div>
                {currentList === 'Therapist'  && <TherapistsList users={users} loadItems={(params) => loadUsers({...params, type: 'Therapist'})} unloadItems={unloadUsers} deleteUser={deleteUser}/>}
                {currentList === 'Parent'  && <ParentsList users={users} loadItems={(params) => loadUsers({...params, type: 'Parent'})} unloadItems={unloadUsers} deleteUser={deleteUser}/>}
                {user.type === 'Superadmin' && currentList === 'CareReceiver'  && <CareReceiversList patients={patients} loadItems={(params) => loadPatients({...params, all: true, parents: true})} unloadItems={unloadPatients} deletePatient={deletePatient}/>}
                {user.type === 'Parent' && currentList === 'CareReceiver'  && <ParentCareReceiversList patients={patients} loadItems={(params) => loadPatients({...params, all: true})} unloadItems={unloadPatients} deletePatient={deletePatient}/>}
                {currentList === 'Researcher'  && <ResearchersList users={users} loadItems={(params) => loadUsers({...params, type: 'Researcher'})} unloadItems={unloadUsers} deleteUser={deleteUser}/>}
                {currentList === 'Teacher'  && <TeachersList users={users} loadItems={(params) => loadUsers({...params, type: 'Teacher'})} unloadItems={unloadUsers} deleteUser={deleteUser}/>}
              </div>

            </div>
          
          
          </Container>
          
        </div>
        <UserCreateModal 
          withPassword
          create
          latestUserAdded={latestUserAdded}
          initialValues={{type: 'Therapist'}}
          onCancel={this.toggleAddUser}
          onSubmit={values => createUser(values).catch(handleSumbissionErrors)}
          onSubmitSuccess={data => {
            // this.toggleAddUser()
            this.setState({latestUserAdded: data.data})
          }}
          isOpen={addingUser} toggle={this.toggleAddUser}/>

        {user.type === 'Parent' && <PatientCreateModal
          create
          latestPatientAdded={latestPatientAdded}
          onCancel={this.toggleAddPatient}
          onSubmit={values => createPatient(values).catch(handleSumbissionErrors)}
          onSubmitSuccess={data => {
            // this.toggleAddPatient()
            this.setState({latestPatientAdded: data.data})
          }}
          isOpen={addingPatient} toggle={this.toggleAddPatient}/>}

        {user.type === 'Parent' && <ParentInviteModal
          initialValues={{mails:[{email: ''}]}}
          patients={patients}
          invitesSent={invitesSent}
          onCancel={this.toggleAddInvites}
          onSubmit={values => {
            const payload = {
              patient: values.patient,
              mails: values.mails.map(mail => mail.email)
            }
            return createInvites(payload).catch(handleSumbissionErrors)
          }}
          onSubmitSuccess={data => {
            this.setState({invitesSent: data.data})
          }}
          isOpen={addingInvites} toggle={this.toggleAddInvites}/>}

      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  user: getAuthUser(state),
  users: getUsers(state),
  usersLoading: getUsersLoading(state),
  patients: getPatients(state),
  patientsLoading: getPatientsLoading(state),
});

export default connect(
  mapStateToProps,
  {
    loadUsers,
    unloadUsers,
    createUser,
    loadPatients,
    unloadPatients,
    createPatient,
    deleteUser,
    deletePatient,
    createInvites,
  }
)(GestioneUtenti);
