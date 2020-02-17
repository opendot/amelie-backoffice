import React from 'react'
import { connect } from 'react-redux'
import { getErrors, dismissError } from '../../state/errors'
import { Modal, ModalBody, ModalHeader, Alert } from 'reactstrap'

class GlobalErrors extends React.PureComponent {

  render(){
    const { errors, dismissError } = this.props
    return <Modal isOpen={errors.length > 0}>
      <ModalHeader>
        Uh-oh. Error!
      </ModalHeader>
      { errors.length > 0 && <ModalBody>
        We have some errors
        <div className="mt-3">
          {errors.map(error => (
            <Alert
              toggle={error.canDismiss ? () => dismissError(error.id) : undefined} color="danger" key={error.id}>
              {error.message}
            </Alert>
          ))}
        </div>
        <p>
          Reload the page please!
        </p>
      </ModalBody>}
    </Modal>

  }
}

const mapStateToProps = state => ({
  errors: getErrors(state),
})

export default connect(mapStateToProps, {dismissError})(GlobalErrors)
