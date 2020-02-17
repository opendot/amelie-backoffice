import React from 'react'
import { connect } from 'react-redux'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Field, reduxForm, formValueSelector } from "redux-form";
import { FieldInput, required, FieldCheckbox } from "../form";
import { Form, Button } from "reactstrap";
import './PackageDownloadForm.scss'
import IncludeSwitch from "../IncludeSwitch";

class PackageDownloadForm extends React.Component {

    state = {
        requested: false
    }


  render(){
    const {handleSubmit, error, valid, regions } = this.props
    
    return (
        <div className="package-download">
      <Form onSubmit={handleSubmit}>

        <Field
            label={'Numero di utenti'}
            name="num_users"
            validate={required}
            component={FieldInput}
            className="field-req"
            type="number"
          />

        <Field
            label={'Numero di sessioni per utente'}
            name="num_sessions"
            validate={required}
            component={FieldInput}
            className="field-req"
            type="number"
          />

          <Field
              label={"Regione"}
              name="region"
              component={FieldInput}
              type="select"
            >
            <option value="" key="">{"Tutte le regioni"}</option>
              {regions &&
                regions.length > 0 &&
                regions.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.nome}
                  </option>
                ))}
          </Field>

        <div className="session-type">
          <Field
              label={'Sessioni di Comunicazione'}
              name="CommunicationSession"
              component={FieldCheckbox}
            />

            <Field
                label={'Sessioni cognitive'}
                name="CognitiveSession"
                component={FieldCheckbox}
            />
        </div>

            <div className="include-eye">
            <span className="eye-label">Includi Dati Eyetracker</span>
            <Field
                label={'Solo sessioni con Dati eyetracker'}
                name="trackerData"
                component={IncludeSwitch}
                id={"include-eye-data"}
            />
            </div>

          {error && <div className="p-2"><div className="alert alert-danger">
            {error}
          </div></div>}

          {this.state.requested && !error && <div className="p-2"><div className="alert alert-success">
              {"La tua richiesta è stata inviata, riceverai sulla tua mail un link da cui scaricare i dati"}
          </div></div>}

          <div className="mt-2">
            <button onClick={()=>{this.setState({requested:true})}} className="btn btn-primary">INVIA</button>
          </div>
        
        </Form>
        </div>
      )
  }
}


PackageDownloadForm = reduxForm({
  form: "packageDownloadForm",
  enableReinitialize: true,
})(PackageDownloadForm);

export default PackageDownloadForm

