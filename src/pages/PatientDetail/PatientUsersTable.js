import React from 'react'
import { connect } from 'react-redux'
import Select from 'react-select'
import withConfirmation from '../../hocs/withConfirmation'
import find from 'lodash/find'
import memoize from 'memoize-one'
import { loadUsers, getUsers, unloadUsers, getUsersLoading } from '../../state/users';


const ConfirmRemoveAssociation = withConfirmation(({onClick, ...props}) => (
  <button className="btn btn-dark" onClick={onClick} {...props}>
    x
  </button>
))

const ConfirmAddAssociation = withConfirmation(({onClick, ...props}) => (
  <button className="btn btn-dark" onClick={onClick} {...props}>
    Aggiungi
  </button>
))


class PatientUsersTable extends React.Component{

  state = {
    associateUser: false,
    selectedUser: null,
  }
  
  toggleassociateUser = () => {
    if(this.state.associateUser){
      this.props.unloadUsers()
    } else {
      this.props.loadUsers()
    }
    this.setState({associateUser: !this.state.associateUser})
  }

  filterUser = (user) => {
    return this.props.userFilter ? this.props.userFilter(user) : true
  }

  getGiversUsersForAssociation = memoize((users, availableUsers) => {
    if(!availableUsers || !users){
      return availableUsers
    }
    const giversIds = users.map(x => x.id)
    return availableUsers.filter(x => this.filterUser(x) && giversIds.indexOf(x.id) === -1)
  })

  associateUser = giver => {
    const { patient } = this.props
    //# NOTE: passing in "meta" param for addRemovePatientReducer in state/patients.js
    //(enables updating patient detail when adding caregiver from this table)
    return this.props.addUserPatient({id: giver.id, patientId: patient.id}, { giver: giver})
  }
  


  deleteAssociatedUser = giverId => {
    const { patient } = this.props
    return this.props.deleteUserPatient({id: giverId, patientId: patient.id})
  }


  render(){
    const { patient, users, readOnly, availableUsers, associateButtonText, userLabel } = this.props
    const {associateUser, selectedUser } = this.state
    const giversUsersForAssociation = this.getGiversUsersForAssociation(users, availableUsers)
    const currentUsers = (users || []).filter(this.filterUser)

    return <table className="table">
      <thead>
        <tr>
          <th>
            {userLabel}
          </th>
          <th>
            Email
          </th>
          <th>
            User ID
          </th>
          {!readOnly && <th></th>}
        </tr>
      </thead>
      <tbody>

      {!readOnly && !associateUser && <tr>
          <td colSpan="4">
            <button type="button" className="btn btn-sm btn-secondary" onClick={this.toggleassociateUser}>
              {associateButtonText}
            </button>
          </td>
        </tr>}
        {!readOnly && associateUser && <tr>
          <td colSpan="4">
            <div className="row">
              <div className="col-8">
                {availableUsers &&
                   <Select 
                      defaultValue={selectedUser ? selectedUser.id : null} 
                      onChange={v => {
                        if(!v.value){
                          this.setState({selectedUser: null})  
                        } else {
                          const newGiver = find(availableUsers, item => item.id === v.value)
                          this.setState({selectedUser: newGiver})
                        }
                      }} 
                      options={giversUsersForAssociation.map(item => ({label: `${item.name} ${item.surname}`, value: item.id}))} 
                    />}

              </div>
              <div className="col-4">
                <ConfirmAddAssociation 
                  title="Associa care receiver"
                  caption={selectedUser && `Cliccando su OK associerai ${selectedUser.name} ${selectedUser.surname} a ${patient.name} ${patient.surname}` }
                  className="btn btn-primary mr-2" 
                  onClick={()=> {
                    this.associateUser(selectedUser)
                    .then(()=> {
                      this.setState({
                        associateUser: false,
                        selectedUser: null,
                      })
                    })
                  }}
                  disabled={!selectedUser}/>
                <button className="btn btn-dark" onClick={()=>{
                  this.setState({
                    associateUser: false,
                    selectedUser: null,
                  })
                }}>Annulla</button>
              </div>
            </div>
          </td>
        </tr>}

        {currentUsers && currentUsers.length > 0 && currentUsers.map(user => (
          <tr key={user.id}>
            <td>{user.name} {user.surname}</td>
            <td>{user.email}</td>
            <td>{user.id}</td>
            {!readOnly && <td>
              <ConfirmRemoveAssociation 
                title={'Conferma rimozione care receiver'}
                caption={`Confermi la rimozione del care receiver ${user.name} ${user.surname} ?`}
                onClick={() => {
                  this.deleteAssociatedUser(user.id)
                  .then(()=> {
                    this.setState({
                      associateUser: false,
                      selectedUser: null,
                    })
                  })
                }}
                patient={patient}></ConfirmRemoveAssociation>
            </td>}
          </tr>
        ))}
        
      </tbody>

    </table>
  }
}

PatientUsersTable.defaultProps = {
  readOnly: false,
  associateButtonText: 'Associa nuovo utente',
  userLabel: 'Utente',
}


export default connect(
  state => ({
    availableUsers: getUsers(state),
    availableUsersLoading: getUsersLoading(state),
  }),
  {
    loadUsers,
    unloadUsers,
  }
)(PatientUsersTable)