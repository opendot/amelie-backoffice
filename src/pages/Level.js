import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Modal } from "reactstrap";
import { withRouter } from "react-router-dom";
import { getLevelChild, loadLevel, getLevelLoading } from "../state/levels";
import {
  updateBox,
  deleteBox,
  orderBoxes,
  createBox,
  loadBoxes,
  clearDeleteBox,
  getBoxesDeleting,
  getBoxesDeletingFailures,
  getBoxesUpdatingFailures
} from "../state/boxes";
import PcList from "../components/PcList";
import ItemWithNameForm from "../components/ItemWithNameForm";
import ReactPlaceholder from "react-placeholder";
import "react-placeholder/lib/reactPlaceholder.css";
import PcListPlaceholder from "../components/PcListPlaceholder";
import MaterialIcon from "material-icons-react";

class Level extends Component {
  state = {
    createOpen: false
  };

  toggleCreate = () => this.setState({ createOpen: !this.state.createOpen });

  render() {
    const {
      level,
      updateBox,
      deleteBox,
      createBox,
      levelLoading,
      boxesUpdatingFailures,
      clearDeleteBox,
      boxDeleting,
      boxDeletingFailures
    } = this.props;
    const { createOpen } = this.state;

    return (
      <React.Fragment>
        <Container fluid className="mb-4">
          <div className="row">
            <div className="col-12">
              <ReactPlaceholder
                customPlaceholder={<PcListPlaceholder />}
                ready={!levelLoading}
                delay={150}
              >
                {level ? (
                  <PcList
                    rows={level.child}
                    childRoute="box"
                    childInfo={{
                      accessor: "targets_count",
                      label: { singular: "target", plural: "targets" }
                    }}
                    updateItem={item =>
                      updateBox({ levelId: level.id, box: item })
                    }
                    updateErrors={boxesUpdatingFailures}
                    deleteItem={id => deleteBox(id, { levelId: level.id })}
                    deleting={boxDeleting}
                    deletingFailures={boxDeletingFailures}
                    clearDeleteErrors={clearDeleteBox}
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
                  <span className="align-middle">Nuovo tema</span>
                </button>
              </div>
            </div>
          </div>
        </Container>

        <Modal isOpen={createOpen}>
          <div className="modal-header">
            <h5 className="modal-title">Crea nuovo tema</h5>
          </div>
          <ItemWithNameForm
            initialValues={{
              published: false
            }}
            onCancel={this.toggleCreate}
            onSubmit={values => createBox({ box: values, levelId: level.id })}
            onSubmitSuccess={data => {
              // closing the modal
              this.toggleCreate();
              //for now, let's reload boxes on creation success.
              this.props.loadLevel({ id: level.id });
            }}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  level: getLevelChild(state),
  levelLoading: getLevelLoading(state),
  boxesUpdatingFailures: getBoxesUpdatingFailures(state),
  boxDeleting: getBoxesDeleting(state),
  boxDeletingFailures: getBoxesDeletingFailures(state)
});

export default withRouter(
  connect(
    mapStateToProps,
    {
      updateBox,
      deleteBox,
      orderBoxes,
      createBox,
      loadBoxes,
      loadLevel,
      clearDeleteBox
    }
  )(Level)
);
