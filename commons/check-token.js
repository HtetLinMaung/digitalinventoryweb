import Swal from "sweetalert2";
import { showError } from "../utils/alert";
import rest from "../utils/rest";

const checkToken = async () => {
  Swal.fire({
    showConfirmButton: false,
    title: "Please Wait !",
    html: `<div style="width: 5rem; height: 5rem;" className="spinner-border m-3 text-info" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>`,
    // add html attribute if you want or remove
    allowOutsideClick: false,
    onBeforeOpen: () => {
      Swal.showLoading();
    },
  });
  const [data, err] = await rest.post("/auth/get-app-token", {
    iamtoken: localStorage.getItem("iamtoken"),
  });
  Swal.close();
  if (err) {
    showError(err);
  } else {
    localStorage.setItem("token", data.data.data.token);
    localStorage.setItem("username", data.data.data.username);
    localStorage.setItem("companyname", data.data.data.companyname);
    localStorage.setItem("role", data.data.data.role);
    localStorage.setItem(
      "shopname",
      data.data.data.shopname ? data.data.data.shopname : ""
    );
  }
};

export default checkToken;
