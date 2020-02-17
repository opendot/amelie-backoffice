import React from 'react'
import withConfirmation from '../../hocs/withConfirmation'
import MaterialIcon from "material-icons-react";
import get from 'lodash/get'


const Delete = ({onClick, children, className}) => (

      <button
        type="button"
        onClick={onClick}
        className={className}>
          {children || <MaterialIcon icon="delete"/>}
      </button>
)

Delete.defaultProps = {
  className: 'btn btn-light rounded-circle button-circle-lg d-flex',
}

const ConfirmDelete = withConfirmation(Delete)

const withUserConfirmation = WrappedComponent => {
  class ConfirmableComponent extends React.Component {
    
    
    render() {
      const {
        title,
        caption,
        ...props
      } = this.props
      return (
        <WrappedComponent {...props} title='Rimuovi utente' caption={(props) => `Confermi la rimozione di ${get(props, 'user.name', '')} ${get(props, 'user.surname', '')} ?`} />
      )
    }
  }

  return ConfirmableComponent

}

export default withUserConfirmation(ConfirmDelete)



