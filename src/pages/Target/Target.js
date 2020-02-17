import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Modal } from "reactstrap";
import { withRouter } from "react-router-dom";
import get from "lodash/get";
import MaterialIcon from "material-icons-react";
import PcList from "../../components/PcList";
import ExerciseEditor from "../../components/ExerciseEditor";
import ItemWithNameForm from "../../components/ItemWithNameForm";
import PublishSwitch from "../../components/PublishSwitch";
import {
  loadTarget,
  unloadTarget,
  getTarget,
  updateTarget
} from "../../state/targets";
import {
  updateExercise,
  deleteExercise,
  orderExercises,
  createExercise,
  loadExercises,
  getExercisesUpdatingFailures,
  clearDeleteExcercise,
  getExercisesDeleting,
  getExercisesDeletingFailures
} from "../../state/exercises";
import { getBox } from "../../state/boxes";
import "./Target.scss";
import { formatDate } from "../../utils";
import uuidV4 from "uuid/v4";
// import testPayload from './testPayload.json'

class Target extends Component {
  state = {
    // #TODO: SET NULL!
    // openChildId: 'exercise_teddy_bear0',
    openChildId: null,
    createOpen: false
  };

  toggleCreate = () => this.setState({ createOpen: !this.state.createOpen });

  handleChange = e => {
    const { updateTarget, target, box } = this.props;
    updateTarget({
      boxId: box.id,
      target: { id: target.id, published: !target.published }
    });
  };

  componentDidMount() {
    this.props.loadTarget({
      id: this.props.match.params.targetId,
      boxId: this.props.match.params.boxId
    });
  }

  componentWillUnmount() {
    this.props.unloadTarget();
  }

  testCreate = () => {
    const { target } = this.props;
    // this.props.createExercise({targetId: target.id, exercise: testPayload})
  };

  toggleExercise = id => {
    const { openChildId } = this.state;
    if (id === openChildId) {
      this.setState({ openChildId: null });
    } else {
      this.setState({ openChildId: id });
    }
  };

  render() {
    const {
      box,
      target,
      exercisesUpdatingFailures,
      updateExercise,
      deleteExercise,
      orderExercises,
      createExercise,
      deletingExercise,
      deletingExerciseFailures,
      clearDeleteExcercise
    } = this.props;
    const { openChildId, createOpen } = this.state;

    return (
      <React.Fragment>
        <Container fluid className="Target mb-4">
          {/* <button onClick={this.testCreate}>
            test create
          </button> */}
          {target && (
            <div className="row">
              <div className="col-2">
                <div className="bg-white sticky-top-target">
                  <h6 className="name-label">nome target</h6>
                  <h3>{target.name}</h3>
                  <div className="my-4">
                    <PublishSwitch
                      item={target}
                      onChange={this.handleChange}
                      checked={target.published}
                    />
                    <p className="my-0">
                      <small className="text-muted">
                        Ultima modifica: {formatDate(target.updated_at)}
                      </small>
                    </p>
                  </div>
                  <button
                    className="btn btn-info btn-lg btn-w-material-icons"
                    onClick={this.toggleCreate}
                  >
                    <MaterialIcon icon="add" color="white" />{" "}
                    <span className="align-middle">Aggiungi esercizio</span>
                  </button>
                </div>
              </div>
              <div className="col-10">
                {target.exercise_trees.length ? (
                  <PcList
                    rows={target.exercise_trees}
                    updateItem={item =>
                      updateExercise({ ...item, targetId: target.id })
                    }
                    openChildrenIds={openChildId ? [openChildId] : []}
                    openItem={item => this.toggleExercise(item.id)}
                    renderChild={(item, setDirtyItem, hasDirtyItem) => (
                      <ExerciseEditor
                        setOpenExecercise={this.toggleExercise}
                        targetId={target.id}
                        exerciseId={item.id}
                        setDirtyItem={setDirtyItem}
                        hasDirtyItem={hasDirtyItem}
                      />
                    )}
                    updateErrors={exercisesUpdatingFailures}
                    deleteItem={id =>
                      deleteExercise(id, { targetId: target.id })
                    }
                    reorderItems={orderExercises}
                    reorderItemsParams={{ targetId: target.id }}
                    deleting={deletingExercise}
                    deletingFailures={deletingExerciseFailures}
                    clearDeleteErrors={clearDeleteExcercise}
                  />
                ) : (
                  <h3>No exercices</h3>
                )}
              </div>
            </div>
          )}
        </Container>
        <Modal isOpen={createOpen}>
          <div className="modal-header">
            <h5 className="modal-title">Crea nuovo esercizio</h5>
          </div>
          <ItemWithNameForm
            initialValues={{
              published: false,
              position: get(target, "exercise_trees", []).length
            }}
            onCancel={this.toggleCreate}
            onSubmit={values => {
              const payload = {
                ...values,
                id: uuidV4(),
                pages: [
                  {
                    id: uuidV4(),
                    name: "Simple Custom Page",
                    level: 0,
                    cards: []
                  }
                ]
              };
              console.log("payload", payload);
              return createExercise({ exercise: payload, targetId: target.id });
            }}
            onSubmitSuccess={data => {
              // closing the modal
              this.toggleCreate();
              //for now, let's reload target on creation success..
              this.props.loadTarget({ id: target.id, boxId: box.id });
            }}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  box: getBox(state),
  target: getTarget(state),
  exercisesUpdatingFailures: getExercisesUpdatingFailures(state),
  deletingExercise: getExercisesDeleting(state),
  deletingExerciseFailures: getExercisesDeletingFailures(state)
});

export default withRouter(
  connect(
    mapStateToProps,
    {
      loadTarget,
      unloadTarget,
      updateTarget,
      updateExercise,
      deleteExercise,
      orderExercises,
      createExercise,
      loadExercises,
      clearDeleteExcercise
    }
  )(Target)
);
