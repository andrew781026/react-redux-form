const requiredValidator = (value, message) =>
  value !== 0 && value ? null : message;
export const validateSingleAttr = ({
  rules,
  attr,
  value,
  triggerType,
  formData
}) => {
  const singleRuleArr = rules[attr];
  let msg = null;
  if (!singleRuleArr) return { attr, msg };
  const activeRules = singleRuleArr.filter((rule) =>
    triggerType ? rule.trigger === triggerType : true
  );
  for (const singleRule of activeRules) {
    if (singleRule.required) msg = requiredValidator(value, singleRule.message);
    else if (singleRule.validator) msg = singleRule.validator(value, formData);
    // 如果有錯誤訊息的 msg , 就直接回傳那個文字
    if (msg) return { attr, msg };
  }
  return { attr, msg };
};

export const isEmail = (mail) => {
  if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(mail)) return true;
  else return false;
};

export const isPhone = (phone) => {
  if (/^\d{9}/.test(phone)) return true;
  else return false;
};
