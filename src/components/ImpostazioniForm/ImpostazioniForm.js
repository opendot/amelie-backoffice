import React from 'react'
import { connect } from 'react-redux'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Field, reduxForm, formValueSelector } from "redux-form";
import { FieldInput, required } from "../form";
import { Form, Button } from "reactstrap";
import { loadRegions, loadProvinces, unloadRegions, unloadProvinces, getRegions, getProvinces, getCities } from '../../state/geoEntities'





class ImpostazioniForm extends React.Component {


  render(){
    const { toggle, handleSubmit, error, valid, create, regions, provinces } = this.props
    return (
      <Form onSubmit={handleSubmit}>
          
          <Field
            label={'Numero di invitati massimo per genitore'}
            name="num_invites"
            validate={required}
            component={FieldInput}
            type="number"
          />
          <Field
            label={'Numero di giorni di inattività prima della cancellazione'}
            name="user_expiration_days"
            validate={required}
            component={FieldInput}
            type="number"
          />

          <Field
            label={'Testo invito'}
            name="invite_text"
            component={FieldInput}
            type="textarea"
          />
            
          {error && <div className="p-2"><div className="alert alert-danger">
            {error}
          </div></div>}


          <div className="mt-2">
            <button className="btn btn-primary">SALVA</button>
          </div>
        
        </Form>
      )
  }

}


ImpostazioniForm = reduxForm({
  form: "settingsForm",
  enableReinitialize: true,
})(ImpostazioniForm);

export default ImpostazioniForm

