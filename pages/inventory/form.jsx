import Link from "next/link";
import { useEffect, useState } from "react";
import { useData } from "../../hooks/custom-hooks";
import { formatMoney } from "../../utils/money";
import rest from "../../utils/rest";
import iam from "../../utils/iam-rest";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import { showError } from "../../utils/alert";
import Head from "next/head";
import config from "../../appconfig.json";
import { buildQuery } from "../../utils/url-builder";

const initState = {
  itemref: "",
  label: "",
  itemcode: "",
  price: "0.00",
  netprice: "0.00",
  counts: "0",
  isinfinite: false,
  remaining: "0",
  tag: "",
  remark: "",
  minthreshold: 10,
  shopid: "",
  shopname: "",
  companyid: "",
  companyname: "",
};

export default function InventoryForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useData(initState);
  const [shopOptions, setShopOptions] = useState([]);
  const [userRole, setUserRole] = useState("normaluser");
  const [companyOptions, setCompanyOptions] = useState([]);

  const fetchCompanyAndUser = async () => {
    const [data, err] = await iam.get("/auth/company-and-user");
    if (err) {
      showError(err);
    } else {
      setCompanyOptions(data.data.data);
    }
  };

  const fetchShops = async () => {
    const query = buildQuery({
      page: "1",
      perpage: "999999",
      search: "",
      sortby: "createddate",
      reverse: "1",
    });
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
    const [data, err] = await rest.get(`/shops?${query}`);
    if (err) {
      showError(err);
    } else {
      Swal.close();
      setShopOptions(data.data.data);
    }
  };

  const getRemaining = async (ref) => {
    const [d, e] = await rest.get(`/inventory-activities/remainings/${ref}`);
    if (e) {
      showError(e);
    }
    return d.data.data;
  };

  useEffect(() => {
    const itemref = localStorage.getItem("itemref");
    setUserRole(localStorage.getItem("role"));
    if (localStorage.getItem("role") == "superadmin") {
      fetchCompanyAndUser();
    }
    fetchShops();
    if (itemref) {
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
      rest.get(`/inventories/${itemref}`).then(([data, err]) => {
        Swal.close();
        if (err) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: err.message,
            footer: '<a href="">Why do I have this issue?</a>',
          });
        } else {
          data.data.data.price = formatMoney(data.data.data.price);
          setState(data.data.data);
        }
      });
    }
  }, []);

  // useEffect(() => {
  //   const remaining = 0;
  //   if (state.itemref) {
  //     remaining = parseInt(getRemaining(state.itemref) || "0");
  //   }
  //   setState({
  //     remaining: remaining + ,
  //   });
  // }, [state.counts]);

  const handleNew = () => {
    localStorage.setItem("itemref", "");
    setState(initState);
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
    console.log(state);
    const body = { ...state, price: state.price.replaceAll(",", "") };
    let promise;
    const itemref = localStorage.getItem("itemref");
    if (itemref) {
      promise = rest.put(`/inventories/${itemref}`, body);
    } else {
      if (body.hasOwnProperty("id")) {
        delete body.id;
      }
      promise = rest.post("/inventories", body);
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
    }
    if (data) {
      Swal.close();
      console.log(data);
      Swal.fire({
        position: "center",
        icon: "success",
        title: data.data.message,
        showConfirmButton: false,
        timer: 5000,
      });

      if (!itemref) {
        const remaining = await getRemaining(data.data.data.itemref);
        setState({
          ...data.data.data,
          price: formatMoney(data.data.data.price),
          remaining,
        });
        localStorage.setItem("itemref", data.data.data.itemref);
      } else {
        const remaining = await getRemaining(itemref);
        setState({ remaining });
      }
    }
    setLoading(false);
  };

  const confirmDelete = (itemref) => {
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
          rest.delete(`/inventories/${itemref}`).then(([data, err]) => {
            Swal.close();
            if (err) {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: err.message,
                footer: '<a href="">Why do I have this issue?</a>',
              });
            } else {
              swalWithBootstrapButtons
                .fire("Deleted!", "Your data has been deleted.", "success")
                .then(() => {
                  router.push("/inventory");
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
    <div style={{ marginBottom: "4rem" }}>
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
            <Link href="/inventory">
              <a>Inventory</a>
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {state.itemref ? state.itemref : "New"}
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
                disabled={!state.label || !state.itemcode || !state.price}
                className="btn btn-success mx-2"
                onClick={handleSave}
              >
                {state.itemref ? "Update" : "Save"}
              </button>
              <button
                disabled={!state.itemref}
                onClick={confirmDelete.bind(this, state.itemref)}
                className="btn btn-danger mx-2"
              >
                Delete
              </button>
            </div>
            <div className="col-xl-1"></div>
            <div className="col-xl-1"></div>
          </div>

          <div className="row mb-3">
            <div className="col-xl-3">
              <label className="form-label">Ref.</label>
              <input
                type="text"
                readOnly
                className="form-control"
                value={state.itemref}
                onChange={(e) => setState({ itemref: e.target.value })}
              />
            </div>
            {["superadmin"].includes(userRole) ? (
              <div className="col-xl-3">
                <label className="form-label">Company</label>
                <select
                  value={state.companyid}
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #c4c4c4",
                  }}
                  className="form-select form-control"
                  onChange={(e) => {
                    let companyname = "";
                    const cm = companyOptions.find(
                      (opt) => opt.shopid == e.target.value
                    );
                    if (cm) {
                      companyname = cm.companyname;
                    }
                    setState({ companyid: e.target.value, companyname });
                  }}
                >
                  <option value="">N/A</option>

                  {companyOptions.map((option) => (
                    <option key={option.companyid} value={option.companyid}>
                      {option.companyname}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              ""
            )}
            {["admin", "superadmin"].includes(userRole) ? (
              <div className="col-xl-3">
                <label className="form-label">Shop</label>
                <select
                  value={state.shopid}
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #c4c4c4",
                  }}
                  className="form-select form-control"
                  onChange={(e) => {
                    let shopname = "";
                    const sm = shopOptions.find(
                      (opt) => opt.shopid == e.target.value
                    );
                    if (sm) {
                      shopname = sm.shopname;
                    }
                    setState({ shopid: e.target.value, shopname });
                  }}
                >
                  <option value="">N/A</option>

                  {shopOptions.map((option) => (
                    <option key={option.shopid} value={option.shopid}>
                      {option.shopname}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              ""
            )}
          </div>
          <div className="row mb-3">
            <div className="col-xl-3">
              <label className="form-label">Label</label>
              <input
                type="text"
                className="form-control required-field"
                value={state.label}
                onChange={(e) => setState({ label: e.target.value })}
              />
            </div>
            <div className="col-xl-3">
              <label className="form-label">Inventory Code</label>
              <input
                type="text"
                className="form-control required-field"
                value={state.itemcode}
                onChange={(e) => setState({ itemcode: e.target.value })}
              />
            </div>
          </div>
          <div className="row mb-3" style={{ alignItems: "flex-end" }}>
            <div className="col-xl-2">
              <label className="form-label">Price</label>
              <input
                value={state.price}
                type="text"
                className="form-control price-control required-field"
                onChange={(e) =>
                  setState({ price: e.target.value.replace(/[a-zA-Z]/g, "") })
                }
                onBlur={(e) => setState({ price: formatMoney(e.target.value) })}
              />
            </div>
            <div className="col-xl-2">
              <label className="form-label">Initial Counts</label>
              <div className="input-group" style={{ borderRadius: "10px" }}>
                <span
                  className="input-group-text"
                  id="basic-addon1"
                  style={{ borderRadius: "10px 0 0 10px", background: "#fff" }}
                  onClick={() => {
                    const c = parseInt(state.counts || "0");
                    if (c > 0) {
                      setState({ counts: c - 1 });
                    }
                  }}
                >
                  <svg
                    style={{ width: "1rem" }}
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fal"
                    data-icon="minus"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    className="svg-inline--fa fa-minus fa-w-12 fa-3x"
                  >
                    <path
                      fill="currentColor"
                      d="M376 232H8c-4.42 0-8 3.58-8 8v32c0 4.42 3.58 8 8 8h368c4.42 0 8-3.58 8-8v-32c0-4.42-3.58-8-8-8z"
                      className=""
                    ></path>
                  </svg>
                </span>
                <input
                  type="text"
                  className="form-control"
                  aria-describedby="basic-addon1"
                  style={{ textAlign: "center" }}
                  value={state.counts}
                  onChange={(e) =>
                    setState({ counts: e.target.value.replace(/[^0-9]/g, "") })
                  }
                />
                <span
                  className="input-group-text"
                  id="basic-addon1"
                  style={{ borderRadius: "0 10px 10px 0", background: "#fff" }}
                  onClick={() =>
                    setState({ counts: parseInt(state.counts || 0) + 1 })
                  }
                >
                  <svg
                    style={{ width: "1rem" }}
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fal"
                    data-icon="plus"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    className="svg-inline--fa fa-plus fa-w-12 fa-3x"
                  >
                    <path
                      fill="currentColor"
                      d="M376 232H216V72c0-4.42-3.58-8-8-8h-32c-4.42 0-8 3.58-8 8v160H8c-4.42 0-8 3.58-8 8v32c0 4.42 3.58 8 8 8h160v160c0 4.42 3.58 8 8 8h32c4.42 0 8-3.58 8-8V280h160c4.42 0 8-3.58 8-8v-32c0-4.42-3.58-8-8-8z"
                      className=""
                    ></path>
                  </svg>
                </span>
              </div>
            </div>
            <div className="col-xl-2">
              <label className="form-label">Minimum Threshold</label>
              <div className="input-group" style={{ borderRadius: "10px" }}>
                <span
                  className="input-group-text"
                  id="basic-addon1"
                  style={{ borderRadius: "10px 0 0 10px", background: "#fff" }}
                  onClick={() => {
                    const c = parseInt(state.minthreshold || "0");
                    if (c > 0) {
                      setState({ minthreshold: c - 1 });
                    }
                  }}
                >
                  <svg
                    style={{ width: "1rem" }}
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fal"
                    data-icon="minus"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    className="svg-inline--fa fa-minus fa-w-12 fa-3x"
                  >
                    <path
                      fill="currentColor"
                      d="M376 232H8c-4.42 0-8 3.58-8 8v32c0 4.42 3.58 8 8 8h368c4.42 0 8-3.58 8-8v-32c0-4.42-3.58-8-8-8z"
                      className=""
                    ></path>
                  </svg>
                </span>
                <input
                  type="text"
                  className="form-control"
                  aria-describedby="basic-addon1"
                  style={{ textAlign: "center" }}
                  value={state.minthreshold}
                  onChange={(e) =>
                    setState({
                      minthreshold: e.target.value.replace(/[^0-9]/g, ""),
                    })
                  }
                />
                <span
                  className="input-group-text"
                  id="basic-addon1"
                  style={{ borderRadius: "0 10px 10px 0", background: "#fff" }}
                  onClick={() =>
                    setState({
                      minthreshold: parseInt(state.minthreshold || 0) + 1,
                    })
                  }
                >
                  <svg
                    style={{ width: "1rem" }}
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fal"
                    data-icon="plus"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    className="svg-inline--fa fa-plus fa-w-12 fa-3x"
                  >
                    <path
                      fill="currentColor"
                      d="M376 232H216V72c0-4.42-3.58-8-8-8h-32c-4.42 0-8 3.58-8 8v160H8c-4.42 0-8 3.58-8 8v32c0 4.42 3.58 8 8 8h160v160c0 4.42 3.58 8 8 8h32c4.42 0 8-3.58 8-8V280h160c4.42 0 8-3.58 8-8v-32c0-4.42-3.58-8-8-8z"
                      className=""
                    ></path>
                  </svg>
                </span>
              </div>
              {/* <div
                className="btn-group"
                role="group"
                aria-label="Basic radio toggle button group"
                onChange={(e) =>
                  setState({ isinfinite: e.target.value == "1" ? true : false })
                }
              >
                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="btnradio1"
                  autocomplete="off"
                  value="0"
                  checked={!state.isinfinite}
                />
                <label className="btn btn-outline-primary" for="btnradio1">
                  Finite
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="btnradio2"
                  autocomplete="off"
                  value="1"
                  checked={state.isinfinite}
                />
                <label className="btn btn-outline-primary" for="btnradio2">
                  Infinite
                </label>
              </div> */}
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-xl-2">
              <label className="form-label">Remaining</label>
              <input
                type="text"
                className="form-control"
                readOnly
                value={state.remaining}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-xl-3">
              <label className="form-label">Tag</label>
              <input
                type="text"
                className="form-control"
                value={state.tag}
                onChange={(e) => setState({ tag: e.target.value })}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-xl-5">
              <label className="form-label">Remark</label>
              <textarea
                className="form-control"
                value={state.remark}
                onChange={(e) => setState({ remark: e.target.value })}
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
