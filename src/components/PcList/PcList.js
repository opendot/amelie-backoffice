import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import { Modal, ModalBody, ModalFooter } from "reactstrap";
import ItemWithNameForm from "../ItemWithNameForm";
import sortBy from "lodash/sortBy";
import move from "lodash-move";
import get from "lodash/get";
import keys from "lodash/keys";
import MaterialIcon from "material-icons-react";
import FlipMove from "react-flip-move";
import PublishSwitch from "../../components/PublishSwitch";
import styles from "./PcList.scss";
import "./PcList.scss";
import { setError } from "../../state/errors";
import { formatDate } from "../../utils";
import { SubmissionError } from "redux-form";

class PcList extends Component {
  state = {
    inlineEditItem: null,
    inlineDeleteItem: null,
    clientOrder: null,
    hasDirtyItem: false,
    closingDirtyItem: null
  };

  setDirtyItem = hasDirtyItem => this.setState({ hasDirtyItem });

  handleChange = item => e => {
    const { updateItem } = this.props;
    if (!updateItem) {
      throw new Error("updateItem prop not specified for PcList");
    }
    updateItem({ id: item.id, published: !item.published }).catch(err => {
      console.log(err);
    });
  };

  handleDelete = id => e => {
    const { deleteItem } = this.props;
    if (!deleteItem) {
      throw new Error("deleteItem prop not specified for PcList");
    }
    deleteItem(id);
  };

  saveItemName = item => {
    const { updateItem } = this.props;
    if (!updateItem) {
      throw new Error("updateItem prop not specified for PcList");
    }
    return updateItem({ id: item.id, name: item.name }).catch(err => {
      throw new SubmissionError({
        _error: get(err, "response.body.message") || "API error"
      });
    });
  };

  toggleEdit = row => () => {
    const { toggleEditClick } = this.props;
    if (toggleEditClick) {
      return toggleEditClick(row);
    }

    const { inlineEditItem } = this.state;
    const rowId = get(row, "id");
    if (rowId && rowId === get(inlineEditItem, "id")) {
      this.setState({ inlineEditItem: null });
    } else {
      this.setState({ inlineEditItem: row });
    }
  };

  toggleDelete = row => () => {
    const { inlineDeleteItem } = this.state;
    const rowId = get(row, "id");
    if (rowId && rowId === get(inlineDeleteItem, "id")) {
      this.props.clearDeleteErrors();
      this.setState({ inlineDeleteItem: null });
    } else {
      if (!row) {
        this.props.clearDeleteErrors();
      }
      this.setState({ inlineDeleteItem: row });
    }
  };

  componentDidMount() {
    if (this.props.rows) {
      const clientOrder = this.props.rows.map(row => row.id);
      this.setState({ clientOrder });
    }
  }

  componentDidUpdate(oldProps) {
    const { inlineEditItem } = this.state;
    if (this.props.rows && oldProps.rows !== this.props.rows) {
      const clientOrder = this.props.rows.map(row => row.id);
      this.setState({ clientOrder });
    }
    if (
      // Open delete modal
      this.state.inlineDeleteItem &&
      // Change the state about deleting about modal delete item
      this.props.deleting[this.state.inlineDeleteItem.id] !==
        oldProps.deleting[this.state.inlineDeleteItem.id] &&
      // Modal in item finish loading
      !this.props.deleting[this.state.inlineDeleteItem.id] &&
      // ... And not error appends
      !this.props.deletingFailures[this.state.inlineDeleteItem.id]
    ) {
      // Close delete modal
      this.toggleDelete()();
    }
    // setting global errors if updates fail
    if (
      this.props.updateErrors &&
      this.props.updateErrors !== oldProps.updateErrors
    ) {
      const oldErrors = keys(oldProps.updateErrors);
      const newErrors = keys(this.props.updateErrors);
      const errorsToShow = newErrors.filter(x => oldErrors.indexOf(x) === -1);
      errorsToShow.forEach(error => {
        const errorId = isNaN(+error) ? error : +error;
        if (errorId !== get(inlineEditItem, "id")) {
          this.props.setError(this.props.updateErrors[error].message);
        }
      });
    }
  }

  componentWillUnmount() {
    this.props.clearDeleteErrors();
  }

  moveDown = id => {
    let { clientOrder } = this.state;
    const { reorderItems, reorderItemsParams } = this.props;

    const currentIndex = clientOrder.indexOf(id);
    if (currentIndex < clientOrder.length - 1) {
      clientOrder = move(clientOrder, currentIndex, currentIndex + 1);
      this.setState({ clientOrder });
      reorderItems({ order: clientOrder, ...reorderItemsParams });
    }
  };

  moveUp = id => {
    let { clientOrder } = this.state;
    const { reorderItems, reorderItemsParams } = this.props;

    const currentIndex = clientOrder.indexOf(id);
    if (currentIndex > 0) {
      clientOrder = move(clientOrder, currentIndex, currentIndex - 1);
      this.setState({ clientOrder });
      reorderItems({ order: clientOrder, ...reorderItemsParams });
    }
  };

  isRowOpen = id => {
    const { openChildrenIds } = this.props;
    return (openChildrenIds || []).indexOf(id) !== -1;
  };

  performOpenItem = row => {
    const { openItem } = this.props;
    const { hasDirtyItem } = this.state;
    if (hasDirtyItem) {
      this.setState({ closingDirtyItem: row });
    } else {
      return openItem(row);
    }
  };

  render() {
    const {
      rows,
      location,
      childRoute,
      childInfo,
      renderChild,
      openItem,
      reorderItems,
      deleting,
      deletingFailures
    } = this.props;
    const {
      inlineEditItem,
      inlineDeleteItem,
      clientOrder,
      closingDirtyItem,
      hasDirtyItem
    } = this.state;

    const deleteLoading = inlineDeleteItem
      ? !!deleting[inlineDeleteItem.id]
      : false;
    const deleteError = inlineDeleteItem
      ? deletingFailures[inlineDeleteItem.id]
      : null;

    const orderedRows = clientOrder
      ? sortBy(rows, x => clientOrder.indexOf(x.id))
      : rows;

    return (
      <React.Fragment>
        <div className="PcList">
          <div className="table-row header">
            <div className="column actions" />
            <div className="column title">Nome</div>
            <div className="column status">Stato</div>
            <div className="column info">Info</div>
            <div className="column actions">
              {reorderItems ? "Posizione" : ""}
            </div>
            <div className="column open" />
          </div>
          <FlipMove typeName={null} enterAnimation="none" leaveAnimation="none">
            {orderedRows.length === 0 && (
              <div className="table-row no-results" />
            )}
            {orderedRows.map((row, i) => (
              <div key={row.id}>
                <div className="table-row sticky-top">
                  <div className="column actions">
                    <button
                      type="button"
                      onClick={this.toggleEdit(row)}
                      className="btn btn-light rounded-circle button-circle-lg mr-2 d-flex"
                    >
                      <MaterialIcon icon="edit" color={styles.iconColor} />
                    </button>
                    <button
                      type="button"
                      onClick={this.toggleDelete(row)}
                      className="btn btn-light rounded-circle button-circle-lg mr-2 d-flex"
                    >
                      <MaterialIcon icon="delete" color={styles.iconColor} />
                    </button>
                  </div>

                  <div className="column title">{row.name}</div>

                  <div className="column status">
                    <div>
                      <PublishSwitch
                        item={row}
                        onChange={this.handleChange(row)}
                        checked={row.published}
                      />
                      <p className="my-0">
                        <small className="text-muted">
                          Ultima modifica: {formatDate(row.updated_at)}
                        </small>
                      </p>
                    </div>
                  </div>

                  <div className="column info">
                    {childInfo &&
                      `${row[childInfo.accessor]} ${
                        row[childInfo.accessor] > 1
                          ? childInfo.label.plural
                          : childInfo.label.singular
                      }`}
                  </div>

                  <div className="column actions">
                    {reorderItems && (
                      <React.Fragment>
                        <button
                          type="button"
                          onClick={() => this.moveUp(row.id)}
                          className="btn btn-light rounded-circle button-circle-lg mr-2 d-flex"
                          disabled={i === 0 ? true : false}
                        >
                          <MaterialIcon
                            icon="arrow_upward"
                            color={styles.iconColor}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => this.moveDown(row.id)}
                          className="btn btn-light rounded-circle button-circle-lg mr-2 d-flex"
                          disabled={i === orderedRows.length - 1 ? true : false}
                        >
                          <MaterialIcon
                            icon="arrow_downward"
                            color={styles.iconColor}
                          />
                        </button>
                      </React.Fragment>
                    )}
                  </div>

                  {childRoute && (
                    <div className="column open">
                      <button
                        type="button"
                        className="btn btn-link rounded-circle button-circle-lg mr-2 d-flex"
                      />
                      <Link
                        className="btn btn-link"
                        role="button"
                        to={{
                          pathname: `${location.pathname}/${childRoute}/${
                            row.id
                          }`,
                          state: { transition: "slide-left" }
                        }}
                      >
                        <MaterialIcon
                          icon="keyboard_arrow_right"
                          color={styles.iconColor}
                        />
                      </Link>
                    </div>
                  )}

                  {openItem && (
                    <div className="column open">
                      <button
                        onClick={() => this.performOpenItem(row)}
                        type="button"
                        className="btn btn-link rounded-circle button-circle-lg mr-2 d-flex"
                      >
                        {this.isRowOpen(row.id) ? (
                          <MaterialIcon
                            icon="remove"
                            color={styles.iconColor}
                          />
                        ) : (
                          <MaterialIcon icon="add" color={styles.iconColor} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
                {renderChild &&
                  this.isRowOpen(row.id) && (
                    <React.Fragment>
                      {renderChild(row, this.setDirtyItem, hasDirtyItem)}
                    </React.Fragment>
                  )}
              </div>
            ))}
          </FlipMove>
        </div>

        <Modal isOpen={!!inlineEditItem} toggle={this.toggleEdit()}>
          <div className="modal-header">
            <h5 className="modal-title">Modifica nome</h5>
          </div>
          {inlineEditItem && (
            <ItemWithNameForm
              initialValues={inlineEditItem}
              onCancel={this.toggleEdit()}
              onSubmit={values => this.saveItemName(values)}
              onSubmitSuccess={this.toggleEdit()}
              onSubmitFail={x => {
                console.log("onSubmitFailure", x);
              }}
            />
          )}
        </Modal>

        <Modal isOpen={!!inlineDeleteItem} toggle={this.toggleEdit()}>
          {!!inlineDeleteItem && (
            <React.Fragment>
              <ModalBody>
                Confermi l'eliminazione di{" "}
                <span className="font-weight-bold font-italic">
                  {inlineDeleteItem.name}
                </span>?
                <div>
                  {deleteError && (
                    <div className="alert alert-danger mt-2">
                      {get(deleteError, "response.body.message") || "API error"}
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <button
                  className="btn btn-secondary"
                  onClick={this.toggleDelete()}
                >
                  Annulla
                </button>
                <button
                  disabled={deleteLoading}
                  className="btn btn-danger"
                  onClick={this.handleDelete(inlineDeleteItem.id)}
                >
                  Elimina
                </button>
              </ModalFooter>
            </React.Fragment>
          )}
        </Modal>

        <Modal isOpen={!!closingDirtyItem}>
          <ModalBody>Ci sono modifiche...</ModalBody>
          <ModalFooter>
            <button
              className="btn btn-secondary"
              onClick={() => {
                this.setState({ hasDirtyItem: false, closingDirtyItem: null });
              }}
            >
              Annulla
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                this.props.openItem(closingDirtyItem);
                this.setState({ hasDirtyItem: false, closingDirtyItem: null });
              }}
            >
              Continua
            </button>
          </ModalFooter>
        </Modal>
      </React.Fragment>
    );
  }
}

PcList.defaultProps = {
  reorderItemsParams: {},
  openChildrenIds: [],
  openChildComponent: null
};

export default withRouter(
  connect(
    undefined,
    { setError }
  )(PcList)
);
