import React from "react";
import { connect } from "react-redux";
import {
  loadPatients,
  unloadPatients,
  getPatients,
  getPatientsLoading
} from "../../state/patients";
import Select from "react-select";
import withConfirmation from "../../hocs/withConfirmation";
import find from "lodash/find";
import memoize from "memoize-one";

const ConfirmRemoveAssociation = withConfirmation(({ onClick, ...props }) => (
  <button className="btn btn-dark" onClick={onClick} {...props}>
    x
  </button>
));

const ConfirmAddAssociation = withConfirmation(({ onClick, ...props }) => (
  <button className="btn btn-dark" onClick={onClick} {...props}>
    Aggiungi
  </button>
));

class CareReceiversTable extends React.Component {
  state = {
    addCareReceiver: false,
    selectedReceiver: null
  };

  toggleAddCareReceiver = () => {
    if (this.state.addCareReceiver) {
      this.props.unloadPatients();
    } else {
      this.props.loadPatients({ all: true });
    }
    this.setState({ addCareReceiver: !this.state.addCareReceiver });
  };

  getPatientsForAssociation = memoize((patients, availablePatients) => {
    if (!availablePatients || !patients) {
      return availablePatients;
    }
    const patientsIds = patients.map(x => x.id);
    return availablePatients.filter(x => patientsIds.indexOf(x.id) === -1);
  });

  addPatient = patientId => {
    const { user } = this.props;
    return this.props.addUserPatient({ id: user.id, patientId });
  };

  deletePatient = patientId => {
    const { user } = this.props;
    return this.props.deleteUserPatient({ id: user.id, patientId });
  };

  render() {
    const { user, patients, readOnly, availablePatients } = this.props;
    const { addCareReceiver, selectedReceiver } = this.state;
    const patientsForAssociation = this.getPatientsForAssociation(
      patients,
      availablePatients
    );

    return (
      <table className="table">
        <thead>
          <tr>
            <th>Care receiver</th>
            <th>Città</th>
            <th>User ID</th>
            {!readOnly && <th />}
          </tr>
        </thead>
        <tbody>
          {!readOnly && !addCareReceiver && (
            <tr>
              <td colSpan="4">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={this.toggleAddCareReceiver}
                >
                  Associa nuovo care receiver
                </button>
              </td>
            </tr>
          )}
          {!readOnly && addCareReceiver && (
            <tr>
              <td colSpan="4">
                <div className="row">
                  <div className="col-8">
                    {availablePatients && (
                      <Select
                        defaultValue={
                          selectedReceiver ? selectedReceiver.id : null
                        }
                        onChange={v => {
                          if (!v.value) {
                            this.setState({ selectedReceiver: null });
                          } else {
                            const newPatient = find(
                              availablePatients,
                              item => item.id === v.value
                            );
                            this.setState({ selectedReceiver: newPatient });
                          }
                        }}
                        options={patientsForAssociation.map(item => ({
                          label: `${item.name} ${item.surname}`,
                          value: item.id
                        }))}
                      />
                    )}
                  </div>
                  <div className="col-4">
                    <ConfirmAddAssociation
                      title="Associa care receiver"
                      caption={
                        selectedReceiver &&
                        `Cliccando su OK associerai ${selectedReceiver.name} ${
                          selectedReceiver.surname
                        } a ${user.name} ${user.surname}`
                      }
                      className="btn btn-primary mr-2"
                      onClick={() => {
                        this.addPatient(selectedReceiver.id).then(() => {
                          this.setState({
                            addCareReceiver: false,
                            selectedReceiver: null
                          });
                        });
                      }}
                      disabled={!selectedReceiver}
                    />
                    <button
                      className="btn btn-dark"
                      onClick={() => {
                        this.setState({
                          addCareReceiver: false,
                          selectedReceiver: null
                        });
                      }}
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          )}

          {patients &&
            patients.length > 0 &&
            patients.map(patient => (
              <tr key={patient.id}>
                <td>
                  {patient.name} {patient.surname}
                </td>
                <td>{patient.city}</td>
                <td>{patient.id}</td>
                {!readOnly && (
                  <td>
                    <ConfirmRemoveAssociation
                      title={"Conferma rimozione care receiver"}
                      caption={`Confermi la rimozione del care receiver ${
                        patient.name
                      } ${patient.surname} ?`}
                      onClick={() => {
                        this.deletePatient(patient.id).then(() => {
                          this.setState({
                            addCareReceiver: false,
                            selectedReceiver: null
                          });
                        });
                      }}
                      patient={patient}
                    />
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    );
  }
}

CareReceiversTable.defaultProps = {
  readOnly: false
};

export default connect(
  state => ({
    availablePatients: getPatients(state),
    availablePatientsLoading: getPatientsLoading(state)
  }),
  {
    loadPatients,
    unloadPatients
  }
)(CareReceiversTable);
