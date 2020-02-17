import React from "react";
import { Container } from "reactstrap";
import withDataTable from '../../hocs/withDataTable'
import {withRouter} from 'react-router-dom'
import Paginator from './Paginator'
import MaterialIcon from "material-icons-react";
import ConfirmDelete from './ConfirmDelete'


const ParentCareReceiversList = ({ patients, page, numPages, goToPage, filters, history, deletePatient }) => {
  
  const { search, disabled } = filters
  
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
              <th>Città</th>
              <th>Care givers associati</th>
              <th className="w-25"></th>
            </tr>
          </thead>
          <tbody>
            {patients && patients.map(patient => (
              <tr className="pointer" key={patient.id} 
                  // onClick={() => history.push(`/gestione-utenti/pazienti/${patient.id}`)}
                >
                <td>{patient.name} {patient.surname}</td>
                <td>{patient.city}</td>
                <td>#no care givers in api</td>
                <td className="w-25">
                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    onClick={() => history.push(`/gestione-utenti/pazienti/${patient.id}`)}
                    className="btn btn-light rounded-circle button-circle-lg mr-2 d-flex">
                      <MaterialIcon icon="edit"/>
                  </button>
                  <ConfirmDelete user={patient} onClick={() => {
                    deletePatient(patient.id)
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
  filters: ['search'],
  queryString: true
})(ParentCareReceiversList))