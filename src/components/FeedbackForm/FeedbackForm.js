import React from "react";
import { Link } from "react-router-dom";
import { Field, reduxForm } from "redux-form";
import { FieldInput, DropzoneInput, required } from "../form";
import { Form, Button } from "reactstrap";
import MaterialIcon from "material-icons-react";

class FeedbackForm extends React.PureComponent {
  render() {
    const { handleSubmit, backLink, onCancel, valid, submitting, onDelete } = this.props;

    return (
      <div>
        <Form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="row">
              <div className="col-7">
                <Field
                  label={<b>Carica video *</b>}
                  name="video"
                  validate={required}
                  component={DropzoneInput}
                  fileType={"video"}
                />
              </div>
              <div className="col-5">
                <Field
                  label={<b>Titolo*</b>}
                  name="label"
                  validate={required}
                  component={FieldInput}
                  type="text"
                />

                <Field
                  label={<b>Tags (separate da virgola)</b>}
                  name="tags"
                  component={FieldInput}
                  type="text"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            {submitting && (
              <span className="rotating">
                <MaterialIcon icon="sync" />
              </span>
            )}
            {backLink && (
              <Button color="secondary" tag={Link} to={backLink}>
                Annulla
              </Button>
            )}
            {onDelete && (
              <Button color="danger" onClick={onDelete}>
                Elimina
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
      </div>
    );
  }
}

export default reduxForm({
  form: "feedbackForm"
})(FeedbackForm);
