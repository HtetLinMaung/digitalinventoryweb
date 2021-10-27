import Link from "next/link";
import { useEffect, useState } from "react";
import { useData } from "../../hooks/custom-hooks";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import { showError } from "../../utils/alert";
import iam from "../../utils/iam-rest";
import Head from "next/head";
import config from "../../appconfig.json";

const initState = {
  userid: "",
  companyid: "",
  username: "",
  companyname: "",
  mobile: "",
  contactinfo: "",
  contactperson: "",
  otpservice: "email",
  role: "normaluser",
  accountstatus: "active",
  profile: "",
  password: "",
};

export default function UserSetupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useData(initState);
  const [userRole, setUserRole] = useState("admin");
  const [isupdate, setIsupdate] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
    if (role == "superadmin") {
      setState({ password: "User@123" });
    } else if (role == "admin") {
      setState({
        companyid: "abc",
        companyname: localStorage.getItem("companyname"),
      });
    }
    const userid = localStorage.getItem("userid");
    const isupdate = localStorage.getItem("isupdate");
    setIsupdate(isupdate);
    if (isupdate && userid) {
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
      iam.get(`/auth/users/${userid}`).then(([data, err]) => {
        Swal.close();
        if (err) {
          showError(err);
        } else {
          if (data.data.data.hasOwnProperty("_id")) {
            delete data.data.data["_id"];
            delete data.data.data["__v"];
            delete data.data.data["createdAt"];
            delete data.data.data["updatedAt"];
          }
          setState(data.data.data);
        }
      });
    }
  }, []);

  const handleNew = () => {
    localStorage.setItem("userid", "");
    localStorage.setItem("isupdate", "");
    setIsupdate("");
    const newState = { ...initState };
    if (userRole == "admin") {
      newState.companyid = "abc";
      newState.companyname = localStorage.getItem("companyname");
    }
    setState(newState);
  };

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
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

    const body = { ...state };
    let promise;
    const userid = localStorage.getItem("userid");
    const isupdate = localStorage.getItem("isupdate");
    setIsupdate(isupdate);
    if (isupdate && userid) {
      promise = iam.put(`/auth/users/${userid}`, body);
    } else if (!isupdate) {
      promise = iam.post("/auth/users", body);
    }
    const [data, error] = await promise;
    if (error) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
        footer: '<a href="">Why do I have this issue?</a>',
      });
    } else {
      Swal.close();
      console.log(data);
      Swal.fire({
        position: "center",
        icon: "success",
        title: data.data.message,
        showConfirmButton: false,
        timer: 5000,
      });

      if (!isupdate) {
        setState({
          ...data.data.data,
        });
        localStorage.setItem("userid", data.data.data.userid);
      }
    }
    setLoading(false);
  };

  const confirmDelete = (userid) => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success mx-2",
        cancelButton: "btn btn-danger mx-2",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
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
          iam.delete(`/auth/users/${userid}`).then(([data, err]) => {
            Swal.close();
            if (err) {
              showError(err);
            } else {
              swalWithBootstrapButtons
                .fire("Deleted!", "Your data has been deleted.", "success")
                .then(() => {
                  router.push("/user-setup");
                });
            }
          });
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            "Cancelled",
            "Your data is safe :)",
            "error"
          );
        }
      });
  };

  return (
    <div>
      <Head>
        <title>{config.version}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav
        style={{
          "--bs-breadcrumb-divider": "'>'",
        }}
        aria-label="breadcrumb"
      >
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/user-setup">
              <a>User Setup</a>
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {isupdate ? state.userid : "New"}
          </li>
        </ol>
      </nav>

      <div className="card">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-xl-4">
              <button
                className="btn btn-primary mx-2"
                style={{ marginLeft: "0px!important" }}
                onClick={handleNew}
              >
                New
              </button>
              <button
                disabled={
                  !state.username ||
                  !state.password ||
                  !state.companyid ||
                  !state.companyname
                }
                className="btn btn-success mx-2"
                onClick={handleSave}
              >
                {isupdate ? "Update" : "Save"}
              </button>
              <button
                disabled={!isupdate}
                onClick={confirmDelete.bind(this, state.userid)}
                className="btn btn-danger mx-2"
              >
                Delete
              </button>
            </div>
            <div className="col-xl-1"></div>
            <div className="col-xl-1"></div>
          </div>
          <div className="row">
            <div className="col-xl-4">
              <div className="row mb-3">
                <div className="col-xl-12">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control required-field"
                    value={state.username}
                    onChange={(e) => setState({ username: e.target.value })}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-xl-12">
                  <label className="form-label">Email</label>
                  <input
                    placeholder="john@example.com"
                    type="text"
                    className="form-control required-field"
                    value={state.userid}
                    onChange={(e) => setState({ userid: e.target.value })}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-xl-12">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control required-field"
                    value={state.password}
                    onChange={(e) => setState({ password: e.target.value })}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-xl-12">
                  <label className="form-label">Mobile</label>
                  <input
                    placeholder="09-"
                    type="text"
                    className="form-control required-field"
                    value={state.mobile}
                    onChange={(e) => setState({ mobile: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div
              className="col-xl-8"
              style={{
                justifyContent: "flex-end",
                display: "flex",
                paddingRight: "5rem",
              }}
            >
              <div
                onClick={() => {
                  const imagepicker = document.getElementById("imagepicker");
                  imagepicker.value = "";
                  imagepicker.click();
                }}
                className="center-children"
                style={{
                  border: "2px solid #c4c4c4",
                  borderRadius: "50%",
                  width: "200px",
                  height: "200px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {state.profile ? (
                  <img
                    src={state.profile}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  "Upload Profile"
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                id="imagepicker"
                style={{ display: "none" }}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files[0]) {
                    const fr = new FileReader();
                    fr.readAsDataURL(files[0]);
                    fr.addEventListener("load", () => {
                      setState({ profile: fr.result });
                    });
                  }
                }}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-xl-4">
              <label className="form-label">Role</label>
              <select
                value={state.role}
                style={{ backgroundColor: "#fff", border: "1px solid #c4c4c4" }}
                className="form-select form-control"
                onChange={(e) => setState({ role: e.target.value })}
              >
                <option value="normaluser">Normal User</option>
                <option value="admin">Admin</option>
                {userRole == "superadmin" ? (
                  <option value="superadmin">Super Admin</option>
                ) : (
                  ""
                )}
              </select>
            </div>
            <div className="col-xl-4">
              <label className="form-label">Account Status</label>
              <select
                value={state.accountstatus}
                style={{ backgroundColor: "#fff", border: "1px solid #c4c4c4" }}
                className="form-select form-control"
                onChange={(e) => setState({ accountstatus: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="freeze">Freeze</option>
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-xl-3">
              <label className="form-label">Auth Mode</label>
              <div
                style={{ display: "block" }}
                className="btn-group"
                role="group"
                aria-label="Basic radio toggle button group"
                onChange={(e) => setState({ otpservice: e.target.value })}
              >
                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="btnradio1"
                  autocomplete="off"
                  value="none"
                  checked={state.otpservice == "none"}
                />
                <label className="btn btn-outline-primary" for="btnradio1">
                  None
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="btnradio2"
                  autocomplete="off"
                  value="email"
                  checked={state.otpservice == "email"}
                />
                <label className="btn btn-outline-primary" for="btnradio2">
                  2FA
                </label>
              </div>
            </div>
          </div>
          <hr />
          <div className="row mb-3">
            {userRole == "superadmin" ? (
              <div className="col-xl-4">
                <label className="form-label">Company ID</label>
                <input
                  type="text"
                  className="form-control required-field"
                  value={state.companyid}
                  onChange={(e) => setState({ companyid: e.target.value })}
                />
              </div>
            ) : (
              ""
            )}
            <div className="col-xl-4">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-control required-field"
                value={state.companyname}
                onChange={(e) => setState({ companyname: e.target.value })}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-xl-4">
              <label className="form-label">Contact Info</label>
              <input
                type="text"
                className="form-control "
                value={state.contactinfo}
                onChange={(e) => setState({ contactinfo: e.target.value })}
              />
            </div>
            <div className="col-xl-4">
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                className="form-control "
                value={state.contactperson}
                onChange={(e) => setState({ contactperson: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
