import React from "react";
import { getProxyForm } from "./proxyForm";

class Form extends React.PureComponent {
  
  state = { formData: {}, errMsgs: {} };

  constructor(props){
    super(props); 

    const {rules}=props;
    const { 
      formId,
      proxyFormData,
      proxyErrMsgs,
      onFieldChange,
      validField,
      validAll,
      emitter,
      clearForm
     } = getProxyForm({ rules });

    this.formId = formId;
   this.formData =  proxyFormData;
   this.errMsgs =  proxyErrMsgs;
   this.validAll =  validAll;
   this.clearForm =  clearForm;
  }
  
  componentWillUnmount() {
    this.clearForm ( this.formId)
  }

  onSubmit = (callback, validFields) => {
    const { rules } = this.props;
    const {formData,validAll} = this;
    const fields = validFields || Object.keys(formData);
    validAll(callback, fields);
  };

  render() {
    const { children } = this.props;
    const {formId, formData, errMsgs ,onSubmit} = this;

    return <>{children({formId, formData, errMsgs, onSubmit })}</>;
  }
}

export default Form;
