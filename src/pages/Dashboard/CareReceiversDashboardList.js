import React from "react";
import { connect } from 'react-redux'
import withDataTable from '../../hocs/withDataTable'
import {withRouter} from 'react-router-dom'
// TODO: Move to components ...
import Paginator from '../GestioneUtenti/Paginator'
import MaterialIcon from "material-icons-react";
// import ConfirmDelete from './ConfirmDelete'
import {
  loadPatients, unloadPatients, getPatients, getPatientsLoading,
  getPatientsNumPages,
} from '../../state/patients'

const CareReceiversDashboardList = ({ patients, page, numPages, goToPage, filters, history }) => {

  const { search } = filters

  return (

    <div>

      <div className="w-100 mb-3">
        <input
          className={`form-control`}
          name='search'
          placeholder={'Cerca utente'}
          value={search.value}
          onChange={search.onChange}
        />
      </div>

        <table className="table border-left border-right border-bottom">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Città</th>
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
                <td className="w-25">
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      onClick={() => history.push(`/dashboard/care-receiver/${patient.id}`)}
                      className="btn btn-white border rounded-circle button-circle-lg mr-2 d-flex">
                        <MaterialIcon icon="keyboard_arrow_right"/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Paginator className="mx-auto" numPages={numPages} currentPage={page} goToPage={goToPage} />
    </div>
  )
}

const loadCareReceivers = params => loadPatients({ ...params, all: true, parents: true })

export default withRouter(connect(state => ({
  patients: getPatients(state),
  loading: getPatientsLoading(state),
  numPages: getPatientsNumPages(state),
}), {
  loadItems: loadCareReceivers,
  unloadItems: unloadPatients,
})(withDataTable({
  filters: ['search'],
  queryString: true
})(CareReceiversDashboardList)))
