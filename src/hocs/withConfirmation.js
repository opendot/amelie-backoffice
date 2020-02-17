import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
 }

const withConfirmation = WrappedComponent => {
  class ConfirmableComponent extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        modal: false
      }
    }
    toggle = () => {
      this.setState(prevState => ({
        modal: !prevState.modal
      }));
    }
    confirm = () => {
      this.toggle()
      this.props.onClick && this.props.onClick()
    }
    render() {
      const {
        caption,
        title,
        confirmText,
        cancelText,
        confirmColor,
        cancelColor,
        modalClassName,
        headerClassName,
        bodyClassName,
        buttonClassName,
        confirmButtonClassName,
        cancelButtonClassName,
        ...props
      } = this.props

      const finalCaption = isFunction(caption) ? caption(this.props) : caption

      return (
        <React.Fragment>
          <WrappedComponent {...props} onClick={this.toggle} />
          <Modal isOpen={this.state.modal} toggle={this.toggle} className={modalClassName}>
            <ModalHeader className={headerClassName} toggle={this.toggle}>{title}</ModalHeader>
            <ModalBody className={bodyClassName}>
              {finalCaption}
            </ModalBody>
            <ModalFooter>
              <div className="d-flex flex-row justify-content-between w-100">
                <Button color={cancelColor} className={`${buttonClassName} ${confirmButtonClassName}`} onClick={this.toggle}>{cancelText}</Button>
                <Button color={confirmColor} className={`${buttonClassName} ${cancelButtonClassName}`} onClick={this.confirm}>{confirmText}</Button>
              </div>
            </ModalFooter>
          </Modal>
        </React.Fragment>
      )
    }
  }

  ConfirmableComponent.defaultProps = {
    caption: 'Sei sicuro di voler compiere questa operazione?',
    title: 'Conferma operazione',
    confirmText: 'OK',
    cancelText: 'Annulla',
    confirmColor: 'dark',
    cancelColor: 'secondary',
    modalClassName: '',
    headerClassName: '',
    bodyClassName: '',
    buttonClassName: '',
    confirmButtonClassName: '',
    cancelButtonClassName: ''
  }

  return ConfirmableComponent

}

export default withConfirmation