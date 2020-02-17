import React from "react";
import { Container } from "reactstrap";
import { withRouter } from 'react-router'
import withDataTable from '../../hocs/withDataTable'
import Paginator from './Paginator'
import MaterialIcon from "material-icons-react";
import ConfirmDelete from './ConfirmDelete'


const TeachersList = ({ users, page, numPages, goToPage, filters, history, deleteUser }) => {
  const { search } = filters
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
      </div>
      
      
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Care receivers associati</th>
              <th className="w-25"></th>
            </tr>
          </thead>
          <tbody>
            {users && users.map(user => (
              <tr className="pointer" key={user.id} 
                // onClick={() => history.push(`/gestione-utenti/${user.code}`)}
                >
                <td>{user.name} {user.surname}</td>
                <td>{user.email}</td>
                <td>{user.patients && user.patients.map(patient => `${patient.name} ${patient.surname}`).join(', ')}</td>
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
    </Container>
  
  )
}

export default withRouter(withDataTable({
  filters: [['search']],
  queryString: true,
})(TeachersList))