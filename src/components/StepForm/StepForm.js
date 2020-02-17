import React from "react";
import { connect } from "react-redux";
import {
  Field,
  reduxForm,
  getFormValues,
  arraySwap,
  arrayRemove,
  change
} from "redux-form";
import { FieldInput, required, FieldCardSelector } from "../form";
import { Form, Button } from "reactstrap";
import get from "lodash/get";
import "./StepForm.scss";

class StepForm extends React.PureComponent {
  componentDidUpdate(oldProps) {
    const { formValues, arraySwap, form } = this.props;
    const oldFormValues = oldProps.formValues;

    if (
      +formValues.target_position !== +oldFormValues.target_position &&
      !(oldFormValues.template === 'three-cards' && formValues.template === 'two-cards')
    ) {
      arraySwap(
        form,
        "cards",
        +oldFormValues.target_position,
        +formValues.target_position
      );
    }
  }

  render() {
    const { formValues, form, arrayRemove, arraySwap, change } = this.props;
    const target_position = formValues.target_position;
    const template = formValues.template;

    return (
      <Form className="StepForm">
        <div className="row mt-3">
          <div className="col-4">
            <Field
              label={<b>Template</b>}
              name="template"
              validate={required}
              component={FieldInput}
              type="select"
              onChange={(e, v) => {
                if (
                  v === "two-cards" &&
                  formValues["template"] === "three-cards"
                ) {
                  const position = +formValues["target_position"];
                  if (position === 2) {
                    arraySwap(form, "cards", position, position - 1);
                    change(form, "target_position", 1);
                  }
                  arrayRemove(form, 'cards', 2)
                }
              }}
            >
              <option value={"two-cards"}>Template 2 cards</option>
              <option value={"three-cards"}>Template 3 cards</option>
            </Field>

            {/* #TODO: switch to a specialized field */}
            <Field
              label={<b>Target position</b>}
              name="target_position"
              // validate={required}
              component={FieldInput}
              type="select"
            >
              <option value={0}>Sinistra</option>
              <option value={1}>
                {template === "three-cards" ? "Centro" : "Destra"}
              </option>
              {template === "three-cards" && <option value={2}>Destra</option>}
            </Field>
          </div>

          {/* preview */}
          {/* #TODO: style me */}
          <div className="col-8 p-5 bg-dark">

            {template === "three-cards" && (
              <React.Fragment>
              <div className="row">
                <div
                    className={`col-4 offset-4 card-preview ${template} ${
                      +target_position === 1 ? "selected" : ""
                    }`}
                  >
                    <Field
                      name="cards[1]"
                      validate={required}
                      component={FieldCardSelector}
                    />
                  </div>
              </div>

              <div className="row">
                <div
                  className={`col-4 offset-2 card-preview ${template} ${
                    +target_position === 0 ? "selected" : ""
                  }`}
                >
                  <Field
                    name="cards[0]"
                    validate={required}
                    component={FieldCardSelector}
                  />
                </div>
                

                <div
                  className={`col-4 card-preview ${template} ${
                    +target_position === 2 ? "selected" : ""
                  }`}
                >
                  <Field
                    name="cards[2]"
                    validate={required}
                    component={FieldCardSelector}
                  />
                </div>
              </div>
              </React.Fragment>
            )}
            
            
            {template !== "three-cards" && (
              <div className="row">
              <div
                className={`col card-preview ${template} ${
                  +target_position === 0 ? "selected" : ""
                }`}
              >
                <Field
                  name="cards[0]"
                  validate={required}
                  component={FieldCardSelector}
                />
              </div>
              <div
                className={`col card-preview ${template} ${
                  +target_position === 1 ? "selected" : ""
                }`}
              >
                <Field
                  name="cards[1]"
                  validate={required}
                  component={FieldCardSelector}
                />
              </div>
            </div>

            )}






            
          </div>
        </div>
      </Form>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  formValues: getFormValues(ownProps.form)(state)
});

export default reduxForm({})(
  connect(
    mapStateToProps,
    { arraySwap, arrayRemove, change }
  )(StepForm)
);
