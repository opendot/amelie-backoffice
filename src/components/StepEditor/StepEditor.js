import React from "react";
import "./StepEditor.scss";
import styles from "./StepEditor.scss";
import StepForm from "../StepForm";
import MaterialIcon from "material-icons-react";
import get from "lodash/get";
import findIndex from "lodash/findIndex";

export default class StepEditor extends React.PureComponent {
  render() {
    const {
      step,
      stepIndex,
      removeStep,
      totSteps,
      moveStepUp,
      moveStepDown,
      onStepChange,
      toggleEdit,
      canDelete,
    } = this.props;
    const template =
      get(step, "cards", []).length === 3 ? "three-cards" : "two-cards";
    let target_position = 0;
    if(step.target_position !== undefined){
      target_position = step.target_position;
    } else {
      target_position = Math.max(findIndex(get(step, 'cards', []) || [], item => item && item.correct), 0);
    }
    

    return (
      <div className="StepEditor p-3 border">
        <div className="row">
          <div className="col">
            <div className="d-flex align-items-center">
              <button
                onClick={toggleEdit}
                type="button"
                className="btn btn-light rounded-circle button-circle-lg mr-2 d-flex"
              >
                <MaterialIcon icon="edit" color={styles.iconColor} />
              </button>
              {canDelete && <button
                onClick={() => {
                  removeStep(stepIndex);
                }}
                type="button"
                className="btn btn-light rounded-circle button-circle-lg mr-2 d-flex"
              >
                <MaterialIcon icon="delete" color={styles.iconColor} />
              </button>}
              <span className="step-name">{step.name}</span>
            </div>
          </div>
          <div className="col col-auto ml-auto">
            <div className="d-flex align-items-center">
              <button
                onClick={() => moveStepUp(stepIndex)}
                type="button"
                disabled={stepIndex === 0 ? true : false}
                className="btn btn-light rounded-circle button-circle-lg mr-2 d-flex"
              >
                <MaterialIcon icon="arrow_upward" color={styles.iconColor} />
              </button>
              <button
                onClick={() => moveStepDown(stepIndex)}
                type="button"
                disabled={stepIndex === totSteps - 1 ? true : false}
                className="btn btn-light rounded-circle button-circle-lg mr-2 d-flex"
              >
                <MaterialIcon icon="arrow_downward" color={styles.iconColor} />
              </button>
            </div>
          </div>
        </div>
        <StepForm
          onChange={onStepChange}
          form={`stepForm-${step.id}`}
          initialValues={{
            template: template,
            target_position: target_position,
            cards: step.cards.map(card => {
              if (typeof card === 'undefined' || card === null) {
                return null
              }
              if (typeof card.id === 'string') {
                return card.id
              }
              return card
            })
          }}
        />
      </div>
    );
  }
}
