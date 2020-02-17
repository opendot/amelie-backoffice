import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import qs from "query-string";
import {
  loadCards,
  unloadCards,
  createCard,
  updateCard,
  deleteCard,
  getCards,
  getCardsLoading,
  getCardsNumPages
} from "../../state/cards";
import { Modal } from "reactstrap";
import ImageForm from "../../components/ImageForm";
import MaterialIcon from "material-icons-react";
// import payload from './payload.json'
import uuidV4 from "uuid/v4";
import get from "lodash/get";
import debounce from "lodash/debounce";
import Paginator from "../../components/Paginator";
import FlipMove from "react-flip-move";
import "./ImageList.scss";

const generateCardImage = values => {
  return {
    id: uuidV4(),
    label: values.label,
    level: 3,
    card_tags: values.tags
      ? values.tags.split(",").map(x => x.trim())
      : undefined,
    content: {
      type: "GenericImage",
      content: values.images[0].content
    }
  };
};
const generateCardText = values => {
  return {
    id: uuidV4(),
    label: values.label,
    level: 3,
    card_tags: values.tags
      ? values.tags.split(",").map(x => x.trim())
      : undefined,
    content: {
      type: "Text",
      content: values.text
    }
  };
};

class ImagesList extends React.PureComponent {
  state = {
    addImageOpen: false,
    editCard: null,
    cardContent: null,
    deleteCard: null
  };

  toggleAddImageOpen = cardContent => () => {
    this.setState({
      addImageOpen: !this.state.addImageOpen,
      cardContent: cardContent
    });
  };

  toggleEditCard = (card, cardContent) => () => {
    const id = get(card, "id");
    const { editCard } = this.state;
    const currentEditCardId = get(editCard, "id");
    if (!id) {
      this.setState({ editCard: null });
    } else {
      this.setState({
        editCard: id !== currentEditCardId ? card : id,
        cardContent: cardContent
      });
    }
  };

  toggleDeleteCard = card => () => {
    const id = get(card, "id");
    const { deleteCard } = this.state;
    const currentDeleteCardId = get(deleteCard, "id");
    if (!id) {
      this.setState({ deleteCard: null });
    } else {
      this.setState({
        deleteCard: id !== currentDeleteCardId ? card : id
      });
    }
  };

  componentDidMount() {
    const { location } = this.props;
    const queryParams = qs.parse(location.search);
    const page = +get(queryParams, "page", 1);
    const search = get(queryParams, "search", "");
    this.props.loadCards({
      page,
      search
    });
  }

  componentWillUnmount() {
    this.props.unloadCards();
  }

  goToPage = page => {
    const { location, history } = this.props;
    const queryParams = qs.parse(location.search);
    const url = `${location.pathname}?${qs.stringify({
      ...queryParams,
      page
    })}`;
    const search = get(queryParams, "search");
    history.push(url, {
      preventAnimation: true
    });
    this.props.loadCards({ page, search });
  };

  handleSearch = e => {
    const { location, history } = this.props;
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
    this.loadCardsDebounced({ page: 1, search });
  };

  loadCardsDebounced = debounce(({ page, search }) => {
    this.props.loadCards({ page, search });
  }, 300);

  render() {
    const { addImageOpen, editCard, cardContent } = this.state;
    const {
      createCard,
      cards,
      cardsLoading,
      updateCard,
      numPages,
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
                className="btn btn-info btn-lg btn-w-material-icons mr-2"
                onClick={this.toggleAddImageOpen("GenericImage")}
              >
                <MaterialIcon icon="add_photo_alternate" color="white" />{" "}
                <span className="align-middle">Aggiungi immagine</span>
              </button>
              <button
                className="btn btn-info btn-lg btn-w-material-icons"
                onClick={this.toggleAddImageOpen("Text")}
              >
                <MaterialIcon icon="short_text" color="white" />{" "}
                <span className="align-middle">Aggiungi testo</span>
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
        <div className="row ImageList">
          <FlipMove typeName={null}>
            {cards &&
              !!get(cards, "length") &&
              cards.map((card, i) => (
                <div
                  className="col col-2"
                  key={card.id}
                  onClick={this.toggleEditCard(card, card.content.type)}
                >
                  <div className="card-custom text-white my-2">
                    <div className="card-custom-container d-flex align-items-center justify-content-center">
                      {card.content.type === "Text" ? (
                        <h5 className="text-body">{card.content.content}</h5>
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
          {cards && cards.length === 0 && !cardsLoading && (
            <div className="col-12">no results</div>
          )}
        </div>
        {cards && cards.length > 0 && (
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
          isOpen={!!addImageOpen}
          size="lg"
          toggle={this.toggleAddImageOpen()}
        >
          <div className="modal-header">
            <h5 className="modal-title">Aggiungi card</h5>
          </div>
          <ImageForm
            onCancel={this.toggleAddImageOpen()}
            onSubmit={values => {
              const card = values.text
                ? generateCardText(values)
                : generateCardImage(values);
              return createCard({ card });
            }}
            onSubmitSuccess={data => {
              this.toggleAddImageOpen()(null);
              const { location } = this.props;
              const queryParams = qs.parse(location.search);
              const page = +get(queryParams, "page", 1);
              const search = get(queryParams, "search", "");
              this.props.loadCards({
                page,
                search
              });
            }}
            cardContent={cardContent}
          />
        </Modal>

        {/* edit interface */}
        <Modal isOpen={!!editCard} size="lg" toggle={this.toggleEditCard()}>
          <div className="modal-header">
            <h5 className="modal-title">Dettaglio immagine</h5>
          </div>
          {!!editCard && (
            <ImageForm
              initialValues={{
                ...editCard,
                text: editCard.content.content,
                images: [
                  {
                    content: editCard.content.content,
                    name: editCard.label
                  }
                ],
                tags: get(editCard, "card_tags", [])
                  .map(x => get(x, "tag"))
                  .filter(x => !!x)
                  .join(",")
              }}
              onCancel={this.toggleEditCard()}
              onSubmit={values => {
                let content;
                console.log("xxx", values);
                if (cardContent === "Text") {
                  content = {
                    type: "Text",
                    content: values.text
                  };
                } else if (cardContent === "GenericImage") {
                  const imageContent = get(values, "images[0].content", "");
                  const hasNewImage = imageContent.indexOf("data") === 0;
                  content = hasNewImage
                    ? {
                        type: "GenericImage",
                        content: values.images[0].content
                      }
                    : undefined;
                }
                const card = {
                  id: editCard.id,
                  label: values.label,
                  card_tags: values.tags.split(",").map(x => x.trim()),
                  content
                };
                return updateCard(card);
              }}
              onSubmitSuccess={data => {
                this.toggleEditCard()();
                const { location } = this.props;
                const queryParams = qs.parse(location.search);
                const page = +get(queryParams, "page", 1);
                const search = get(queryParams, "search", "");
                this.props.loadCards({
                  page,
                  search
                });
              }}
              onDelete={() =>
                this.props.deleteCard(editCard.id).then(this.toggleEditCard())
              }
              cardContent={cardContent}
            />
          )}
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  cards: getCards(state),
  cardLoading: getCardsLoading(state),
  numPages: getCardsNumPages(state)
});

export default withRouter(
  connect(
    mapStateToProps,
    { loadCards, unloadCards, createCard, updateCard, deleteCard }
  )(ImagesList)
);
