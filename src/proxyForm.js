import { v4 as uuidv4 } from "uuid";
import { validateSingleAttr } from "./utils";

class MyEventEmitter {
  emitters = {};
  on = (eventName, listener) => {
    if (this.emitters[eventName]) this.emitters[eventName].push(listener);
    else this.emitters[eventName] = [listener];
  };
  emit = (eventName, ...params) => {
    const listeners = this.emitters[eventName];
    if (listeners) listeners.forEach((listener) => listener(...params));
  };
  destory = (eventName) => (this.emitters[eventName] = undefined);
}

export const getProxyForm = ({ field, formId, rules, initFormData = {} }) => {

  // 之後放入 redux 中預計掛在 operation 底下 ( ie : operation.forms = forms )
  const forms = {};
  const clearForm = formId => forms[  formId] = undefined;

  if (rules) {
    const uuidv4 = formId || uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

    const formData = { ...initFormData };
    const errMsgs = {};
    const emitter = new MyEventEmitter(); // emitter per form

    const handleFieldChange = (field, value) =>
      emitter.emit(`${field}-data`, value);

    const handleErrorChange = (field, value) =>
      emitter.emit(`${field}-error`, value);

    const handlerFormData = {
      set: function (obj, prop, newValue) {
        const oldValue = obj[prop];
        // The default behavior to store the value
        obj[prop] = newValue;
        if (oldValue !== newValue) handleFieldChange(prop, newValue);

        // Indicate success
        return true;
      }
    };

    const handlerErrMsgs = {
      set: function (obj, prop, newValue) {
        const oldValue = obj[prop];
        // The default behavior to store the value
        obj[prop] = newValue;
        if (oldValue !== newValue) handleErrorChange(prop, newValue);

        // Indicate success
        return true;
      }
    };

    const proxyFormData = new Proxy(formData, handlerFormData);
    const proxyErrMsgs = new Proxy(errMsgs, handlerErrMsgs);

    const validField = (field, triggerType) => {
      setTimeout(() => {
        if (!rules) return null;

        // value 需要等更新 formData 才取值
        const value = proxyFormData[field];
        const { msg } = validateSingleAttr({
          rules,
          attr: field,
          value,
          triggerType,
          formData: proxyFormData
        });
        if (msg) proxyErrMsgs[field] = msg;
        else if (!msg && proxyErrMsgs[field]) proxyErrMsgs[field] = "";
      });
    };

    const validAll = (cb, validFields) => {
      if (!rules) return null;
      const formData = this.props;
      const fields = validFields;

      const validIt = async () => {
        let isValid = true;

        // validate all attr of formData has value
        const newErrorMessages = await fields.reduce(async (p, curr) => {
          const { msg } = await validateSingleAttr({
            rules,
            attr: curr,
            value: formData[curr],
            triggerType: "submit",
            formData
          });
          if (msg) isValid = false;

          return {
            ...(await p),
            [curr]: msg
          };
        }, Promise.resolve({}));

        return { isValid, newErrorMessages };
      };

      validIt().then(({ isValid, newErrorMessages }) => {
        // 將 newErrorMessages 上的所有欄位更新到 proxyErrMsgs 上面去
        Object.keys({ ...proxyErrMsgs, ...newErrorMessages }).forEach(
          (keys) => (proxyErrMsgs[keys] = newErrorMessages[keys])
        );
        cb(isValid);
      });
    };

    const onFieldChange = (field, value, triggerType = "change") => {
      proxyFormData[field] = value;

      validField(field, triggerType);
    };


    forms[uuidv4] = {
      formId: uuidv4,
      proxyFormData,
      proxyErrMsgs,
      onFieldChange,
      validField,
      validAll,
      emitter,
      clearForm,
    };

    return { formId: uuidv4, proxyFormData, proxyErrMsgs, rules };
  }

  if (formId) {
    return forms[formId];
  }
};
