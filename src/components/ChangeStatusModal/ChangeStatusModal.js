import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Field, reduxForm } from "redux-form";
import { FieldInput, required } from "../form";
import { Form, Button } from "reactstrap";


const statusOptions = ['Abilitato', 'Disabilitato']
  .map(x => (<option key={x} value={x}>{x}</option>))

class ChangeStatusForm extends React.Component {
  render(){
    const { toggle, handleSubmit, error, valid } = this.props
    return (
      <Form onSubmit={handleSubmit}>
          <ModalHeader toggle={toggle}>
            Modifica status
          </ModalHeader>

          <ModalBody>

            <Field
              label={'Tipo'}
              name="type"
              validate={required}
              component={FieldInput}
              type="select"
            >
              {statusOptions}
            </Field>

            {error && <div className="p-2"><div className="alert alert-danger">
              {error}
            </div></div>}
          </ModalBody>
          
          <ModalFooter>
          <Button type="button" color="dark" onClick={toggle}>
              Annulla
            </Button>

            <Button disabled={!valid} color="dark">
              Modifica utenti
            </Button>
          </ModalFooter>
        </Form>
    )
  }
}


ChangeStatusForm = reduxForm({
  form: "changeStatusForm",
  enableReinitialize: true,
})(ChangeStatusForm);


export default class ChangeStatusModal extends React.Component {

  render(){
    const { isOpen, toggle, ...passProps} = this.props
    return (
      
      <Modal isOpen={isOpen} toggle={toggle} backdrop='static'>
          <ChangeStatusForm toggle={toggle} {...passProps}/>
      </Modal>
      
    )
  }
}

ChangeStatusModal.defaultProps = {

}


