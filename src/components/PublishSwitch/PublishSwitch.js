import React from "react";

export default class PublishSwitch extends React.PureComponent {
  state = {
    internalChecked: true
  };

  handleChange = () => {
    this.setState({ internalChecked: !this.state.internalChecked });
    this.props.onChange();
  };

  componentDidMount() {
    this.setState({ internalChecked: !!this.props.checked });
  }

  render() {
    const { item } = this.props;
    const { internalChecked } = this.state;

    return (
      <span className="switch switch-sm">
        <input
          type="checkbox"
          checked={internalChecked}
          onChange={this.handleChange}
          className="switch"
          id={`pc-list-switch-${item.id}`}
        />
        <label htmlFor={`pc-list-switch-${item.id}`}>Pubblicato</label>
      </span>
    );
  }
}
