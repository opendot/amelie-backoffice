import React from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";
import { getAuthUser } from "eazy-auth";
import { 
  loadPatient, unloadPatient, getPatientLoading, getPatient, updatePatient, deletePatient,
 } from '../../state/patients'
 import { 
  addUserPatient, deleteUserPatient,
 } from '../../state/users'
import { Link } from 'react-router-dom'
import ConfirmDelete from '../GestioneUtenti/ConfirmDelete'
import PatientCreateModal from '../../components/PatientCreateModal'
import PatientUsersTable from './PatientUsersTable'
import './PatientDetail.scss'

class PatientDetailt extends React.PureComponent {

  state = {
    editUser: false
  }

  toggleEditUser = () => {
    this.setState({editUser: !this.state.editUser})
  }

  componentDidMount(){
    const { match } = this.props
    this.props.loadPatient({id: match.params.patientId, users: true})
  }

  componentWillUnmount(){
    this.props.unloadPatient()
  }

  render() {
    const {patient, updatePatient, deletePatient, history, addUserPatient, deleteUserPatient } = this.props
    const { editUser } = this.state
    
    
    return (
      <React.Fragment>
        <div className="PatientDetailt">
          <nav aria-label="breadcrumb" className="Breadcrumb">
            <ol className="breadcrumb d-flex justify-content-between align-items-center" style={{marginBottom: 0}}>
              <li className="breadcrumb-item ">
                <Link to="/gestione-utenti/">Gestione utenti</Link>
              </li>
            </ol>
          </nav>
          {patient && <div className="flex-1">
            <div className="row no-gutters h-100">

              {/* left column: user info and edit */}
              <div className="col-sm-3 bg-light py-2 px-4">
                <div>CARE RECEIVER</div>
                <h2>{patient.name} {patient.surname}</h2>
                
                <div>
                  {patient.email}
                </div>
                <div className="text-muted">
                  ID: {patient.id}
                </div>

                <button type="button" className="btn btn-link" onClick={this.toggleEditUser}>
                  Modifica profilo utente
                </button>

                <div className="d-flex align-items-center justify-content-center">
                  {/* <ConfirmDelete className="btn btn-sm btn-block btn-outline-dark" user={user} onClick={() => {
                      deletePatient(patient.id)
                      .then(resp => {
                        history.push('/gestione-utenti')
                      })
                  }}>
                    Elimina utente
                  </ConfirmDelete> */}
                </div>
              </div>
              
              {/* right column: user-type specific controls */}
              <div className="col-sm-9 p-3">
                  <h5>Care giver associati</h5>
                  <PatientUsersTable patient={patient} users={patient.users || []} 
                    userFilter={item => item.type === 'Therapist'}
                    associateButtonText='Associa nuovo care giver'
                    userLabel='Care giver'
                    addUserPatient={addUserPatient} deleteUserPatient={deleteUserPatient}/>
                  <h5>Utenti invitati associati</h5>
                  <PatientUsersTable patient={patient} users={patient.users || []} 
                    userFilter={item => item.type === 'Teacher' || item.type === 'Researcher'}
                    associateButtonText='Associa nuovo utente'
                    addUserPatient={addUserPatient} deleteUserPatient={deleteUserPatient}/>
                 
                  
              </div>

            </div>
          
          
          </div>}
          
        </div>

        <PatientCreateModal 
          initialValues={patient}
          onCancel={this.toggleEditUser}
          onSubmit={(patient) => updatePatient(patient)}
          onSubmitSuccess={data => {
            this.toggleEditUser()
            //#TODO: fix reducer instead
            const { match } = this.props
            this.props.loadPatient({id: match.params.patientId, users: true})
          }}
          isOpen={editUser} toggle={this.toggleEditUser}/>
        
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  patient: getPatient(state),
  patientLoading: getPatientLoading(state),
});

export default connect(
  mapStateToProps,
  {
    loadPatient,
    unloadPatient,
    updatePatient,
    deletePatient,
    
    addUserPatient, 
    deleteUserPatient,
  }
)(PatientDetailt);
