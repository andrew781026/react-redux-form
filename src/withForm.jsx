import React from "react";
import { validateSingleAttr } from "./utils";

const withForm = (rules) => (Component) => {
  return class extends React.PureComponent {
    state = { formData: {}, errMsgs: {} };

    singleValidate = (attr, value, triggerType) => {
      if (!rules) return null;

      const { msg } = validateSingleAttr(rules, attr, value, triggerType);
      if (msg) this.setState({ errMsgs: { [attr]: msg } });
      else if (!msg && this.state.errMsgs[attr])
        this.setState({ errMsgs: { [attr]: null } });
    };

    // rule 在這層做驗證 , 產生 errMsgs
    setFormData = (attr, value) => {
      this.setState({ formData: { [attr]: value } });
      return this.singleValidate(attr, value, "change");
    };

    render() {
      const { formData, errMsgs } = this.state;
      const { setFormData } = this;

      return (
        <Component
          formData={formData}
          errMsgs={errMsgs}
          setFormData={setFormData}
        />
      );
    }
  };
};

export default withForm;
