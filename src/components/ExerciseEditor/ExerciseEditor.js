import React from "react";
import { connect } from "react-redux";
import { Prompt } from "react-router-dom";
import get from "lodash/get";
import omit from "lodash/omit";
import range from "lodash/range";
import pick from "lodash/pick";
import isEqual from "lodash/isEqual";
import findIndex from "lodash/findIndex";
import StepEditor from "../StepEditor";
import ExerciseOptionsForm from "../ExerciseOptionsForm";
import ItemWithNameForm from "../ItemWithNameForm";
import {
  loadExercise,
  unloadExercise,
  getExercise,
  updateExercise
} from "../../state/exercises";
import {
  loadFormFeedbackPage,
  getFormFeedbackPages
} from "../../state/feedbackPages";
import { Modal } from "reactstrap";
import { change, isValid, getFormNames } from "redux-form";
import uuidV4 from "uuid/v4";
import move from "lodash-move";
import "./ExerciseEditor.scss";
import MaterialIcon from "material-icons-react";
import classNames from 'classnames'
//import { Button, Form, FormGroup, Label, Input, FormText } from "reactstrap";

class ExerciseEditor extends React.PureComponent {
  state = {
    target:null,
    target_id: null,
    targetPage: null,
    steps: [],
    num_repetitions: 3,
    strong_feedback_page_id: null,
    reinforcement_type: "weak",
    addingStep: false,
    editingStep: null,
    dirty: false,
    presentation_page: null,
  };

  setDirty = (value) => {
    const { setDirtyItem, hasDirtyItem } = this.props
    if(value !== hasDirtyItem){
      setDirtyItem(value)
    }
  }

  toggleAddStep = () => {
    this.setState({ addingStep: !this.state.addingStep });
  };

  toggleEditStep = editingStep => () => {
    this.setState({ editingStep: editingStep });
  };

  componentDidMount() {
    const { exerciseId, targetId } = this.props;
    console.log('Vita illegale')
    this.props.loadExercise({ targetId, id: exerciseId });
  }

  componentWillUnmount() {
    this.props.unloadExercise()
  }

  componentDidUpdate(oldProps, oldState) {
    const { exercise, change, setDirtyItem, hasDirtyItem, formFeedbackPages } = this.props;

    if (
      exercise &&
      formFeedbackPages !== oldProps.formFeedbackPages &&
      exercise.presentation_page
    ) {
      const targetId = exercise.presentation_page.cards[0].id;
      const target = exercise.presentation_page.cards[0];

      this.setState({ target:target,target_id: targetId, presentation_page: exercise.presentation_page.id });
      //we disabled enableReinitialize for the global options form, so we set the value from here
      change("excerciseOptions", "target", target);
    }
    if (exercise !== oldProps.exercise && exercise) {
      if (exercise.presentation_page) {

        this.props.loadFormFeedbackPage(exercise.presentation_page.id);
      }

      const steps = get(exercise, "pages", []);
      const num_repetitions = get(
        exercise,
        "consecutive_conclusions_required",
        3
      );
      const strong_feedback_page_id = get(exercise, "strong_feedback_page_id");
      const reinforcement_type = strong_feedback_page_id ? "strong" : "weak";

      const stepsWithTarget = steps.map(step => {
        const target_position = Math.max(findIndex(get(step, 'cards', []) || [], item => item && item.correct), 0)
        return {
          ...step,
          target_position
        }
      })

      this.setState({
        steps: stepsWithTarget,
        num_repetitions,
        strong_feedback_page_id,
        reinforcement_type
      });

      if (strong_feedback_page_id !== oldState.strong_feedback_page_id) {
        change(
          "excerciseOptions",
          "strong_feedback_page_id",
          strong_feedback_page_id
        );
        if (oldProps.exercise) {
          this.setDirty(true);
        }
      }

      if (reinforcement_type !== oldState.reinforcement_type) {
        change("excerciseOptions", "reinforcement_type", reinforcement_type);
        if (oldProps.exercise) {
          this.setDirty(true);
        }
      }

      if (num_repetitions !== oldState.num_repetitions) {
        change("excerciseOptions", "num_repetitions", num_repetitions);
        if (oldProps.exercise) {
          this.setDirty(true);
        }
      }

      // const isDirty = this.getIsDirty();
      // this.setDirty(isDirty);
    }

  }

  addStep = name => {
    const id = uuidV4();
    const { steps } = this.state || [];
    const newStep = {
      id: id,
      name: name,
      level: steps.length,
      cards: steps.length > 0 ? steps[steps.length - 1].cards : []
    };
    this.setState({ steps: steps.concat(newStep) });
    this.setDirty(true)
  };

  removeStep = stepIndex => {
    const { steps } = this.state;
    this.setState({
      steps: steps.filter((item, i) => i !== stepIndex)
    });
    this.setDirty(true)
  };

  moveStepUp = stepIndex => {
    const { steps } = this.state;
    if (stepIndex > 0) {
      this.setState({
        steps: move(steps, stepIndex, stepIndex - 1)
      });
    }
    this.setDirty(true)
  };

  moveStepDown = stepIndex => {
    const { steps } = this.state;
    if (stepIndex < steps.length - 1) {
      this.setState({
        steps: move(steps, stepIndex, stepIndex + 1)
      });
    }
    this.setDirty(true)
  };


  //please modify me, I'm ugly
  computeCardPos = (i,len, xy) => {
    if(len == 2){
      if (i == 0) {
        if (xy == 'x') return 0.05
        else return 0.1
      }
      else {
        if (xy == 'x') return 0.55
        else return 0.1
        }
      }
    else if(len == 3) {
      if (i == 0) {
        if (xy == 'x') return 0.40233
        else return 0.05555
      }
      else if(i == 1){
        if (xy == 'x') return 0.203125
        else return 0.52777
      }
      else{
        if (xy == 'x') return 0.601562
        else return 0.52777
      }
    }
    else return 0.1 * (i + 1)
  }


  getExerciseData = () => {
    const { exercise } = this.props;
    if (!exercise) {
      return null;
    }

    const {
      steps,
      num_repetitions,
      strong_feedback_page_id,
      target,
      presentation_page,
    } = this.state;

    const pages = steps.map((step, si) =>
      omit(
        {
          ...step,
            level:si,
          // target_position: undefined,
          // template: undefined,
          cards: step.cards.map((card, i) => ({
            id: get(card, 'id', card),
            correct: +step.target_position === i,
            x_pos: this.computeCardPos(i,step.cards.length,'x'),//0.1 * (i + 1),
            y_pos: this.computeCardPos(i,step.cards.length,'y'),//0.1 * (i + 1),
            scale: 1.0 / (step.cards.length - 1.0),
            next_page_id: si < steps.length - 1 ? steps[si + 1].id : ""
          }))
        },
        ["template", "target_position"]
      )
    );



    // If you have to update pages, cards or the presentation page,
    // the update create a clone of the previous exercise.
    // Thus you have to send all the informations about the exercise,
    // as if it was a CREATE

    const payload = {
      ...exercise,
      newId: uuidV4(),
      consecutive_conclusions_required: num_repetitions,
      strong_feedback_page_id: strong_feedback_page_id,
      pages: pages,
      presentation_page_id: undefined,
      // presentation_page: undefined,
      presentation_page:  {
            id: uuidV4(),
            name: "presentation page",
            cards: [
              {
                id: target.id,
                x_pos: "0.2",
                y_pos: "0.1",
                scale: "1",
              }
            ]
          }
    };

    if(payload.root_page_id) {
        delete payload.root_page_id;
    }

    return payload;
  };

  saveExercise = () => {
    const payload = this.getExerciseData();

    this.props.updateExercise({ ...payload, targetId: this.props.targetId })
    .then(resp => {
      this.props.setOpenExecercise(resp.data.id)
      this.setDirty(false)
    })
  };

  updateStep = (i, values) => {
    const { steps } = this.state;
    const updatedStep = {
      ...steps[i],
      ...values
    };
    const newSteps = steps.map((step, j) => (i === j ? updatedStep : step));
    this.setState({ steps: newSteps });
    this.setDirty(true)
  };

  getIsDirty = () => {
    const { exercise } = this.props;
    if (!exercise) {
      return false;
    }
    const editedExercise = this.getExerciseData();

    const diffProperties = [
      "consecutive_conclusions_required",
      "name",
      // 'pages',
      "presentation_page_id",
      "root_page_id",
      "strong_feedback_page_id",
      "published"
    ];
    let exerciseData = pick(exercise, diffProperties);
    // exerciseData = {
    //   ...exerciseData,
    //   pages: exerciseData.pages.map(page => ({ ...page, template: undefined}))
    // }
    let editedExerciseData = pick(editedExercise, diffProperties);
    editedExerciseData = {
      ...editedExerciseData,
      consecutive_conclusions_required: +editedExerciseData.consecutive_conclusions_required,
    }

    console.log("isDirty?", exerciseData.pages, editedExerciseData.pages);
    return !isEqual(exerciseData, editedExerciseData);
  };

  autocompleteSteps = () => {
    const { steps } = this.state;
    const baseStep = steps[0];

    const numCards = get(baseStep, 'template') === 'three-cards' ? 3 : 2;
    const targetPosition = +baseStep.target_position
    let outSteps = [baseStep]

    let swaps
    if (numCards === 3) {
      swaps = [[2, 0]]
    } else {
      swaps = [[0, 1]]
    }

    // Swap Ma cards
    swaps.forEach((s, i) => {
      const [from, to] = s

      // let newCards = move(baseStep.cards, from, to)
      let newCards = baseStep.cards.map((card, i) => {
        if (i === from) {
          return baseStep.cards[to]
        } else if (i === to) {
          return baseStep.cards[from]
        }
        return card
      })

      let newTargetPosition = targetPosition
      if (newTargetPosition === from) {
        newTargetPosition = to
      } else if (newTargetPosition === to) {
        newTargetPosition = from
      }

      const newStep = {
        id: uuidV4(),
        name: `${baseStep.name} ${i+1}`,
        level: i+1,
        cards: newCards,
        target_position: newTargetPosition,
      };
      outSteps.push(newStep);
    })

    // Back 2 original
    const newStep = {
      id: uuidV4(),
      name: `${baseStep.name} ${swaps.length}`,
      level: swaps.length,
      cards: [...baseStep.cards],
      target_position: targetPosition,
    };
    outSteps.push(newStep);

    this.setState({ steps: outSteps });
    this.setDirty(true)
  }

  render() {
    const { exercise, setDirtyItem, hasDirtyItem, isAllFormValid } = this.props;
    //console.log("editor props",this.props);
    const {
      steps,
      num_repetitions,
      strong_feedback_page_id,
      reinforcement_type,
      target,
      addingStep,
      editingStep
    } = this.state;

    let hasStepAutoComplete = false
    if(steps.length === 1){
      const cardsLength = get(steps[0], 'template') === 'three-cards' ? 3 : 2
      hasStepAutoComplete = get(steps[0], 'cards', []).length === cardsLength
    }


    return (
      exercise && (
        <React.Fragment>
          <Prompt
            when={hasDirtyItem}
            message="Ci sono delle modifiche non salvate, vuoi continuare?"
          />
          <div className="ExerciseEditor">
            <div className="bg-white border sticky-top p-2 d-flex">

              {hasStepAutoComplete && <button
                onClick={this.autocompleteSteps}
                className="btn btn-info mr-2 ml-auto btn-w-material-icons"
              >
                <MaterialIcon icon="photo_filter" color="white" />{" "}
                <span className="align-middle">Autocompleta</span>
              </button>}

              <button
                onClick={this.toggleAddStep}
                className={classNames("btn btn-info mr-2 btn-w-material-icons", {'ml-auto': !hasStepAutoComplete})}
              >
                <MaterialIcon icon="add" color="white" />{" "}
                <span className="align-middle">Aggiungi step</span>
              </button>

              <button
                onClick={this.saveExercise}
                disabled={!hasDirtyItem || !isAllFormValid}
                className="btn btn-success mr-2"
              >
                Salva
              </button>
            </div>
            <div className="bg-light p-3">
              <h5>Opzioni esercizio</h5>
              <ExerciseOptionsForm
                onChange={(values, dispatch, props, previousValues) => {
                  const fields = ['target', 'reinforcement_type', 'strong_feedback_page_id', 'num_repetitions']
                  if (! isEqual(pick(values, fields), pick(this.state, fields))) {
                    this.setDirty(true)
                  }
                  this.setState({ ...values });
                }}
                initialValues={{
                  target: target,
                  num_repetitions: num_repetitions,
                  strong_feedback_page_id: strong_feedback_page_id,
                  reinforcement_type: reinforcement_type
                }}
              />
            </div>
            {steps &&
              steps.length > 0 &&
              steps.map((step, i) => (
                <StepEditor
                  canDelete={steps.length > 1}
                  removeStep={this.removeStep}
                  toggleEdit={this.toggleEditStep(step)}
                  onStepChange={values => this.updateStep(i, values)}
                  moveStepUp={this.moveStepUp}
                  moveStepDown={this.moveStepDown}
                  totSteps={steps.length}
                  stepIndex={i}
                  step={step}
                  key={step.id}
                />
              ))}
            <Modal isOpen={addingStep}>
              <div className="modal-header">
                <h5 className="modal-title">Aggiungi step</h5>
              </div>
              <ItemWithNameForm
                onCancel={this.toggleAddStep}
                onSubmit={values => Promise.resolve(values)}
                onSubmitSuccess={data => {
                  this.addStep(data.name);
                  this.toggleAddStep();
                }}
              />
            </Modal>

            <Modal isOpen={!!editingStep}>
              <div className="modal-header">
                <h5 className="modal-title">Modifica step</h5>
              </div>
              {!!editingStep && (
                <ItemWithNameForm
                  initialValues={{
                    name: editingStep.name,
                    id: editingStep.id
                  }}
                  onCancel={this.toggleEditStep(null)}
                  onSubmit={values => Promise.resolve(values)}
                  onSubmitSuccess={data => {
                    const newSteps = steps.map(
                      step =>
                        step.id !== data.id
                          ? step
                          : { ...step, name: data.name }
                    );
                    this.setState({ steps: newSteps });
                    this.toggleEditStep(null)();
                  }}
                />
              )}
            </Modal>
          </div>
        </React.Fragment>
      )
    );
  }
}

const mapStateToProps = state => {
  let isAllFormValid = isValid('excerciseOptions')(state)

  // Check all steps form to be valid
  // The ultimate workaround...
  const stepFormNames = getFormNames()(state)
    .filter(name => name.indexOf('stepForm-') === 0)

  isAllFormValid = (
    isAllFormValid &&
    stepFormNames.every(formName => isValid(formName)(state))
  )

  return {
    isAllFormValid,
    exercise: getExercise(state),
    formFeedbackPages: getFormFeedbackPages(state),
  }
};
export default connect(
  mapStateToProps,
  { loadExercise, loadFormFeedbackPage, updateExercise, unloadExercise, change }
)(ExerciseEditor);
