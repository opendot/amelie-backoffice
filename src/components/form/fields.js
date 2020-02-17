import React from "react";
import { connect } from "react-redux";
import {
  Input,
  FormGroup,
  Label,
  FormFeedback,
  Modal,
  ModalBody
} from "reactstrap";
import Dropzone from "react-dropzone";
import ReactPlayer from "react-player";
import get from "lodash/get";
import debounce from "lodash/debounce";
import {
  loadFormFeedbackPage,
  getFormFeedbackPages,
  loadFeedbackPages,
  unloadFeedbackPages,
  getFeedbackPages,
  getFeedbackPagesNumPages,
  getFeedbackPagesCurrentPage
} from "../../state/feedbackPages";
import {
  loadCards,
  unloadCards,
  getCards,
  loadFormCard,
  getFormCards,
  getCardsCurrentPage,
  getCardsNumPages
} from "../../state/modalCards";
import MaterialIcon from "material-icons-react";
import Paginator from "../Paginator";
import FlipMove from "react-flip-move";
import "./fields.scss";

const arrayze = a => (Array.isArray(a) ? a : [a]);

export const FieldInput = ({
  input,
  meta,
  label,
  type,
  labelProps,
  children,
  ...passProps
}) => (
  <FormGroup>
    {label && <Label>{label}</Label>}
    <Input
      type={type}
      {...input}
      {...passProps}
      invalid={!!(meta.touched && meta.error)}
    >
      {children}
    </Input>
    {meta.touched &&
      meta.error &&
      arrayze(meta.error).map((error, i) => (
        <FormFeedback key={i}>{error}</FormFeedback>
      ))}
  </FormGroup>
);

FieldInput.defaultProps = {
  type: "text"
};



export const FieldCheckbox = props => (
  <FormGroup check>
    <Label check>
      <Input
        type="checkbox"
        checked={props.input.value}
        {...props.input}
        valid={false}
      />{" "}
      {props.label}
    </Label>
    {props.meta.touched &&
      props.meta.error &&
      arrayze(props.meta.error).map((error, i) => (
        <FormFeedback key={i}>{error}</FormFeedback>
      ))}
  </FormGroup>
);

const readFile = file => {
  let reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = event => {
      file.data = event.target.result;
      resolve(file);
    };

    reader.onerror = () => {
      return reject(this);
    };

    if (/^image/.test(file.type)) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsDataURL(file);
    }
  });
};

// single image and video dropzone
export class DropzoneInput extends React.PureComponent {
  state = {
    currentFiles: []
  };

  handleChange(filesToUpload) {
    let promises = [];
    filesToUpload.forEach(file => {
      const p = readFile(file);
      promises.push(p);
    });
    Promise.all(promises).then(values => {
      const newValues = values.map(v => ({ content: v.data, name: v.name }));
      this.props.input.onChange(newValues);
    });
  }

  render() {
    const { input, fileType } = this.props;
    const currentFiles = input.value;
    const hasFile = !!get(currentFiles, "length", 0);
    const maxSize = 20000000;

    return (
      <React.Fragment>
        <Dropzone
          multiple={false}
          className="dropzone rounded"
          activeClassName="dropzone-active"
          rejectClassName="dropzone-reject"
          disabledClassName="dropzone-disabled"
          name={this.props.name}
          maxSize={maxSize}
          onDrop={(filesToUpload, e) => {
            this.handleChange(filesToUpload);
          }}
        >
          {!hasFile && (
            <div>
              <p>
                Prova a <b>trascinare</b> un file qui, o <b>clicca</b> per
                selezionare il file da caricare.
              </p>
            </div>
          )}
          {hasFile && (
            <React.Fragment>
              {fileType === "image" && (
                <img src={currentFiles[0].content} alt={currentFiles[0].name} />
              )}
              {fileType === "video" && (
                <ReactPlayer url={currentFiles[0].content} controls={true} />
              )}
            </React.Fragment>
          )}
        </Dropzone>
        {this.props.meta.touched && this.props.meta.error && (
          <span className="error">{this.props.meta.error}</span>
        )}
      </React.Fragment>
    );
  }
}

DropzoneInput.defaultProps = {
  fileType: "image"
};

class FieldFeedbackSelector_ extends React.PureComponent {
  state = {
    isOpen: false,
    search: ""
  };

  toggleOpen = () => this.setState({ isOpen: !this.state.isOpen });

  handleSearch = e => {
    const search = e.target.value;
    this.setState({
      search: search
    });
    this.loadFeedbackPagesDebounced({ page: 1, search });
  };

  loadFeedbackPagesDebounced = debounce(({ page, search }) => {
    this.props.loadFeedbackPages({ page, search, tag: "strong" });
  }, 300);

  componentDidMount() {
    const { formPages, input } = this.props;
    if (input.value && !formPages[input.value]) {
      this.props.loadFormFeedbackPage(input.value);
    }
  }

  componentDidUpdate(oldProps, oldState) {
    const { formPages, input } = this.props;
    const { isOpen } = this.state;
    if (
      input.value &&
      input.value !== oldProps.input.value &&
      !formPages[input.value]
    ) {
      this.props.loadFormFeedbackPage(input.value);
    }
    if (isOpen !== oldState.isOpen) {
      this.props.loadFeedbackPages({ tag: "strong" });
      this.setState({ search: "" });
    }
  }

  componentWillUnmount() {
    this.props.unloadFeedbackPages();
  }

  render() {
    const {
      input,
      meta,
      label,
      labelProps,
      formPages,
      pages,
      paginationNumPage,
      paginationCurrentPage,
      disabled
    } = this.props;
    const { isOpen } = this.state;
    const currentPage = formPages[input.value];

    return (
      <React.Fragment>
        <FormGroup
          style={{
            opacity: disabled ? 0.3 : undefined,
            pointerEvents: disabled ? "none" : undefined
          }}
        >
          {label && <Label {...labelProps}>{label}</Label>}

          <div
            className="card-custom text-white my-2"
            onClick={this.toggleOpen}
          >
            <div className="card-custom-container d-flex align-items-center justify-content-center">
              {currentPage && (
                <ReactPlayer
                  url={currentPage.cards[0].content.content}
                  controls={true}
                />
              )}
              {!input.value && (
                <button
                  type="button"
                  className="btn btn-light rounded-circle button-circle-lg d-flex"
                >
                  <MaterialIcon icon="edit" />
                </button>
              )}
            </div>
          </div>

          {meta.touched &&
            meta.error &&
            arrayze(meta.error).map((error, i) => (
              <FormFeedback key={i}>{error}</FormFeedback>
            ))}
        </FormGroup>

        <Modal isOpen={isOpen} toggle={this.toggleOpen} size="lg">
          <div className="modal-body picker-height py-0">
            <div className="bg-white-90 sticky-top">
              <div className="row">
                <div className="col">
                  <h3>Seleziona rinforzo</h3>
                </div>
                <div className="col-3">
                  <div className="form-group">
                    <input
                      value={this.state.search}
                      onChange={this.handleSearch}
                      className="form-control form-control-lg"
                      type="text"
                      placeholder="cerca"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="row ImageList">
              <FlipMove typeName={null}>
                {pages &&
                  !!get(pages, "length") &&
                  pages.map((feedbackPage, i) => {
                    const card = get(feedbackPage, "cards[0]");
                    return (
                      <div
                        className="col col-3"
                        key={feedbackPage.id}
                        onClick={() => {
                          this.props.input.onChange(feedbackPage.id);
                          this.toggleOpen();
                        }}
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

            {pages && pages.length > 0 && (
              <div className="bg-white-90 sticky-bottom">
                <div className="row">
                  <div className="col-12">
                    <Paginator
                      numPages={paginationNumPage}
                      currentPage={
                        paginationCurrentPage === null
                          ? null
                          : paginationCurrentPage.page
                      }
                      goToPage={this.goToPage}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

export const FieldFeedbackSelector = connect(
  state => ({
    formPages: getFormFeedbackPages(state),
    pages: getFeedbackPages(state),
    paginationNumPage: getFeedbackPagesNumPages(state),
    paginationCurrentPage: getFeedbackPagesCurrentPage(state)
  }),
  { loadFormFeedbackPage, loadFeedbackPages, unloadFeedbackPages }
)(FieldFeedbackSelector_);

class FieldCardSelector_ extends React.PureComponent {
  state = {
    isOpen: false,
    search: ""
  };

  goToPage = page => {
    this.props.loadCards({ page });
  };

  toggleOpen = () => this.setState({ isOpen: !this.state.isOpen });

  handleSearch = e => {
    const search = e.target.value;
    this.setState({
      search: search
    });
    this.loadCardsDebounced({ page: 1, search });
  };

  loadCardsDebounced = debounce(({ page, search }) => {
    this.props.loadCards({ page, search });
  }, 300);

  componentDidMount() {
    const { cards, input } = this.props;
    if (input.value && (!cards || !cards[input.value])) {
      this.props.loadFormCard(input.value);
    }
  }

  componentDidUpdate(oldProps, oldState) {
    const { formCards, input } = this.props;
    const { isOpen } = this.state;
    if (
      input.value &&
      input.value !== oldProps.input.value &&
      !formCards[input.value]
    ) {
      this.props.loadFormCard(input.value);
    }
    if (isOpen !== oldState.isOpen) {
      this.setState({ search: "" });
      this.props.loadCards();
    }
  }

  componentWillUnmount() {
    this.props.unloadCards();
  }

  render() {
    const {
      input,
      meta,
      label,
      labelProps,
      formCards,
      cards,
      numPages,
      currentPage
    } = this.props;
    const { isOpen } = this.state;
    const currentCard = formCards[input.value];
    const isText = get(currentCard, "content.type") === "Text";

    return (
      <React.Fragment>
        <FormGroup>
          {label && <Label {...labelProps}>{label}</Label>}
          <div
            className="card-custom text-white my-2"
            onClick={this.toggleOpen}
          >
            <div className="card-custom-container d-flex align-items-center justify-content-center">
              {currentCard && isText && (
                <h3 className="text-body">
                  {get(currentCard, "content.content")}
                </h3>
              )}
              {currentCard && !isText && (
                <img
                  alt={currentCard.label}
                  src={get(currentCard, "content.content_thumbnail")}
                  className="object-contain"
                />
              )}
              {!input.value && (
                <button
                  type="button"
                  className="btn btn-light rounded-circle button-circle-lg d-flex"
                >
                  <MaterialIcon icon="edit" />
                </button>
              )}
            </div>
          </div>

          {meta.touched &&
            meta.error &&
            arrayze(meta.error).map((error, i) => (
              <FormFeedback key={i}>{error}</FormFeedback>
            ))}
        </FormGroup>
        <Modal isOpen={isOpen} toggle={this.toggleOpen} size={"lg"}>
          <div className="modal-body picker-height py-0">
            <div className="bg-white-90 sticky-top">
              <div className="row">
                <div className="col">
                  <h3>Seleziona card</h3>
                </div>
                <div className="col-3">
                  <div className="form-group">
                    <input
                      value={this.state.search}
                      onChange={this.handleSearch}
                      className="form-control form-control-lg"
                      type="text"
                      placeholder="cerca"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="row ImageList">
              <FlipMove typeName={null}>
                {cards &&
                  !!get(cards, "length") &&
                  cards.map((card, i) => (
                    <div
                      className="col col-3"
                      key={card.id}
                      onClick={() => {
                        this.props.input.onChange(card.id);
                        this.toggleOpen();
                      }}
                    >
                      <div className="card-custom text-white my-2">
                        <div className="card-custom-container d-flex align-items-center justify-content-center">
                          {card.content.type === "Text" ? (
                            <h5 className="text-body">
                              {card.content.content}
                            </h5>
                          ) : (
                            <img
                              alt={card.label}
                              src={card.content.content_thumbnail}
                              className="object-contain"
                            />
                          )}
                        </div>
                        <div className="card-img-overlay-custom">
                          <h5 className="card-title">{card.label}</h5>
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
                    </div>
                  ))}
              </FlipMove>
            </div>

            {cards && cards.length > 0 && (
              <div className="bg-white-90 sticky-bottom">
                <div className="row">
                  <div className="col-12">
                    <Paginator
                      numPages={numPages}
                      currentPage={
                        currentPage === null ? null : currentPage.page
                      }
                      goToPage={this.goToPage}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

export const FieldCardSelector = connect(
  state => ({
    formCards: getFormCards(state),
    cards: getCards(state),
    numPages: getCardsNumPages(state),
    currentPage: getCardsCurrentPage(state)
  }),
  { loadFormCard, loadCards, unloadCards }
)(FieldCardSelector_);

class FieldCardObjectSelector_ extends React.PureComponent {
  state = {
    isOpen: false,
    search: ""
  };

  goToPage = page => {
    this.props.loadCards({ page });
  };

  toggleOpen = () => this.setState({ isOpen: !this.state.isOpen });

  handleSearch = e => {
    const search = e.target.value;
    this.setState({
      search: search
    });
    this.loadCardsDebounced({ page: 1, search });
  };

  loadCardsDebounced = debounce(({ page, search }) => {
    this.props.loadCards({ page, search });
  }, 300);

  componentDidMount() {
    const { cards, input } = this.props;
    console.log("my props", this.props);
    /*if (input.value && (!cards || !cards[input.value])) {
            this.props.loadFormCard(input.value);
        }*/
  }

  componentDidUpdate(oldProps, oldState) {
    console.log("my updates", this.props);
    const { formCards, input } = this.props;
    const { isOpen } = this.state;

    /*if (
            input.value &&
            input.value !== oldProps.input.value &&
            !formCards[input.value]
        ) {
            this.props.loadFormCard(input.value);
        }*/
    if (isOpen !== oldState.isOpen) {
      this.setState({ search: "" });
      this.props.loadCards();
    }
  }

  componentWillUnmount() {
    this.props.unloadCards();
  }

  render() {
    const {
      input,
      meta,
      label,
      labelProps,
      formCards,
      cards,
      numPages,
      currentPage
    } = this.props;
    const { isOpen } = this.state;
    const currentCard = this.props.input.value;
    console.log("render", currentCard);
    const isText = get(currentCard, "content.type") === "Text";

    return (
      <React.Fragment>
        <FormGroup>
          {label && <Label {...labelProps}>{label}</Label>}
          <div
            className="card-custom text-white my-2"
            onClick={this.toggleOpen}
          >
            <div className="card-custom-container d-flex align-items-center justify-content-center">
              {currentCard && isText && (
                <h5 className="text-body">
                  {get(currentCard, "content.content")}
                </h5>
              )}
              {currentCard && !isText && (
                <img
                  alt={currentCard.label}
                  src={get(currentCard, "content.content_thumbnail")}
                  className="object-contain"
                />
              )}
              {!input.value && (
                <button
                  type="button"
                  className="btn btn-light rounded-circle button-circle-lg d-flex"
                >
                  <MaterialIcon icon="edit" />
                </button>
              )}
            </div>
          </div>

          {meta.touched &&
            meta.error &&
            arrayze(meta.error).map((error, i) => (
              <FormFeedback key={i}>{error}</FormFeedback>
            ))}
        </FormGroup>
        <Modal isOpen={isOpen} toggle={this.toggleOpen} size={"lg"}>
          <div className="modal-body picker-height py-0">
            <div className="bg-white-90 sticky-top">
              <div className="row">
                <div className="col">
                  <h3>Seleziona card</h3>
                </div>
                <div className="col-3">
                  <div className="form-group">
                    <input
                      value={this.state.search}
                      onChange={this.handleSearch}
                      className="form-control form-control-lg"
                      type="text"
                      placeholder="cerca"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="row ImageList">
              <FlipMove typeName={null}>
                {cards &&
                  !!get(cards, "length") &&
                  cards.map((card, i) => (
                    <div
                      className="col col-3"
                      key={card.id}
                      onClick={() => {
                        this.props.input.onChange(card);
                        this.toggleOpen();
                      }}
                    >
                      <div className="card-custom text-white my-2">
                        <div className="card-custom-container d-flex align-items-center">
                          {card.content.type === "Text" ? (
                            <h5 className="text-body">
                              {card.content.content}
                            </h5>
                          ) : (
                            <img
                              alt={card.label}
                              src={card.content.content_thumbnail}
                              className="object-contain"
                            />
                          )}
                        </div>
                        <div className="card-img-overlay-custom">
                          <h5 className="card-title">{card.label}</h5>
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
                    </div>
                  ))}
              </FlipMove>
            </div>

            {cards && cards.length > 0 && (
              <div className="bg-white-90 sticky-bottom">
                <div className="row">
                  <div className="col-12">
                    <Paginator
                      numPages={numPages}
                      currentPage={
                        currentPage === null ? null : currentPage.page
                      }
                      goToPage={this.goToPage}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

export const FieldCardObjectSelector = connect(
  state => ({
    formCards: getFormCards(state),
    cards: getCards(state),
    numPages: getCardsNumPages(state),
    currentPage: getCardsCurrentPage(state)
  }),
  { loadFormCard, loadCards, unloadCards }
)(FieldCardObjectSelector_);
