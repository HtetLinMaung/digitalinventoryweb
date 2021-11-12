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
import { reactIf } from "../../utils/ui";
import { buildQuery } from "../../utils/url-builder";

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
  const [local, setLocal] = useState({ name: "en-US", label: "English (US)" });
  const [voidstatus, setVoidstatus] = useState(1);
  const [selectdata, setSelectdata] = useState([
    {
      label: "",
      value: "",
    },
  ]);
  const [items, setItems] = useState([{ ...initState }]);
  const [remainings, setRemainings] = useData({});
  const [shopOptions, setShopOptions] = useState([]);
  const [userRole, setUserRole] = useState("normaluser");
  const [companyOptions, setCompanyOptions] = useState([]);

  const fetchCompanies = async () => {
    const query = buildQuery({
      page: "1",
      perpage: "9999999",
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
    const [data, err] = await rest.get(`/companies?${query}`);
    Swal.close();
    if (err) {
      showError(err);
    } else {
      setCompanyOptions(data.data.data);
      if (!localStorage.getItem("itemref") && data.data.data.length) {
        const com = data.data.data[0];
        setState({ companyid: com.companyid, companyname: com.companyname });
      }
    }
  };

  const fetchShops = async () => {
    const role = localStorage.getItem("role");
    if (role != "normaluser") {
      if (role == "superadmin" && !state.companyid) return;
      const query = buildQuery({
        page: "1",
        perpage: "999999",
        search: "",
        sortby: "createddate",
        reverse: "1",
        companyid: role == "superadmin" ? state.companyid : "",
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
        if (data.data.data.length && !localStorage.getItem("itemref")) {
          const shop = data.data.data[0];
          setState({ shopid: shop.shopid, shopname: shop.shopname });
        }
      }
    }
  };

  const setItem = (i, payload) => {
    const newitems = [...items];
    newitems[i] = { ...newitems[i], ...payload };
    setItems(newitems);
  };

  const setSelectItem = (i, payload) => {
    const newitems = [...items];
    newitems[i] = { ...newitems[i], ...payload };
    setSelectdata(newitems);
  };

  const setRemaining = async (ref) => {
    if (!ref) return "0";
    const [d, e] = await rest.get(`/inventory-activities/remainings/${ref}`);
    if (e) {
      showError(e);
    }
    setRemainings({ [ref]: d.data.data });
  };

  useEffect(() => {
    fetchShops();
  }, [state.companyid]);

  useEffect(() => {
    let i = 0;
    for (const item of items) {
      setRemaining(item.itemref);
      const price = parseFloat(item.price.replaceAll(",", "") || "0.00");
      const qty = parseInt(item.qty || "0");
      const amount = price * qty;

      setItem(i, { amount: formatMoney(amount) });
      i++;
    }
  }, [JSON.stringify(items)]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
    if (localStorage.getItem("role") == "superadmin") {
      fetchCompanies();
    }
    rest.get("/inventories/inventory-combo").then(([combodata, comboerr]) => {
      if (comboerr) {
        showError(comboerr);
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
                // getRemaining(data.data.data.itemref);
                setVoidstatus(data.data.data.voidstatus);
                setState({
                  ...data.data.data,
                  date: data.data.data.date + "Z",
                });
                setItems([
                  {
                    ...data.data.data,
                    price: formatMoney(data.data.data.price),
                    amount: formatMoney(data.data.data.amount),
                  },
                ]);
                setSelectdata([
                  {
                    label: data.data.data.label,
                    value: data.data.data.itemref,
                  },
                ]);
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
    setSelectdata([{ label: "", value: "" }]);
    setItems([{ ...initState }]);
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
      list: items.map((item) => {
        if (item.hasOwnProperty("id")) {
          delete item.id;
        }
        return {
          ...item,
          price: item.price.replaceAll(",", ""),
          amount: item.amount.replaceAll(",", ""),
          date: state.date.toISOString(),
          invstatus: state.invstatus,
          vouchercode: state.vouchercode,
          customername: state.customername,
          remark: state.remark,
          shopid: state.shopid,
          shopname: state.shopname,
          companyid: state.companyid,
          companyname: state.companyname,
        };
      }),
    };

    const [data, error] = await rest.post("/inventory-activities/batch", body);
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
      handleNew();
      router.push("/inventory-activity");
      // setState({
      //   ...data.data.data,
      //   price: formatMoney(data.data.data.price),
      //   amount: formatMoney(data.data.data.amount),
      // });
      // setVoidstatus(data.data.data.voidstatus);
      // localStorage.setItem("activityref", data.data.data.activityref);
      // getRemaining(data.data.data.itemref);
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
      // getRemaining(state.itemref);
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
                  disabled={!state.date}
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
              <label className="form-label">Date</label>
              <DatePicker
                id="datePicker-1"
                value={state.date}
                onChange={(value) => setState({ date: value })}
                formatStyle="medium"
                locale={local.name}
                className="date-picker"
                style={{
                  boxShadow: "none",
                  border: "1px solid #c4c4c4",
                  borderRadius: "10px",
                }}
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
                      (opt) => opt.companyid == e.target.value
                    );
                    if (cm) {
                      companyname = cm.companyname;
                    }
                    setState({ companyid: e.target.value, companyname });
                  }}
                >
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

            {reactIf(
              ["admin", "superadmin"].includes(userRole),
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
                  {shopOptions.map((option) => (
                    <option key={option.shopid} value={option.shopid}>
                      {option.shopname}
                    </option>
                  ))}
                </select>
              </div>,
              ""
            )}

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

          {items.map((item, i) => (
            <div
              key={i}
              className="row mb-3"
              style={{ alignItems: "flex-end" }}
            >
              {reactIf(
                item.activityref,
                <div className="col-xl-2">
                  <label className="form-label">Ref.</label>
                  <input
                    type="text"
                    readOnly
                    className="form-control"
                    value={item.activityref}
                    onChange={(e) =>
                      setItem(i, { activityref: e.target.value })
                    }
                  />
                </div>,
                ""
              )}

              <div className="col-xl-3">
                <label className="form-label">
                  Inventory (
                  <span
                    className=" mx-1"
                    style={{ fontSize: 12, fontWeight: "bold" }}
                  >
                    {remainings[item.itemref] || "0"}
                  </span>
                  )
                </label>
                <Select
                  styles={{
                    input: (styles) => ({
                      ...styles,
                      height: "28.75px",
                      minHeight: "28.75px",
                      margin: 0,
                      padding: 0,
                      fontSize: 12,
                    }),
                    control: (styles) => ({
                      ...styles,
                      height: "28.75px",
                      minHeight: "28.75px",
                      borderRadius: "10px",
                    }),
                    valueContainer: (styles) => ({
                      ...styles,
                      height: "28.75px",
                      minHeight: "28.75px",
                    }),
                    container: (styles) => ({
                      ...styles,
                      height: "28.75px",
                      minHeight: "28.75px",
                      fontSize: 12,
                    }),

                    indicatorsContainer: (styles) => ({
                      ...styles,
                      height: "28.75px",
                      minHeight: "28.75px",
                    }),
                  }}
                  isDisabled={item.activityref}
                  value={selectdata[i]}
                  options={inventories}
                  onChange={(inv) => {
                    setSelectItem(i, { ...inv });
                    setItem(i, {
                      label: inv.label,
                      itemref: inv.itemref,
                      itemcode: inv.itemcode,
                      price: formatMoney(inv.price),
                    });
                  }}
                />
              </div>
              <div className="col-xl-2">
                <label className="form-label">Price</label>
                <input
                  value={item.price}
                  type="text"
                  readOnly={item.invstatus != "in"}
                  className="form-control price-control"
                  onChange={(e) =>
                    setItem(i, {
                      price: e.target.value.replace(/[a-zA-Z]/g, ""),
                    })
                  }
                  onBlur={(e) =>
                    setItem(i, { price: formatMoney(e.target.value) })
                  }
                />
              </div>
              <div className="col-xl-2">
                <label className="form-label">Qty</label>
                <div className="input-group" style={{ borderRadius: "10px" }}>
                  <span
                    className="input-group-text"
                    id="basic-addon1"
                    style={{
                      borderRadius: "10px 0 0 10px",
                      background: "#fff",
                    }}
                    onClick={() => {
                      const c = parseInt(item.qty || "0");
                      if (c > 0) {
                        setItem(i, { qty: c - 1 });
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
                    value={item.qty}
                    onChange={(e) =>
                      setItem(i, { qty: e.target.value.replace(/[^0-9]/g, "") })
                    }
                  />
                  <span
                    className="input-group-text"
                    id="basic-addon1"
                    style={{
                      borderRadius: "0 10px 10px 0",
                      background: "#fff",
                    }}
                    onClick={() =>
                      setItem(i, { qty: parseInt(item.qty || 0) + 1 })
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
                <label className="form-label">Amount</label>
                <input
                  value={item.amount}
                  type="text"
                  readOnly
                  className="form-control price-control"
                />
              </div>
              <div className="col-xl-1">
                {reactIf(
                  i == items.length - 1,
                  <button
                    className="btn btn-success center-children mx-2"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      padding: 0,
                    }}
                    onClick={() => {
                      setItems([...items, initState]);
                    }}
                  >
                    <svg
                      style={{ width: "0.9rem" }}
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="far"
                      data-icon="plus"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 384 512"
                      className="svg-inline--fa fa-plus fa-w-12 fa-3x __svg"
                    >
                      <path
                        fill="currentColor"
                        d="M368 224H224V80c0-8.84-7.16-16-16-16h-32c-8.84 0-16 7.16-16 16v144H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h144v144c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V288h144c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16z"
                        className=""
                      ></path>
                    </svg>
                  </button>,
                  <button
                    className="btn btn-danger center-children mx-2"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      padding: 0,
                    }}
                    onClick={() => {
                      const newitems = [...items];
                      newitems.splice(i, 1);
                      setItems(newitems);
                      const newselectdata = [...selectdata];
                      newselectdata.splice(i, 1);
                      setSelectdata(newselectdata);
                    }}
                  >
                    <svg
                      style={{ width: "0.9rem" }}
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="far"
                      data-icon="minus"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 384 512"
                      class="svg-inline--fa fa-minus fa-w-12 fa-3x"
                    >
                      <path
                        fill="currentColor"
                        d="M368 224H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h352c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16z"
                        className=""
                      ></path>
                    </svg>
                  </button>
                )}
              </div>
              {/* <div className="col-xl-2">
              <label className="form-label">Remaining</label>
              <input
                type="text"
                className="form-control"
                readOnly
                value={remaining}
              />
            </div> */}
            </div>
          ))}

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
