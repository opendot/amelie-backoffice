import React from "react";
import { connect } from "react-redux";
import { Field, reduxForm, change, getFormValues } from "redux-form";
import {
  FieldInput,
  FieldFeedbackSelector,
  FieldCardSelector,
    FieldCardObjectSelector,
  required,
  maxValue,
  minValue,
} from "../form";
import { Form } from "reactstrap";
import get from "lodash/get";

const maxValue5 = maxValue(5)
const minValue1 = minValue(1)

const requiredIfStrongReinforcement = (value, allValues) => {
  if (allValues.reinforcement_type === 'weak') {
    return undefined
  }
  return value ? undefined : 'Campo Richiesto'
}

class ExerciseOptionsForm extends React.PureComponent {
  render() {
    const { onChange, change, formValues } = this.props;
    return (
      <Form>
        <div className="row">
          <div className="col-4">
            <Field
              label={<b>Target</b>}
              name="target"
              validate={required}
              component={FieldCardObjectSelector}
            />
          </div>
          <div className="col-4">
            <Field
              label={<b>Rinforzo finale</b>}
              name="reinforcement_type"
              disabled={!formValues.target}
              validate={required}
              component={FieldInput}
              type="select"
              onChange={(e, value) => {
                if (value === 'weak') {
                  change('excerciseOptions', 'strong_feedback_page_id', null)
                }
              }}
            >
              <option value={"weak"}>Rinforzo debole</option>
              <option value={"strong"}>Rinforzo forte</option>
            </Field>

            <Field
              label={<b>Rinforzo forte</b>}
              name="strong_feedback_page_id"
              validate={requiredIfStrongReinforcement}
              component={FieldFeedbackSelector}
              disabled={get(formValues, "reinforcement_type") !== "strong"}
            />

            <Field
              label={<b>Numero ripetizioni richieste</b>}
              name="num_repetitions"
              validate={[required, maxValue5, minValue1]}
              component={FieldInput}
              type="number"
            />
          </div>
        </div>
      </Form>
    );
  }
}

const mapStateToProps = state => ({
  formValues: getFormValues("excerciseOptions")(state)
});

export default reduxForm({
  form: "excerciseOptions"
  // enableReinitialize: true
})(connect(mapStateToProps, { change })(ExerciseOptionsForm));
