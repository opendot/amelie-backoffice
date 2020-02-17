import React from "react";
import { Link } from "react-router-dom";
import { Field, reduxForm } from "redux-form";
import { FieldInput, DropzoneInput, required } from "../form";
import { Form, Button } from "reactstrap";
import MaterialIcon from "material-icons-react";

class ImageForm extends React.PureComponent {
  render() {
    const {
      handleSubmit,
      backLink,
      onCancel,
      onDelete,
      valid,
      cardContent,
      submitting
    } = this.props;

    return (
      <div>
        <Form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="row">
              <div className="col-7">
                {cardContent === "GenericImage" && (
                  <Field
                    label={<b>Carica immagine *</b>}
                    name="images"
                    validate={required}
                    component={DropzoneInput}
                  />
                )}
                {cardContent === "Text" && (
                  <Field
                    label={<b>Testo *</b>}
                    name="text"
                    validate={required}
                    component={FieldInput}
                    type="text"
                  />
                )}
              </div>
              <div className="col-5">
                <Field
                  label={<b>Titolo *</b>}
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
            {onDelete && (
              <Button color="danger" onClick={onDelete}>
                Elimina
              </Button>
            )}
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
            <Button disabled={!valid || submitting} color="success">
              Salva
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

export default reduxForm({
  form: "imageForm"
})(ImageForm);
