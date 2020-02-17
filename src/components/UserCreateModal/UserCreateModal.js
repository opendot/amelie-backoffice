import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Field, reduxForm } from "redux-form";
import { FieldInput, required, FieldCheckbox } from "../form";
import { Form, Button } from "reactstrap";
import { Link } from "react-router-dom";



const userTypeOptions = ['Therapist', 'Parent', 'Researcher', 'Teacher']
  .map(x => (<option key={x} value={x}>{x}</option>))


class UserForm extends React.Component {
  render(){
    const { toggle, 
      handleSubmit, error, valid, 
      withPassword, withDisabled, create,
      latestUserAdded, submitSucceeded } = this.props

    return (
      <Form onSubmit={handleSubmit}>
          {!latestUserAdded && <React.Fragment>
            <ModalHeader toggle={toggle}>
            {create ? 'Aggiungi utente' : 'Modifica utente'}
          </ModalHeader>

          <ModalBody>

            {create && <Field
              label={'Tipo'}
              name="type"
              validate={required}
              component={FieldInput}
              type="select"
            >
              {userTypeOptions}
            </Field>}

            <Field
              label={'Nome'}
              name="name"
              validate={required}
              component={FieldInput}
              type="text"
            />

            <Field
              label={'Cognome'}
              name="surname"
              validate={required}
              component={FieldInput}
              type="text"
            />

            <Field
              label={'Email'}
              name="email"
              validate={required}
              // disabled={!create}
              component={FieldInput}
              type="email"
            />

            {withPassword && <Field
              label={'Password'}
              name="password"
              validate={required}
              component={FieldInput}
              type="text"
            />}

            {/* // #TODO: API DOES NOT HANDLE "DISABLED" */}
            {withDisabled && <Field
              label={'Disabilitato'}
              name="disabled"
              component={FieldCheckbox}
            />}

            {error && <div className="p-2"><div className="alert alert-danger">
              {error}
            </div></div>}
          </ModalBody>
          
          <ModalFooter>
            <Button disabled={!valid} color="dark" block>
              {create ? 'Crea utente' : 'Modifica utente'}
            </Button>
          </ModalFooter>

          </React.Fragment>}
          {latestUserAdded && <React.Fragment>
            <ModalHeader toggle={toggle}>
              Utente creato
            </ModalHeader>
            <ModalBody>
              {latestUserAdded.name} {latestUserAdded.surname} creato con successo
            </ModalBody>
            <ModalFooter>
              <button type="button" className="btn btn-light" onClick={toggle}>CHIUDI</button>
              <Link className="btn btn-dark" to={`/gestione-utenti/${latestUserAdded.id}`}>Visita pagina utente</Link>
            </ModalFooter>
          </React.Fragment>}
        </Form>
    )
  }
}


UserForm = reduxForm({
  form: "userForm",
  enableReinitialize: true,
})(UserForm);


export default class UserCreateModal extends React.Component {

  render(){
    const { isOpen, toggle, ...passProps} = this.props
    return (
      
      <Modal isOpen={isOpen} toggle={toggle} backdrop='static'>
          {isOpen && <UserForm toggle={toggle} {...passProps}/>}
      </Modal>
      
    )
  }
}

UserCreateModal.defaultProps = {
  withDisabled: false,
  withPassword: false,
  create: false,
}


