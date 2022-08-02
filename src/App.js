import React, { useState } from "react";
import styles from "./style.module.css";
import Form from "./Form";
import withForm from "./withForm";
import { isEmail, isPhone } from "./utils";
import useForm from "./useForm";
import MyForm from "./FormItem";

const ValidateEmail = (email) => {
  if (!isEmail(email)) return "格式不正確，請輸入正確格式的 email";
  else return null;
};

const ValidatePhone = (phone) => {
  if (!isPhone(phone)) return "格式不正確，請輸入正確格式的 phone";
  else return null;
};

const myRules = {
  name: [{ required: true, message: "姓名為必填欄位", trigger: "change" }],
  avatarUrl: [
    { required: true, message: "頭像連結為必填欄位", trigger: "blur" }
  ],
  email: [
    { required: true, message: "電子郵件為必填欄位", trigger: "change" },
    { validator: ValidateEmail, trigger: "change" }
  ],
  phone: [
    { required: true, message: "電話號碼為必填欄位", trigger: "change" },
    { validator: ValidatePhone, trigger: "blur" }
  ]
};

const Title = ({ logo, label }) => (
  <h1>
    <span role="img" aria-label={label}>
      {logo}
    </span>
    &nbsp;{label}
  </h1>
);

const DisplayBlock = ({ label, attr, errMsgs, formData, setFormData }) => {
  return (
    <>
      <div
        className={errMsgs[attr] && styles["red-text"]}
        onChange={(event) => setFormData(attr, event.target.value)}
      >
        {label}：
        <input className={errMsgs[attr] && styles["error-input"]} />
      </div>

      <div className={styles.flex}>
        <div className={styles.output}>
          顯示 Form 內部的資料：
          <br />
          <pre>formData = {JSON.stringify(formData, null, 4)}</pre>
        </div>

        <div className={`${styles["output-red"]}`}>
          顯示 Form 內部的錯誤訊息：
          <br />
          <pre>errMsgs = {JSON.stringify(errMsgs, null, 4)}</pre>
        </div>
      </div>
    </>
  );
};

const MyHocForm = withForm(myRules)(({ formData, errMsgs, setFormData }) => (
  <DisplayBlock
    label="電子郵件"
    attr="email"
    formData={formData}
    errMsgs={errMsgs}
    setFormData={setFormData}
  />
));

const MyUseForm = ({ rules }) => {
  const { formData, errMsgs, setFormData } = useForm({ rules });
  return (
    <>
      <div
        className={errMsgs["email"] && styles["red-text"]}
        onChange={(event) => setFormData("email", event.target.value)}
      >
        電子郵件：
        <input className={errMsgs["email"] && styles["error-input"]} />
      </div>

      <div
        className={errMsgs["avatar"] && styles["red-text"]}
        onChange={(event) => setFormData("avatar", event.target.value)}
      >
        頭像連結：
        <input className={errMsgs["avatar"] && styles["error-input"]} />
      </div>

      <div className={styles.flex}>
        <div className={styles.output}>
          顯示 Form 內部的資料：
          <br />
          <pre>formData = {JSON.stringify(formData, null, 4)}</pre>
        </div>

        <div className={`${styles["output-red"]}`}>
          顯示 Form 內部的錯誤訊息：
          <br />
          <pre>errMsgs = {JSON.stringify(errMsgs, null, 4)}</pre>
        </div>
      </div>
    </>
  );
};

const MyFormItem = ({ rules }) => {
  const [formData, setFormData] = useState({});
  return (
    <MyForm rules={rules} formData={formData}>
      {({ errMsgs }) => (
        <>
          <MyForm.Item label="電話號碼" attr="phone">
            <input onChange={(e) => setFormData({ phone: e.target.value })} />
          </MyForm.Item>
          <MyForm.Item label="頭像連結" attr="avatarUrl">
            <input onChange={(e) => setFormData({ phone: e.target.value })} />
          </MyForm.Item>
          <div className={styles.flex}>
            <div className={styles.output}>
              顯示 Form 內部的資料：
              <br />
              <pre>formData = {JSON.stringify(formData, null, 4)}</pre>
            </div>
            <div className={`${styles["output-red"]}`}>
              顯示 Form 內部的錯誤訊息：
              <br />
              <pre>errMsgs = {JSON.stringify(errMsgs, null, 4)}</pre>
            </div>
          </div>
        </>
      )}
    </MyForm>
  );
};

export default function App() {
  return (
    <>
      <Title label="Render Props" logo="🚕" />
      <div>
        <Form rules={myRules}>
          {({ formData, errMsgs, setFormData }) => (
            <DisplayBlock
              label="姓名"
              attr="name"
              formData={formData}
              errMsgs={errMsgs}
              setFormData={setFormData}
            />
          )}
        </Form>
      </div>
      <hr />
      <Title label="HOC" logo="🚂" />
      <div>
        <MyHocForm />
      </div>
      <hr />
      <Title label="useForm" logo="🚚" />
      <div>
        <MyUseForm rules={myRules} />
      </div>
      <hr />
      <Title label="FormItem" logo="🚈" />
      <div>
        <MyFormItem rules={myRules} />
      </div>
      <hr />
      <Title label="FormItem" logo="🚋" />
      <div>
        <MyFormItem rules={myRules} />
      </div>
    </>
  );
}
