import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.jsx";
import store from "./app/store";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import i18n from "./utils/i18n.js";

const Root = () => {
  const savedLang = localStorage.getItem("language") || "en";
  document.documentElement.lang = savedLang;
  document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";

  return (
    <>
      <Provider store={store}>
        <App key={savedLang}  />
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={i18n.language === "ar"}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Provider>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
