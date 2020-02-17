import React from "react";
import { connect } from "react-redux";
import { Container, Modal } from "reactstrap";
import get from "lodash/get";
import {
  loadLevels,
  unloadLevels,
  getLevels,
  getLevelsLoading,
  getLevelsUpdatingFailures,
  updateLevel,
  deleteLevel,
  orderLevels,
  createLevel,
  getLevelsDeleting,
  clearDeleteLevels,
  getLevelsDeletingFailures
} from "../state/levels";
import PcList from "../components/PcList";
import ItemWithNameForm from "../components/ItemWithNameForm";
import MaterialIcon from "material-icons-react";
import ReactPlaceholder from "react-placeholder";
import "react-placeholder/lib/reactPlaceholder.css";
import PcListPlaceholder from "../components/PcListPlaceholder";

class PotenziamentoCognitivo extends React.PureComponent {
  state = {
    createOpen: false
  };

  toggleCreate = () => this.setState({ createOpen: !this.state.createOpen });

  componentDidMount() {
    this.props.loadLevels();
  }

  render() {
    const {
      levels,
      levelsLoading,
      updateLevel,
      deleteLevel,
      orderLevels,
      levelsUpdatingFailures,
      levelsDeleting,
      levelsDeletingFailures,
      clearDeleteLevels
    } = this.props;
    const { createOpen } = this.state;

    // the create api needs a 'value' params, that should be the order of the new element
    // we infer it from the lenght of the current levels
    // #TODO: understand if this is true and find a better way to this
    const createLevelValue = get(levels, "length", 0) + 1;

    return (
      <React.Fragment>
        <Container fluid className="mb-4">
          <div className="row">
            <div className="col-12">
              <ReactPlaceholder
                customPlaceholder={<PcListPlaceholder />}
                ready={!levelsLoading}
                delay={150}
              >
                {levels ? (
                  <PcList
                    rows={levels}
                    childRoute="level"
                    childInfo={{
                      accessor: "boxes_count",
                      label: { singular: "tema", plural: "temi" }
                    }}
                    updateItem={updateLevel}
                    updateErrors={levelsUpdatingFailures}
                    deleteItem={deleteLevel}
                    reorderItems={orderLevels}
                    deleting={levelsDeleting}
                    deletingFailures={levelsDeletingFailures}
                    clearDeleteErrors={clearDeleteLevels}
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
                  <span className="align-middle">Nuovo livello</span>
                </button>
              </div>
            </div>
          </div>
        </Container>
        <Modal isOpen={createOpen}>
          <div className="modal-header">
            <h5 className="modal-title">Crea nuovo livello</h5>
          </div>
          <ItemWithNameForm
            initialValues={{
              published: false,
              value: createLevelValue
            }}
            onCancel={this.toggleCreate}
            onSubmit={values => this.props.createLevel({ level: values })}
            onSubmitSuccess={data => {
              // closing the modal
              this.toggleCreate();
              //for now, let's reload levels on creation success.
              this.props.loadLevels();
            }}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  levels: getLevels(state),
  levelsLoading: getLevelsLoading(state),
  levelsUpdatingFailures: getLevelsUpdatingFailures(state),
  levelsDeleting: getLevelsDeleting(state),
  levelsDeletingFailures: getLevelsDeletingFailures(state)
});

export default connect(
  mapStateToProps,
  {
    loadLevels,
    unloadLevels,
    updateLevel,
    deleteLevel,
    orderLevels,
    createLevel,
    clearDeleteLevels
  }
)(PotenziamentoCognitivo);
