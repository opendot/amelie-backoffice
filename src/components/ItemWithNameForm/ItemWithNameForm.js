import React from "react";
import { Link } from "react-router-dom";
import { Field, reduxForm } from "redux-form";
import { FieldInput, required } from "../form";
import { Form, Button } from "reactstrap";

class ItemWithNameForm extends React.PureComponent {
  render() {
    const { handleSubmit, backLink, onCancel, valid, error } = this.props;

    return (
      <Form onSubmit={handleSubmit}>
        <div className="modal-body">
          <Field
            label={<b>Nome *</b>}
            name="name"
            validate={required}
            component={FieldInput}
            type="text"
          />
        </div>
        {error && <div className="p-2"><div className="alert alert-danger">
          {error}
        </div></div>}
        <div className="modal-footer">
          {backLink && (
            <Button color="secondary" tag={Link} to={backLink}>
              Annulla
            </Button>
          )}
          {onCancel && (
            <Button color="secondary" onClick={onCancel}>
              Annulla
            </Button>
          )}
          <Button disabled={!valid} color="success">
            Salva
          </Button>
        </div>
      </Form>
    );
  }
}

export default reduxForm({
  form: "itemWithName"
})(ItemWithNameForm);
