import Link from "next/link";
import { useEffect, useState } from "react";
import { useData } from "../../hooks/custom-hooks";
import { formatMoney } from "../../utils/money";
import rest from "../../utils/rest";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import Select from "react-select";
import { DatePicker } from "react-rainbow-components";
import { showError } from "../../utils/alert";
import Head from "next/head";
import config from "../../appconfig.json";

const initState = {
  date: new Date(),
  activityref: "",
  invstatus: "out",
  itemref: "",
  label: "",
  qty: "1",
  itemcode: "",
  price: "0.00",
  amount: "0.00",
  vouchercode: "",
  customername: "",
  remark: "",
  shopid: "",
  shopname: "",
  companyid: "",
  companyname: "",
};

export default function InventoryActivityForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useData(initState);
  const [inventories, setInventories] = useState([]);
  const [remaining, setRemaining] = useState("0");
  const [local, setLocal] = useState({ name: "en-US", label: "English (US)" });
  const [voidstatus, setVoidstatus] = useState(1);
  const [selectdata, setSelectdata] = useState({
    label: state.label,
    value: state.itemref,
  });

  const getRemaining = async (ref) => {
    const [d, e] = await rest.get(`/inventory-activities/remainings/${ref}`);
    if (e) {
      showError(e);
    }
    setRemaining(d.data.data + "");
  };

  useEffect(() => {
    const price = parseFloat(state.price.replaceAll(",", "") || "0.00");
    const qty = parseInt(state.qty || "0");
    const amount = price * qty;

    setState({ amount: formatMoney(amount) });
  }, [state.price, state.qty]);

  useEffect(() => {
    rest.get("/inventories/inventory-combo").then(([combodata, comboerr]) => {
      if (comboerr) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: err.message,
          footer: '<a href="">Why do I have this issue?</a>',
        });
      } else {
        setInventories(
          combodata.data.data.map((inv) => ({ ...inv, value: inv.itemref }))
        );
        const activityref = localStorage.getItem("activityref");
        if (activityref) {
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

          rest
            .get(`/inventory-activities/${activityref}`)
            .then(([data, err]) => {
              Swal.close();
              if (err) {
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: err.message,
                  footer: '<a href="">Why do I have this issue?</a>',
                });
              } else {
                getRemaining(data.data.data.itemref);
                setVoidstatus(data.data.data.voidstatus);
                setState({
                  ...data.data.data,
                  price: formatMoney(data.data.data.price),
                  amount: formatMoney(data.data.data.amount),
                  date: data.data.data.date + "Z",
                });
                setSelectdata({
                  label: data.data.data.label,
                  value: data.data.data.itemref,
                });
              }
            });
        }
      }
    });
  }, []);

  const handleNew = () => {
    setVoidstatus(1);
    localStorage.setItem("activityref", "");
    setState(initState);
    setSelectdata({ label: "", value: "" });
    setRemaining("0");
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

    const body = {
      ...state,
      price: state.price.replaceAll(",", ""),
      amount: state.amount.replaceAll(",", ""),
      date: state.date.toISOString(),
    };

    if (body.hasOwnProperty("id")) {
      delete body.id;
    }

    const [data, error] = await rest.post("/inventory-activities", body);
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

      setState({
        ...data.data.data,
        price: formatMoney(data.data.data.price),
        amount: formatMoney(data.data.data.amount),
      });
      setVoidstatus(data.data.data.voidstatus);
      localStorage.setItem("activityref", data.data.data.activityref);
      getRemaining(data.data.data.itemref);
    }
    setLoading(false);
  };

  const handleVoid = async () => {
    if (loading) return;
    setLoading(true);
    const vs = voidstatus == 1 ? 0 : 1;
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
    const [data, err] = await rest.put(
      `/inventory-activities/void/${state.activityref}`,
      {
        voidstatus: vs,
      }
    );
    Swal.close();
    setLoading(false);
    if (err) {
      showError(err);
    } else {
      setVoidstatus(vs);
      getRemaining(state.itemref);
    }
  };

  //   const confirmVoid = (itemref) => {
  //     const swalWithBootstrapButtons = Swal.mixin({
  //       customClass: {
  //         confirmButton: "btn btn-success mx-2",
  //         cancelButton: "btn btn-danger mx-2",
  //       },
  //       buttonsStyling: false,
  //     });

  //     swalWithBootstrapButtons
  //       .fire({
  //         title: "Are you sure?",
  //         text: "You won't be able to revert this!",
  //         icon: "warning",
  //         showCancelButton: true,
  //         confirmButtonText: "Yes, delete it!",
  //         cancelButtonText: "No, cancel!",
  //         reverseButtons: true,
  //       })
  //       .then((result) => {
  //         if (result.isConfirmed) {
  //           Swal.fire({
  //             showConfirmButton: false,
  //             title: "Please Wait !",
  //             html: `<div style="width: 5rem; height: 5rem;" className="spinner-border m-3 text-info" role="status">
  //                     <span className="visually-hidden">Loading...</span>
  //                   </div>`,
  //             // add html attribute if you want or remove
  //             allowOutsideClick: false,
  //             onBeforeOpen: () => {
  //               Swal.showLoading();
  //             },
  //           });
  //           rest.delete(`/inventories/${itemref}`).then(([data, err]) => {
  //             Swal.close();
  //             if (err) {
  //               Swal.fire({
  //                 icon: "error",
  //                 title: "Oops...",
  //                 text: err.message,
  //                 footer: '<a href="">Why do I have this issue?</a>',
  //               });
  //             } else {
  //               swalWithBootstrapButtons
  //                 .fire("Deleted!", "Your data has been deleted.", "success")
  //                 .then(() => {
  //                   router.push("/inventory");
  //                 });
  //             }
  //           });
  //         } else if (
  //           /* Read more about handling dismissals below */
  //           result.dismiss === Swal.DismissReason.cancel
  //         ) {
  //           swalWithBootstrapButtons.fire(
  //             "Cancelled",
  //             "Your data is safe :)",
  //             "error"
  //           );
  //         }
  //       });
  //   };

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
            <Link href="/inventory-activity">
              <a>Inventory In/Out</a>
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {state.activityref ? state.activityref : "New"}
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
              {!state.activityref ? (
                <button
                  disabled={!state.itemref || !state.date}
                  className="btn btn-success mx-2"
                  onClick={handleSave}
                >
                  Save
                </button>
              ) : (
                ""
              )}
              {state.activityref ? (
                <button
                  disabled={!state.activityref}
                  onClick={handleVoid}
                  className="btn btn-danger mx-2"
                >
                  {voidstatus == 1 ? "Void" : "Unvoid"}
                </button>
              ) : (
                ""
              )}
            </div>
            <div className="col-xl-7"></div>
            <div
              className="col-xl-1"
              style={{ display: "flex", justifyContent: "end" }}
            >
              {voidstatus == 0 ? (
                <svg
                  style={{ width: "2rem" }}
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="times-circle"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="svg-inline--fa fa-times-circle fa-w-16 fa-3x"
                >
                  <path
                    style={{ color: "red" }}
                    fill="currentColor"
                    d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"
                    className=""
                  ></path>
                </svg>
              ) : (
                ""
              )}
            </div>
          </div>

          <div className="row mb-3" style={{ alignItems: "flex-end" }}>
            <div className="col-xl-3">
              <label className="form-label">Ref.</label>
              <input
                type="text"
                readOnly
                className="form-control"
                value={state.activityref}
                onChange={(e) => setState({ activityref: e.target.value })}
              />
            </div>
            <div className="col-xl-3">
              <div
                className="btn-group"
                role="group"
                aria-label="Basic radio toggle button group"
                onChange={(e) => setState({ invstatus: e.target.value })}
              >
                <input
                  type="radio"
                  className="btn-check"
                  name="invstatus"
                  id="btnradio1"
                  autocomplete="off"
                  value="in"
                  checked={state.invstatus == "in"}
                />
                <label className="btn btn-outline-primary" for="btnradio1">
                  In
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="invstatus"
                  id="btnradio2"
                  autocomplete="off"
                  value="out"
                  checked={state.invstatus == "out"}
                />
                <label className="btn btn-outline-primary" for="btnradio2">
                  Out
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="invstatus"
                  id="btnradio3"
                  autocomplete="off"
                  value="reject"
                  checked={state.invstatus == "reject"}
                />
                <label className="btn btn-outline-primary" for="btnradio3">
                  Reject
                </label>
              </div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-xl-3">
              <label className="form-label">Date</label>
              <DatePicker
                id="datePicker-1"
                value={state.date}
                onChange={(value) => setState({ date: value })}
                formatStyle="medium"
                locale={local.name}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-xl-3">
              <label className="form-label">Inventory</label>

              <Select
                isDisabled={state.activityref}
                value={selectdata}
                options={inventories}
                onChange={(inv) => {
                  setSelectdata({ ...inv });
                  setRemaining(inv.remaining + "");
                  setState({
                    label: inv.label,
                    itemref: inv.itemref,
                    itemcode: inv.itemcode,
                    price: formatMoney(inv.price),
                  });
                }}
              />
            </div>
            <div className="col-xl-2">
              <label className="form-label">Remaining</label>
              <input
                type="text"
                className="form-control"
                readOnly
                value={remaining}
              />
            </div>
          </div>
          <div className="row mb-3" style={{ alignItems: "flex-end" }}>
            <div className="col-xl-3">
              <label className="form-label">Inventory Code</label>
              <input
                readOnly
                type="text"
                className="form-control"
                value={state.itemcode}
                onChange={(e) => setState({ itemcode: e.target.value })}
              />
            </div>
            <div className="col-xl-2">
              <label className="form-label">Price</label>
              <input
                value={state.price}
                type="text"
                readOnly={state.invstatus != "in"}
                className="form-control price-control"
                onChange={(e) =>
                  setState({ price: e.target.value.replace(/[a-zA-Z]/g, "") })
                }
                onBlur={(e) => setState({ price: formatMoney(e.target.value) })}
              />
            </div>
            <div className="col-xl-2">
              <label className="form-label">Qty</label>
              <div className="input-group" style={{ borderRadius: "10px" }}>
                <span
                  className="input-group-text"
                  id="basic-addon1"
                  style={{ borderRadius: "10px 0 0 10px", background: "#fff" }}
                  onClick={() => {
                    const c = parseInt(state.qty || "0");
                    if (c > 0) {
                      setState({ qty: c - 1 });
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
                  value={state.qty}
                  onChange={(e) =>
                    setState({ qty: e.target.value.replace(/[^0-9]/g, "") })
                  }
                />
                <span
                  className="input-group-text"
                  id="basic-addon1"
                  style={{ borderRadius: "0 10px 10px 0", background: "#fff" }}
                  onClick={() =>
                    setState({ qty: parseInt(state.qty || 0) + 1 })
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
            <div className="col-xl-3">
              <label className="form-label">Amount</label>
              <input
                value={state.amount}
                type="text"
                readOnly
                className="form-control price-control"
              />
            </div>
          </div>
          {state.invstatus == "out" ? (
            <div className="row mb-3">
              <div className="col-xl-3">
                <label className="form-label">Voucher Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={state.vouchercode}
                  onChange={(e) => setState({ vouchercode: e.target.value })}
                />
              </div>
              <div className="col-xl-3">
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={state.customername}
                  onChange={(e) => setState({ customername: e.target.value })}
                />
              </div>
            </div>
          ) : (
            ""
          )}
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
