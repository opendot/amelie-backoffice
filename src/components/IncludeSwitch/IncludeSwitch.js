import React from "react";

export default class IncludeSwitch extends React.PureComponent {
  state = {
    internalChecked: true
  };

  handleChange = () => {
    this.setState({ internalChecked: !this.state.internalChecked });
    this.props.input.onChange(!this.state.internalChecked);
  };

  componentDidMount() {
    this.setState({ internalChecked: !!this.props.checked });
  }

  render() {
    const { input: { value, onChange } } = this.props
    const { internalChecked } = this.state;

    return (
      <span style={{ display:"block", overflow:"hidden"}} className="switch switch-sm">
        <input
          type="checkbox"
          checked={value}
          onChange={this.handleChange}
          className="switch"
          id={'include-eye-data'}
        />
        <label htmlFor={'include-eye-data'}></label>
      </span>
    );
  }
}
