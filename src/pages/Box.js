import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Modal } from "reactstrap";
import { withRouter } from "react-router-dom";
import { getBoxChild, loadBox, getBoxLoading } from "../state/boxes";
import {
  updateTarget,
  deleteTarget,
  orderTargets,
  createTarget,
  clearDeleteTarget,
  getTargetsUpdatingFailures,
  getTargetsDeleting,
  getTargetsDeletingFailures
} from "../state/targets";
import PcList from "../components/PcList";
import ItemWithNameForm from "../components/ItemWithNameForm";
import ReactPlaceholder from "react-placeholder";
import "react-placeholder/lib/reactPlaceholder.css";
import PcListPlaceholder from "../components/PcListPlaceholder";
import MaterialIcon from "material-icons-react";

class Box extends Component {
  state = {
    createOpen: false
  };

  toggleCreate = () => this.setState({ createOpen: !this.state.createOpen });

  render() {
    const {
      box,
      boxLoading,
      updateTarget,
      deleteTarget,
      orderTargets,
      createTarget,
      targetsUpdatingFailures,
      clearDeleteTarget,
      targetDeleting,
      targetDeletingFailures
    } = this.props;
    const { createOpen } = this.state;

    return (
      <React.Fragment>
        <Container fluid className="mb-4">
          <div className="row">
            <div className="col-12">
              <ReactPlaceholder
                customPlaceholder={<PcListPlaceholder />}
                ready={!boxLoading}
                delay={150}
              >
                {box ? (
                  <PcList
                    rows={box.child}
                    childRoute="target"
                    childInfo={{
                      accessor: "exercise_trees_count",
                      label: { singular: "esercizio", plural: "esercizi" }
                    }}
                    updateItem={item =>
                      updateTarget({ boxId: box.id, target: item })
                    }
                    updateErrors={targetsUpdatingFailures}
                    deleteItem={id => deleteTarget(id, { boxId: box.id })}
                    reorderItems={orderTargets}
                    reorderItemsParams={{ boxId: box.id }}
                    deleting={targetDeleting}
                    deletingFailures={targetDeletingFailures}
                    clearDeleteErrors={clearDeleteTarget}
                  />
                ) : (
                  <span />
                )}
              </ReactPlaceholder>
            </div>
          </div>
          <div className="sticky-bottom bg-white-90">
            <div className="row">
              <div className="col-12">
                <button
                  className="btn btn-info btn-lg btn-w-material-icons"
                  onClick={this.toggleCreate}
                >
                  <MaterialIcon icon="add" color="white" />{" "}
                  <span className="align-middle">Nuovo target</span>
                </button>
              </div>
            </div>
          </div>
        </Container>

        <Modal isOpen={createOpen}>
          <div className="modal-header">
            <h5 className="modal-title">Crea un nuovo target</h5>
          </div>
          <ItemWithNameForm
            initialValues={{
              published: false,
              position: 1
            }}
            onCancel={this.toggleCreate}
            onSubmit={values => createTarget({ target: values, boxId: box.id })}
            onSubmitSuccess={data => {
              // closing the modal
              this.toggleCreate();
              //for now, let's reload boxes on creation success.
              this.props.loadBox({ id: box.id, levelId: box.level_id });
            }}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  box: getBoxChild(state),
  boxLoading: getBoxLoading(state),
  targetsUpdatingFailures: getTargetsUpdatingFailures(state),
  targetDeleting: getTargetsDeleting(state),
  targetDeletingFailures: getTargetsDeletingFailures(state)
});

export default withRouter(
  connect(
    mapStateToProps,
    {
      updateTarget,
      deleteTarget,
      orderTargets,
      createTarget,
      loadBox,
      clearDeleteTarget
    }
  )(Box)
);
