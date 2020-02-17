import React from "react";
import { connect } from 'react-redux'
import { Container } from "reactstrap";
import withDataTable from '../../hocs/withDataTable'
import { withRouter } from 'react-router'
import Paginator from './Paginator'
import MaterialIcon from "material-icons-react";
import ConfirmDelete from './ConfirmDelete'
import ChangeStatusModal from '../../components/ChangeStatusModal'
import { FormGroup, Label, Input } from 'reactstrap';
import { enableDisableUsers } from '../../state/users'


class ParentsList extends React.Component {

  state = {
    selectedUsers: {},
    changeStatus: false,
  }

  toggleChangeStatus = () => {
    this.setState({changeStatus: !this.state.changeStatus})
  }

  toggleSelectUser = id => {
    let { selectedUsers } = this.state
    if (selectedUsers[id]){
      delete selectedUsers[id]
    } else {
      selectedUsers[id] = true
    }
    this.setState({selectedUsers})
  }

  componentDidUpdate(oldProps){
    if(oldProps.users !== this.props.users){
      this.setState({selectedUsers: {}})
    }
  }

  getSelectedUsersIds = selectedUsers => {
    return Object.keys(selectedUsers)
  }

  render(){
    const { selectedUsers, changeStatus } = this.state
    const { users, page, numPages, goToPage, filters, history, deleteUser } = this.props
    const { search, disabled } = filters
    const selectedUsersIds = this.getSelectedUsersIds(selectedUsers)
    
    console.info("d", disabled.value)
    
    
  return (
    
    <Container fluid>

      <div className="row py-2">
        <div className="col col-sm-3">
        <input
              className={`form-control`}
              name='search'
              placeholder={'Search here'}
              value={search.value}
              onChange={search.onChange}
        />
        </div>
        
        <div className="col col-sm-3">
          <FormGroup inline>
            <Input type="select" name="disabled" value={disabled.value} onChange={e => {
              disabled.onChange(e.target.value || undefined)
            }}>
              <option value="">Abilitati e disabilitati</option>
              <option value="false">Abilitati</option>
              <option value="true">Disabilitati</option>
              
            </Input>
          </FormGroup>
        </div>
       
        
        {selectedUsersIds.length > 0 && <div>
            <button 
              onClick={this.toggleChangeStatus}
              className="btn btn-sm btn-primary">Change status</button>
        </div>}
      </div>
      
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Nome</th>
              <th>Email</th>
              <th>Care receivers</th>
              <th>Status</th>
              <th className="w-25"></th>
            </tr>
          </thead>
          <tbody>
            {users && users.map(user => (
              <tr className="pointer" key={user.id}>
                <td>
                <FormGroup check>
                  <Label check>
                    <Input onChange={() => this.toggleSelectUser(user.id)} checked={!!selectedUsers[user.id]} value={selectedUsers[user.id]} type="checkbox" />{' '}
                  </Label>
                </FormGroup>
                </td>
                <td>{user.name} {user.surname}</td>
                <td>{user.email}</td>
                <td>{user.patients && user.patients.map(patient => `${patient.name} ${patient.surname}`).join(', ')}</td>
                <td>{user.disabled ? 'Disabilitato' : 'Abilitato'}</td>
                <td className="w-25">
                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    onClick={() => history.push(`/gestione-utenti/${user.id}`)}
                    className="btn btn-light rounded-circle button-circle-lg mr-2 d-flex">
                      <MaterialIcon icon="edit"/>
                  </button>
                  <ConfirmDelete user={user} onClick={() => {
                    deleteUser(user.id)
                  }}/>
                </div>
                </td>
              
              </tr>
            ))}
          </tbody>
        </table>
        <Paginator className="mx-auto" numPages={numPages} currentPage={page} goToPage={goToPage} />      

        <ChangeStatusModal 
          initialValues={{type: 'Abilitato'}}
          onSubmit={(values) => {
            const disabled = values.type === 'Abilitato' ? false : true
            const users  = selectedUsersIds.map(id => ({
              id, disabled
            }))
            return this.props.enableDisableUsers({users})

          }}
          onSubmitSuccess={(data) => {
            this.setState({
              changeStatus: false,
              selectedUsers: {},
            })
          }}
          isOpen={changeStatus} 
          toggle={this.toggleChangeStatus}/>
    </Container>
  
  )

  }
}


export default withRouter(withDataTable({
  filters: ['search', ['disabled', {omitWhenEmpty: true}]],
  queryString: true
})(connect(
  state => ({

  }),
  {
     enableDisableUsers
  }
)(ParentsList)))