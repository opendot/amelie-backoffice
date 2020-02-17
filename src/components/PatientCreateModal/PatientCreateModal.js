import React from "react";
import { connect } from "react-redux";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { Field, reduxForm, formValueSelector } from "redux-form";
import { FieldInput, required } from "../form";
import { Form, Button } from "reactstrap";
import {
  loadRegions,
  loadProvinces,
  unloadRegions,
  unloadProvinces,
  getRegions,
  getProvinces,
  getCities
} from "../../state/geoEntities";
import { Link } from "react-router-dom";

class PatientForm extends React.Component {
  componentDidMount() {
    const { region } = this.props;
    this.props.loadRegions();
    if (region) {
      this.props.loadProvinces(region);
    }
  }

  componentDidUpdate(oldProps) {
    const { region } = this.props;
    if (oldProps.region != region) {
      this.props.unloadProvinces();
      if (region) {
        this.props.loadProvinces(region);
      }
    }
  }

  componentWillUnmount() {
    this.props.unloadRegions();
    this.props.unloadProvinces();
  }

  render() {
    const {
      toggle,
      handleSubmit,
      error,
      valid,
      latestPatientAdded,
      create,
      regions,
      provinces
    } = this.props;
    return (
      <Form onSubmit={handleSubmit}>
        {!latestPatientAdded && (
          <React.Fragment>
            <ModalHeader toggle={toggle}>
              {create ? "Aggiungi paziente" : "Modifica paziente"}
            </ModalHeader>

            <ModalBody>
              <div className="row">
                <div className="col">
                  <Field
                    label={"Nome"}
                    name="name"
                    validate={required}
                    component={FieldInput}
                    type="text"
                  />
                </div>
                <div className="col">
                  <Field
                    label={"Cognome"}
                    name="surname"
                    validate={required}
                    component={FieldInput}
                    type="text"
                  />
                </div>
                <div className="col">
                  <Field
                    label={"Data di nascita"}
                    name="birthdate"
                    validate={required}
                    component={FieldInput}
                    type="date"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <Field
                    label={"Regione"}
                    name="region"
                    component={FieldInput}
                    type="select"
                  >
                    <option value="" />
                    {regions &&
                      regions.length > 0 &&
                      regions.map(region => (
                        <option key={region.id} value={region.id}>
                          {region.nome}
                        </option>
                      ))}
                  </Field>
                </div>
                <div className="col">
                  <Field
                    label={"Provincia"}
                    name="province"
                    component={FieldInput}
                    type="select"
                  >
                    <option value="" />
                    {provinces &&
                      provinces.length > 0 &&
                      provinces.map(province => (
                        <option key={province.id} value={province.id}>
                          {province.nome}
                        </option>
                      ))}
                  </Field>
                </div>
                <div className="col">
                  <Field
                    label={"Città"}
                    name="city"
                    component={FieldInput}
                    type="text"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <Field
                    label={"Mutazione"}
                    name="mutation"
                    component={FieldInput}
                    type="text"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2">
                  <div className="alert alert-danger">{error}</div>
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button disabled={!valid} color="dark" block>
                {create ? "Crea paziente" : "Modifica paziente"}
              </Button>
            </ModalFooter>
          </React.Fragment>
        )}
        {latestPatientAdded && (
          <React.Fragment>
            <ModalHeader toggle={toggle}>Utente creato</ModalHeader>
            <ModalBody>
              {latestPatientAdded.name} {latestPatientAdded.surname} creato con
              successo
            </ModalBody>
            <ModalFooter>
              <button type="button" className="btn btn-light" onClick={toggle}>
                CHIUDI
              </button>
              <Link
                className="btn btn-dark"
                to={`/gestione-utenti/pazienti/${latestPatientAdded.id}`}
              >
                Visita pagina utente
              </Link>
            </ModalFooter>
          </React.Fragment>
        )}
      </Form>
    );
  }
}

const selector = formValueSelector("patientForm"); // <-- same as form name

PatientForm = connect(
  state => ({
    regions: getRegions(state),
    provinces: getProvinces(state),
    cities: getCities(state),
    region: selector(state, "region"),
    province: selector(state, "province"),
    city: selector(state, "city")
  }),
  {
    loadRegions,
    unloadRegions,
    loadProvinces,
    unloadProvinces
  }
)(PatientForm);

PatientForm = reduxForm({
  form: "patientForm"
})(PatientForm);

export default class PatientCreateModal extends React.Component {
  render() {
    const { isOpen, toggle, ...passProps } = this.props;
    return (
      <Modal isOpen={isOpen} toggle={toggle} backdrop="static">
        {isOpen && <PatientForm toggle={toggle} {...passProps} />}
      </Modal>
    );
  }
}

PatientCreateModal.defaultProps = {
  withPassword: false,
  create: false
};
