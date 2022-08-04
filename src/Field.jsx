import React from "react";
import styles from "./form.module.css";
import { getProxyForm } from "./proxyForm.js";

// mimic element-react set the rule
class Field extends React.PureComponent {
  state = { errText: "" };
  validField= undefined;
  emitter= undefined;

  componentDidMount() {
    const { field, formId } = this.props;
    const { validField, emitter,onFieldChange } = getProxyForm({ formId });
    this.validField = validField;
    this.emitter = emitter;
    this.onFieldChange = onFieldChange;
    emitter.on(`${field}-error`, (errText) => {
      this.setState({errText});
    });
  }

  componentWillUnmount() {
    const { field } = this.props;

    // 清除註冊的事件
    this.emitter.destory(`${field}-error`);
  }

  render() {
    const {  field, formId , children } = this.props;
    const { validField,onFieldChange } = this;
    const { errText } = this.state;

    // sample of onFieldChange : onChange={ e => onFieldChange( field , e.target.value )}
    return (
      <div
        className={errText && styles["red-div"]}
        onChange={() => validField(field, "change")}
        onBlur={() => validField(field, "blur")}
        onDragStart={() => validField(field, "dragStart")}
        onDrop={() => validField(field, "drop")}
        onFocus={() => validField(field, "focus")}
      >
     {children({ field, formId, errText, onFieldChange })}
      </div>
    );
  }
}

export default Field;
