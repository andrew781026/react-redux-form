import React from "react";
import { validateSingleAttr } from "./utils";
import styles from "./form.module.css";

const FormContext = React.createContext("form");

class Main extends React.PureComponent {
  state = { errMsgs: {} };

  singleValidate = (attr, triggerType) => {
    setTimeout(() => {
      const { rules, formData } = this.props;
      if (!rules) return null;

      // value 需要等更新 formData 才取值
      const value = formData[attr];
      const { msg } = validateSingleAttr(rules, attr, value, triggerType);
      if (msg) this.setState({ errMsgs: { [attr]: msg } });
      else if (!msg && this.state.errMsgs[attr])
        this.setState({ errMsgs: { [attr]: null } });
    });
  };

  render() {
    const { formData, children, rules } = this.props;
    const { errMsgs } = this.state;
    const { singleValidate } = this;

    return (
      <FormContext.Provider
        value={{ formData, rules, errMsgs, singleValidate }}
      >
        {children({ errMsgs })}
      </FormContext.Provider>
    );
  }
}

// mimic element-react set the rule
class Item extends React.PureComponent {
  render() {
    const { children, label, attr } = this.props;

    return (
      <FormContext.Consumer>
        {({ errMsgs, singleValidate }) => {
          console.log(`${attr} is render again`);
          return (
            <div
              className={errMsgs && errMsgs[attr] && styles["red-div"]}
              onChange={() => singleValidate(attr, "change")}
              onBlur={() => singleValidate(attr, "blur")}
            >
              {label}：{children}
            </div>
          );
        }}
      </FormContext.Consumer>
    );
  }
}

Main.Item = Item;

export default Main;
