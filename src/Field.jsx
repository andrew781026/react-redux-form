import React from "react";
import styles from "./form.module.css";
import { getProxyForm } from "./proxyForm.js";

// mimic element-react set the rule
class Field extends React.PureComponent {
  state = { errText: "" };

  componentDidMount() {
    const { field, formId } = this.props;
    const { validField, emitter } = getProxyForm({ field, formId });
    this.validField = validField;
    this.emitter = emitter;
    emitter.on(`${field}-error`, (errText) => {
      this.setState(errText);
    });
  }

  render() {
    const { children, label, attr } = this.props;
    const { validField } = this;

    return (
      <div
        className={this.state.errText && styles["red-div"]}
        onChange={() => validField(attr, "change")}
        onBlur={() => validField(attr, "blur")}
        onDragStart={() => validField(attr, "dragStart")}
        onDrop={() => validField(attr, "drop")}
        onFocus={() => validField(attr, "focus")}
      >
        {label}：{children}
      </div>
    );
  }
}

export default Field;
