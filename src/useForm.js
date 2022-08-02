import { useState } from "react";
import { validateSingleAttr } from "./utils";

const useForm = ({ rules }) => {
  const [formData, setFormData] = useState({});
  const [errMsgs, setErrMsgs] = useState({});

  const singleValidate = (attr, value, triggerType) => {
    if (!rules) return null;
    const { msg } = validateSingleAttr(rules, attr, value, triggerType);

    if (msg) setErrMsgs({ [attr]: msg });
    else if (!msg && errMsgs[attr]) setErrMsgs({ [attr]: null });
  };

  // rule 在這層做驗證 , 產生 errMsgs
  const setCustomFormData = (attr, value) => {
    setFormData((oldFormData) => ({ ...oldFormData, [attr]: value }));
    return singleValidate(attr, value, "change");
  };

  return { formData, errMsgs, setFormData: setCustomFormData };
};

export default useForm;
