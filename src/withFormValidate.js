// WithFormValidator.jsx
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import {
  TriggerType,
  validateFormField,
  validateAllField,
} from '../resource/validateFormField';
import { componentError } from '../resource/debug';
import getOperationData from '../selector/getOperationData';
import { MERGE_OPERATION_DATA } from '../ActionTypes';
import PropTypes from 'prop-types';

const componentDebug = componentError.extend('WithFormValidator');

/**
 * add validate feature HOC component - WithFormValidator
 * ---
 * @param {function} getRules - set the validate rule ( format : props => rules )
 *
 *📕 HOC quick use：
 *   @example
 *     withTranslation()(WithFormValidator(getRules)(UserForm));
 *   ----
 *📕 getRules ：use getRules to set validate rule
 *   @example
 *     const getRules = ({t}) => {
 *       name: [ { required: true, message: 'required', trigger: 'submit' } ],
 *       email: [
 *         { required: true, message: t('required_field') , trigger: 'change' },
 *         { isEmail: true, message: 'Email format error', trigger: 'submit' },
 *         { trigger: 'submit' , asyncValidator: async (address, formData) => {
 *           const hasSameEmail = await CheckEmailExistFromApi(email);
 *           return hasSameEmail ? 'Email existed' : undefined ;
 *         }},
 *       ],
 *     }
 *   ----
 *📕 UserForm Docs：
 *   @example
 *     const UserForm = props => {
 *
 *       const validFields = [ 'name' , 'email' ];
 *       const cb = isValid => {
 *         if (isValid) submitUserInfo(userInfo);
 *       }
 *
 *       const submit = () => validateAll( cb , validFields );
 *
 *       return (
 *         <>
 *            <div>
 *              Name：<input value={props.name} onChange={e => validateField('name', e.target.value)} />
 *            </div>
 *            <div class="text-red">
 *              {props.errorMessages.name}
 *            </div>
 *            <div>
 *              email：<input value={props.email} onChange={e => validateField('email', e.target.value , 'change')} />
 *            </div>
 *            <div class="text-red">
 *              {props.errorMessages.email}
 *            </div>
 *            <button onClick={submit}>submit</button>
 *         </>
 *       )
 *     }
 *   ----
 *📕 trigger types：
 *     ・type='change' => valid as field change
 *     ・type='submit' => valid as submit
 *   ----
 *📕 how validate trigger：
 *     call validateField to valid , default will valid the field with type='change'
 *     @example
 *       validateField( field , value , triggerType );
 *   ----
 *     as type='submit' field validate , call validateAll to validate
 *     @example
 *       const validFields = [ 'name' , 'email' ];
 *       const cb = isValid => isValid && submitUserInfo(userInfo);
 *       const submit = () => validateAll( cb , validFields );
 */
export const WithFormValidator = getRules => Component => {
  class FormWithValidate extends React.Component {
    constructor(props) {
      super(props);
      this.rules = getRules(props);

      // uncomment below if you want to show the error log in verbose level
      // localStorage.debug = 'component:error:WithFormValidator';
    }

    componentDidMount() {
      // append the errorMessages of relate formId in redux
      const { initErrorMessages, errorMessages, formId } = this.props;
      const { rules } = this.rules;
      initErrorMessages({ formId, rules, errorMessages });
    }

    componentWillUnmount() {
      // clear the errorMessages of relate formId in redux
      const { removeErrorMessages, formId } = this.props;
      removeErrorMessages(formId);
    }

    setErrorMessages = newErrorMessages => {
      // this.setState({ errorMessages: newErrorMessages });
      const { setErrorMessages, formId } = this.props;
      setErrorMessages({ formId, errorMessages: newErrorMessages });
    };

    setErrorText = (field, newErrorText) => {
      // this.setState(prevState => ({ errorMessages: { ...prevState.errorMessages, [field]: newErrorText }, }));
      const { setErrorText, formId } = this.props;
      setErrorText({ formId, field, errorText: newErrorText });
    };

    singleValidate = (field, value, triggerType) => {
      const { rules } = this;
      if (!rules) return null;

      validateFormField({ rules, field, value, triggerType })
        .then(({ message }) => {
          if (message) this.setErrorText(field, message);
          else if (!message && this.props.errorMessages[field])
            this.setErrorText(field, null);
        })
        .catch(error => {
          componentDebug('handleError error:', error, ', extra:', {
            field,
            value,
          });
        });
    };

    validateField = (field, value, triggerType = TriggerType.CHANGE) =>
      this.singleValidate(field, value, triggerType);

    // validate as submit
    validateAll = (callback, validFields) => {
      const { rules } = this;
      const formData = this.props;
      const fields = validFields;

      validateAllField({ rules, fields, formData })
        .then(({ isValid, newErrorMessages }) => {
          this.setErrorMessages(newErrorMessages);
          callback(isValid);
        })
        .catch(error => {
          componentDebug('handleError error:', error, ', extra:', {
            validFields,
            formData,
          });
        });
    };

    render() {
      const { errorMessages } = this.props;
      const { validateAll, validateField } = this;
      return (
        <Component
          {...this.props}
          errorMessages={errorMessages}
          validateAll={validateAll}
          validateField={validateField}
        />
      );
    }
  }

  FormWithValidate.propTypes = {
    t: PropTypes.func.isRequired,
    setErrorText: PropTypes.func,
    setErrorMessages: PropTypes.func,
    initErrorMessages: PropTypes.func,
    removeErrorMessages: PropTypes.func,
    errorMessages: PropTypes.object,
    formId: PropTypes.string,
  };
  FormWithValidate.defaultProps = {
    errorMessages: {},
    formId: uuidv4(),
    setErrorText: () => null,
    setErrorMessages: () => null,
    initErrorMessages: () => null,
    removeErrorMessages: () => null,
  };

  return FormWithValidate;
};

const initErrorMessages =
  ({ formId, rules, errorMessages = {}, validateAll, validateField }) =>
  async dispatch => {
    return dispatch({
      type: MERGE_OPERATION_DATA,
      payload: {
        selectPath: ['form', formId],
        data: {
          formId,
          errorMessages,
          rules,
          validateAll,
          validateField,
        },
      },
    });
  };

const setErrorMessages =
  ({ formId, errorMessages = {} }) =>
  async dispatch => {
    return dispatch({
      type: MERGE_OPERATION_DATA,
      payload: {
        selectPath: ['form', formId, 'errorMessages'],
        data: errorMessages,
      },
    });
  };

const setErrorText =
  ({ formId, field, errorText }) =>
  async dispatch => {
    if (!field || !errorText) return null;
    else
      return dispatch({
        type: MERGE_OPERATION_DATA,
        payload: {
          selectPath: ['form', formId, 'errorMessages', field],
          data: errorText,
        },
      });
  };

const removeErrorMessages = formId => async dispatch => {
  return dispatch({
    type: MERGE_OPERATION_DATA,
    payload: {
      selectPath: ['form', formId],
      data: null,
    },
  });
};

// ref : https://levelup.gitconnected.com/how-to-connect-hoc-with-react-and-redux-2b3bce6a7dbf
export default (formId, getRules) => WrappedComponent => {
  const mapStateToProps = state => {
    const errorMessages = getOperationData(
      state,
      ['form', formId],
      'errorMessages'
    );
    return {
      errorMessages,
      formId,
    };
  };

  const mapDispatchToProps = dispatch => {
    return {
      setErrorText: ({ formId, field, errorText }) =>
        dispatch(setErrorText({ formId, field, errorText })),
      setErrorMessages: ({ formId, errorMessages }) =>
        dispatch(setErrorMessages({ formId, errorMessages })),
      initErrorMessages: ({ formId, rules, errorMessages }) =>
        dispatch(initErrorMessages({ formId, rules, errorMessages })),
      removeErrorMessages: formId => dispatch(removeErrorMessages(formId)),
    };
  };

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(withTranslation()(WithFormValidator(getRules)(WrappedComponent)));
};
