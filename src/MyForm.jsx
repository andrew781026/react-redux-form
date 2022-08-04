import React from "react";
import { getProxyForm } from "./proxyForm";

class Form extends React.PureComponent {

  
  state = { formData: {}, errMsgs: {} };

  constructor(props){
    super(props);

    const {rules}=props;
    const {  formId, proxyFormData,
      proxyErrMsgs,
      onFieldChange,
      validField,
      validAll,
      emitter } = getProxyForm({ rules });

    this.formId = formId
  }

  singleValidate = (attr, value, triggerType) => {
    const { rules } = this.props;
    if (!rules) return null;

    const { msg } = validateSingleAttr(rules, attr, value, triggerType);
    if (msg) this.setState({ errMsgs: { [attr]: msg } });
    else if (!msg && this.state.errMsgs[attr])
      this.setState({ errMsgs: { [attr]: null } });
  };

  // will trigger the Wrapper function

  // validate as blur

  // validate as focus

  // rule 在這層做驗證 , 產生 errMsgs
  setFormData = (attr, value) => {
    this.setState({ formData: { [attr]: value } });
    return this.singleValidate(attr, value, "change");
  };

  render() {
    const { children } = this.props;
    const { formData, errMsgs } = this.state;

    const { setFormData } = this;
    return <>{children({ formData, errMsgs, setFormData })}</>;
  }
}

export default Form;
