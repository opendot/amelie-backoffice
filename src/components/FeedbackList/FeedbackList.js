import React from "react";
import { withRouter } from "react-router-dom";
import qs from "query-string";
import { connect } from "react-redux";
import {
  loadFeedbackPages,
  unloadFeedbackPages,
  createFeedbackPage,
  updateFeedbackPage,
  getFeedbackPages,
  getFeedbackPagesLoading,
  getFeedbackPagesCurrentPage,
  getFeedbackPagesNumPages,
  deleteFeedbackPage,
} from "../../state/feedbackPages";
import { createCard } from "../../state/cards";
import { Modal } from "reactstrap";
import FeedbackForm from "../../components/FeedbackForm";
import MaterialIcon from "material-icons-react";
// import payload from './payload.json'
import uuidV4 from "uuid/v4";
import get from "lodash/get";
import debounce from "lodash/debounce";
import Paginator from "../Paginator";
import FlipMove from "react-flip-move";

const generateCardVideo = values => {
  return {
    id: uuidV4(),
    label: values.label,
    level: 3,
    content: {
      type: "Video",
      content: values.video[0].content
    }
  };
};

class FeedbackList extends React.PureComponent {
  state = {
    addFeedbackOpen: false,
    editFeedback: null,
    search: ""
  };

  toggleAddFeedbackOpen = () =>
    this.setState({ addFeedbackOpen: !this.state.addFeedbackOpen });

  toggleEditFeedback = feedback => () => {
    const id = get(feedback, "id");
    const { editFeedback } = this.state;
    const currentEditFeedbackId = get(editFeedback, "id");
    if (!id) {
      this.setState({ editFeedback: null });
    } else {
      this.setState({
        editFeedback: id !== currentEditFeedbackId ? feedback : id
      });
    }
  };

  componentDidMount() {
    const { location, tag } = this.props;
    const queryParams = qs.parse(location.search);
    const page = +get(queryParams, "page", 1);
    const search = get(queryParams, "search", "");
    this.props.loadFeedbackPages({ tag, page, search });
  }

  componentWillUnmount() {
    this.props.unloadFeedbackPages();
  }

  goToPage = page => {
    const { location, history, tag } = this.props;
    const queryParams = qs.parse(location.search);
    const url = `${location.pathname}?${qs.stringify({
      ...queryParams,
      page
    })}`;
    const search = get(queryParams, "search");
    history.push(url, {
      preventAnimation: true
    });
    this.props.loadFeedbackPages({ tag, search, page });
  };

  handleSearch = e => {
    const { location, tag, history } = this.props;
    const queryParams = qs.parse(location.search);
    const search = e.target.value;
    const url = `${location.pathname}?${qs.stringify({
      ...queryParams,
      page: 1,
      search
    })}`;
    history.push(url, {
      preventAnimation: true
    });
    this.loadFeedbackPagesDebounced({ page: 1, search, tag });
  };

  loadFeedbackPagesDebounced = debounce(({ page, search, tag }) => {
    this.props.loadFeedbackPages({ page, search, tag });
  }, 300);

  render() {
    const { addFeedbackOpen, editFeedback } = this.state;
    const {
      createFeedbackPage,
      updateFeedbackPage,
      feedbackPages,
      feedbackPagesLoading,
      numPages,
      createCard,
      location
    } = this.props;
    const queryParams = qs.parse(location.search);
    const currentPage = +get(queryParams, "page", 1);
    const search = get(queryParams, "search", "");

    return (
      <React.Fragment>
        <div className="bg-white-90 sticky-image-list">
          <div className="row">
            <div className="col-6">
              <button
                className="btn btn-info btn-lg btn-w-material-icons"
                onClick={this.toggleAddFeedbackOpen}
              >
                <MaterialIcon icon="video_library" color="white" />{" "}
                <span className="align-middle">Aggiungi Rinforzo</span>
              </button>
            </div>
            <div className="col" />
            <div className="col-3">
              <div className="form-group">
                <input
                  value={search}
                  onChange={this.handleSearch}
                  className="form-control form-control-lg"
                  type="text"
                  placeholder="cerca"
                />
              </div>
            </div>
          </div>
        </div>

        {/* actual feedback list */}
        <div className="row ImageList">
          <FlipMove typeName={null}>
            {feedbackPages &&
              !!get(feedbackPages, "length") &&
              feedbackPages.map((feedbackPage, i) => {
                const card = get(feedbackPage, "cards[0]");
                return (
                  <div
                    className="col col-2"
                    key={feedbackPage.id}
                    onClick={this.toggleEditFeedback(feedbackPage)}
                  >
                    {card && (
                      <div className="card-custom text-white my-2">
                        <div className="card-custom-container d-flex align-items-center">
                          <img
                            alt={card.label || feedbackPage.name}
                            src={card.content.content_thumbnail}
                            className="object-contain"
                          />
                        </div>
                        <div className="card-img-overlay-custom">
                          <h5 className="card-title">
                            {card.label || feedbackPage.name}
                          </h5>
                          <p className="card-text">
                            {card.card_tags.map(tag => (
                              <span
                                key={tag.id}
                                className="badge badge-pill badge-light mr-2 rounded"
                              >
                                {tag.tag}
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </FlipMove>
        </div>
        {feedbackPages &&
          feedbackPages.length === 0 &&
          !feedbackPagesLoading && <div className="col-12">no results</div>}

        {feedbackPages &&
          feedbackPages.length > 0 && (
            <div className="bg-white-90 sticky-bottom">
              <div className="row">
                <div className="col-12">
                  <Paginator
                    numPages={numPages}
                    currentPage={currentPage}
                    goToPage={this.goToPage}
                  />
                </div>
              </div>
            </div>
          )}

        {/* add interface */}
        <Modal
          isOpen={!!addFeedbackOpen}
          size="lg"
          toggle={this.toggleAddFeedbackOpen}
        >
          <div className="modal-header">
            <h5 className="modal-title">Aggiungi rinforzo</h5>
          </div>
          <FeedbackForm
            onCancel={this.toggleAddFeedbackOpen}
            onSubmit={values => {
              const card = generateCardVideo(values);
              const feedbackPage = {
                id: uuidV4(),
                name: values.label,
                tags: [this.props.tag],
                cards: [
                  {
                    id: card.id,
                    x_pos: "0.1",
                    y_pos: "0.1",
                    scale: "1"
                  }
                ]
              };
              return createCard({ card }).then(card =>
                createFeedbackPage({ feedbackPage })
              );
            }}
            onSubmitSuccess={data => {
              this.toggleAddFeedbackOpen();
              this.props.loadFeedbackPages({
                tag: this.props.tag,
                page: get(currentPage, "page")
              });
            }}
          />
        </Modal>

        {/* edit interface #todo FIXME ON SAVE!*/}
        <Modal
          isOpen={!!editFeedback}
          size="lg"
          toggle={this.toggleEditFeedback()}
        >
          <div className="modal-header">
            <h5 className="modal-title">Dettaglio rinforzo</h5>
          </div>
          {!!editFeedback && (
            <FeedbackForm
              initialValues={{
                ...editFeedback,
                label: editFeedback.cards[0].label || editFeedback.name,
                video: [
                  {
                    content: editFeedback.cards[0].content.content,
                    name: editFeedback.name
                  }
                ],
                tags: get(editFeedback.cards[0], "card_tags", [])
                  .map(x => get(x, "tag"))
                  .filter(x => !!x)
                  .join(",")
              }}
              onCancel={this.toggleEditFeedback()}
              onSubmit={
                (values) => {
                  const videoContent = get(values, 'video[0].content', '')
                  const hasNewVideo =  videoContent.indexOf('data') === 0

                  if(hasNewVideo){
                    const card = generateCardVideo(values);
                    const feedbackPage = {
                      id: values.id,
                      name: values.name,
                      tags: values.tag,
                      cards: [
                        {
                          id: card.id,
                          x_pos: "0.1",
                          y_pos: "0.1",
                          scale: "1"
                        }
                      ]
                    };
                    return createCard({ card }).then(card =>
                      updateFeedbackPage(feedbackPage)
                    );
                  } else {
                    const feedbackPage = {
                      ...editFeedback,
                      name: values.name,
                      tags: values.tag,
                    };
                    return updateFeedbackPage(feedbackPage)
                  }


                }
              }
              onSubmitSuccess={
                data => {
                  this.toggleEditFeedback()()
                  this.props.loadFeedbackPages({
                    tag: this.props.tag,
                    page: get(currentPage, "page")
                  });
                }
              }
              onDelete={() =>
                this.props.deleteFeedbackPage(editFeedback.id).then(this.toggleEditFeedback())
              }
            />
          )}
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  feedbackPages: getFeedbackPages(state),
  feedbackPagesLoading: getFeedbackPagesLoading(state),
  numPages: getFeedbackPagesNumPages(state),
  currentPage: getFeedbackPagesCurrentPage(state)
});

export default withRouter(
  connect(
    mapStateToProps,
    {
      loadFeedbackPages, createFeedbackPage, updateFeedbackPage,
      createCard, unloadFeedbackPages, deleteFeedbackPage,
    }
  )(FeedbackList)
);
