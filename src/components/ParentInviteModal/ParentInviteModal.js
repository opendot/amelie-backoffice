import React from 'react'
import { connect } from 'react-redux'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Field, reduxForm, FieldArray, formValueSelector } from "redux-form";
import { FieldInput, required, email } from "../form";
import { Form, Button } from "reactstrap";
import { loadInvites, unloadInvites, getInvites } from '../../state/invites'
import find from 'lodash/find'
import get from 'lodash/get'
import { loadPreferences, getPreferences } from '../../state/preferences'

function validateInvites(values){
  const validMails = (values || []).filter(item => item.email)
  return !validMails.length ? 'Specificare almeno una mail' : null
}

const validateDupes = (invites, currentPatient) => v => { 
  const dupe = find((invites || []).filter(x => x.patient_id === currentPatient), item => item.mail === v)
  return dupe ? 'Utente già invitato' : null
}

const validateNumMail = (invites, currentPatient, preferences) => v => { 
  const numInvites = get(preferences, 'num_invites')
  if(!numInvites){
    return 'Nessun invito disponibile'
  }
  const invitesForPatient = (invites || []).filter(item => item.patient_id === currentPatient)
  const totalInvites = invitesForPatient.length + ((v || []).filter(x => x.email).length)
  if(totalInvites > +numInvites){
    const remainingInvites = +numInvites - invitesForPatient.length
    return `Attenzione: il numero massimo di inviti rimasti per questo paziente è ${remainingInvites}.`
  }
  return null 
}

const renderMails = ({ validateDuplicate, fields,  meta: { error, submitFailed } }) => (
  <div>
    {fields.map((mail, index) => (
      <div key={index} className="row">
        <div className="col-sm-3">
          Mail {index+1}
        </div>
        <div className="col-sm-6">
          <Field
            name={`${mail}.email`}
            autoComplete="off"
            type="email"
            validate={[email, validateDuplicate]}
            component={FieldInput}
          />
        </div>
        <div className="col-sm-3">
          <button
            disabled={fields.length === 1}
            className="btn btn-sm btn-danger"
            type="button"
            title="Remove mail"
            onClick={() => fields.remove(index)}
          >
          x
          </button>
        </div>
        
      </div>
    ))}
    <div>
      <button className="btn btn-sm btn-primary" type="button" onClick={() => fields.push({})}>
        + Aggiungi mail
      </button>
    {error && <div className="mt-2 alert alert-danger"><small className="">{error}</small></div>}
    </div>
  </div>
)


class ParentInviteForm extends React.Component {

  componentDidMount(){
    this.props.loadInvites()
    
  }

  componentDidUpdate(oldProps){
  
  }

  componentWillUnmount(){
    this.props.unloadInvites()
  }


  render(){
    const { toggle, 
      handleSubmit, 
      error, valid,
      patients, validateDuplicate, validateMailNumber } = this.props
      
    return (
      <Form onSubmit={handleSubmit}>
          <React.Fragment>
            <ModalHeader toggle={toggle}>
            Invita utenti
          </ModalHeader>

          <ModalBody>

            <div className="row">
              <div className="col">
                <Field
                  label={'Care receiver'}
                  name="patient"
                  validate={required}
                  component={FieldInput}
                  type="select"
                >
                  <option></option>
                  {patients && patients.length > 0 && patients.map(patient => (
                    <option value={patient.id} key={patient.id}>{patient.name} {patient.surname}</option>
                  ))}
                </Field>
              </div>
            </div>
            <FieldArray validateDuplicate={validateDuplicate} validate={[validateInvites, validateMailNumber]} name="mails" component={renderMails} />

            {error && <div className="p-2"><div className="alert alert-danger">
              {error}
            </div></div>}
          </ModalBody>
          
          <ModalFooter>
            <Button disabled={!valid} color="dark" block>
              Invia inviti
            </Button>
          </ModalFooter>

          </React.Fragment>
          
        </Form>
    )
  }
}

const selector = formValueSelector("ParentInviteForm")
ParentInviteForm = connect(
  (state, ownProps) => ({
    invites: getInvites(state),
    currentPatient: selector(state, 'patient'),
  }),
  {
    loadInvites,
    unloadInvites,
  }
)(ParentInviteForm)




ParentInviteForm = reduxForm({
  form: "ParentInviteForm",
})(ParentInviteForm);


const ParentInviteSuccess = ({invitesSent,selectedPatient, toggle}) => {

  return <React.Fragment>
      <ModalHeader toggle={toggle}>
        Inviti inviati
      </ModalHeader>
      <ModalBody>
        Inviti inviti a {invitesSent.ok.join(', ')} per il 
        paziente {selectedPatient.name} {selectedPatient.surname}.
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-dark" onClick={toggle}>OK</button>
      </ModalFooter>
    </React.Fragment>
}


class ParentInviteModal extends React.Component {

  componentDidMount(){
    this.props.loadPreferences()
  }

  render(){
    const { isOpen, toggle, invitesSent, currentPatient, preferences, invites, ...passProps} = this.props
    const validateDuplicate = validateDupes(invites, currentPatient)
    const validateMailNumber = validateNumMail(invites, currentPatient, preferences)
    const selectedPatient = invitesSent && find(passProps.patients, item => item.id === invitesSent.patient)
    return (
      
      <Modal isOpen={isOpen} toggle={toggle} backdrop='static'>
          {isOpen && !invitesSent && <ParentInviteForm validateMailNumber={validateMailNumber} validateDuplicate={validateDuplicate} toggle={toggle} {...passProps}/>}
          {invitesSent && <ParentInviteSuccess selectedPatient={selectedPatient} invitesSent={invitesSent} toggle={toggle}/>}
      </Modal>
      
    )
  }
}

ParentInviteModal.defaultProps = {
  withPassword: false,
  create: false,
}

ParentInviteModal = connect(
  state => ({
    invites: getInvites(state),
    currentPatient: selector(state, 'patient'),
    preferences: getPreferences(state),
    
  }),
  {
    loadPreferences,
  }
)(ParentInviteModal)


export default ParentInviteModal

