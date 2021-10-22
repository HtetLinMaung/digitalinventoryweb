import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Select from "react-select";
import { useData } from "../../hooks/custom-hooks";
import rest from "../../utils/rest";
import { buildQuery } from "../../utils/url-builder";
import Swal from "sweetalert2";
import { formatMoney } from "../../utils/money";
import { showError } from "../../utils/alert";
import moment from "moment";
import { DatePicker } from "react-rainbow-components";

const pageOptions = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "30", label: "30" },
  { value: "40", label: "40" },
  { value: "50", label: "50" },
  { value: "60", label: "60" },
  { value: "70", label: "70" },
  { value: "80", label: "80" },
  { value: "90", label: "90" },
  { value: "100", label: "100" },
];

const initPageState = {
  page: "1",
  perpage: "50",
  search: "",
  sortby: "createddate",
  reverse: "1",
  voidstatus: "1",
  fromdate: moment().subtract(1, "months"),
  todate: new Date(),
};

const initState = {
  pagecount: "1",
  total: "0",
  items: [],
};

export default function InventoryActivity() {
  const router = useRouter();
  const [pagination, setPagination] = useData(initPageState);
  const [state, setState] = useData(initState);
  const [rotate, setRotate] = useState("180deg");
  const [local, setLocal] = useState({ name: "en-US", label: "English (US)" });

  const fetchInvActivities = async () => {
    const query = buildQuery({
      ...pagination,
      fromdate: pagination.fromdate
        ? moment(pagination.fromdate).format("YYYY-MM-DD") + "T00:00"
        : null,
      todate: pagination.todate
        ? moment(pagination.todate).format("YYYY-MM-DD") + "T23:00"
        : null,
      //   fromdate: pagination.fromdate ? pagination.fromdate.toISOString() : null,
      //   todate: pagination.todate ? pagination.todate.toISOString() : null,
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
    const [data, err] = await rest.get(`/inventory-activities?${query}`);
    Swal.close();
    if (err) {
      showError(err);
    } else {
      setState({
        items: data.data.data,
        total: data.data.total,
        pagecount: data.data.pagecount,
      });
    }
  };

  const skipPage = (i = 1) => {
    const page = parseInt(pagination.page || "1");
    const pagecount = parseInt(state.pagecount || "1");
    if ((page == 1 && i < 0) || (page == pagecount && i > 0)) {
      return;
    }
    setPagination({ page: page + i });
  };

  useEffect(() => {
    fetchInvActivities();
  }, [
    pagination.page,
    pagination.perpage,
    pagination.sortby,
    pagination.reverse,
    pagination.voidstatus,
    pagination.fromdate,
    pagination.todate,
  ]);

  const StatusBadge = ({ invstatus }) => {
    switch (invstatus) {
      case "out":
        return (
          <span className="badge rounded-pill bg-success mx-1">
            {invstatus.toUpperCase()}
          </span>
        );
      case "in":
        return (
          <span className="badge rounded-pill bg-primary mx-1">
            {invstatus.toUpperCase()}
          </span>
        );
      case "reject":
        return (
          <span className="badge rounded-pill bg-danger mx-1">
            {invstatus.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div>
      <nav
        style={{
          "--bs-breadcrumb-divider": "'>'",
        }}
        aria-label="breadcrumb"
      >
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Inventory In/Out
          </li>
        </ol>
      </nav>

      <div
        className=" mb-4"
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <div>
          <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            Total - {state.total}
          </span>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-xxl-2 col-xl-3">
          <div
            className="input-group"
            style={{
              boxShadow: "0 0 6px 3px rgba(0,0,0,0.1)",
              borderRadius: 10,
            }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Search"
              aria-describedby="basic-addon1"
              style={{ borderRightStyle: "none", border: 0 }}
              value={pagination.search}
              onChange={(e) => setPagination({ search: e.target.value })}
              onKeyPress={(e) => {
                if (e.key == "Enter") {
                  fetchInvActivities();
                }
              }}
            />
            <span
              className="input-group-text"
              id="basic-addon1"
              style={{
                background: "#fff",
                borderRadius: "0 10px 10px 0",
                border: 0,
              }}
            >
              <svg
                onClick={fetchInvActivities}
                style={{ width: "1rem" }}
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="search"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="svg-inline--fa fa-search fa-w-16 fa-3x"
              >
                <path
                  style={{ color: "grey" }}
                  fill="currentColor"
                  d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"
                  className=""
                ></path>
              </svg>
            </span>
          </div>
        </div>
        <div className="col-xl-1">
          <select
            style={{ backgroundColor: "#fff" }}
            className="form-select form-control card"
            value={pagination.voidstatus}
            onChange={(e) => setPagination({ voidstatus: e.target.value })}
          >
            <option value="2">All</option>
            <option value="1">Active</option>
            <option value="0">Void</option>
          </select>
        </div>

        <div className="col-xxl-8 col-xl-2">
          <DatePicker
            id="datePicker-1"
            placeholder="From"
            value={pagination.fromdate}
            onChange={(value) => setPagination({ fromdate: value })}
            formatStyle="medium"
            locale={local.name}
          />
        </div>

        <div className="col-xxl-8 col-xl-2">
          <DatePicker
            placeholder="To"
            id="datePicker-1"
            value={pagination.todate}
            onChange={(value) => setPagination({ todate: value })}
            formatStyle="medium"
            locale={local.name}
          />
        </div>

        <div className="col-xl-1"></div>

        <div
          className="col-xl-3 col-xxl-2"
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button className="btn">Import</button>
          <button className="btn">Export</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              localStorage.setItem("activityref", "");
              router.push("/inventory-activity/form");
            }}
          >
            New In/Out
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="__table table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th
                scope="col"
                onClick={() => {
                  const sortby = "activityref";
                  if (pagination.reverse == "1") {
                    setRotate("0deg");
                    setPagination({ sortby, reverse: "0" });
                  } else {
                    setRotate("180deg");
                    setPagination({ sortby, reverse: "1" });
                  }
                }}
              >
                Ref.
                <svg
                  style={{ transform: `rotate(${rotate})` }}
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="arrow-down"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="svg-inline--fa fa-arrow-down fa-w-14 fa-3x sort-icon"
                >
                  <path
                    fill="currentColor"
                    d="M443.5 248.5l-7.1-7.1c-4.7-4.7-12.3-4.7-17 0L241 419.9V44c0-6.6-5.4-12-12-12h-10c-6.6 0-12 5.4-12 12v375.9L28.5 241.4c-4.7-4.7-12.3-4.7-17 0l-7.1 7.1c-4.7 4.7-4.7 12.3 0 17l211 211.1c4.7 4.7 12.3 4.7 17 0l211-211.1c4.8-4.8 4.8-12.3.1-17z"
                    className=""
                  ></path>
                </svg>
              </th>
              <th
                scope="col"
                onClick={() => {
                  const sortby = "label";
                  if (pagination.reverse == "1") {
                    setRotate("0deg");
                    setPagination({ sortby, reverse: "0" });
                  } else {
                    setRotate("180deg");
                    setPagination({ sortby, reverse: "1" });
                  }
                }}
              >
                Label
                <svg
                  style={{ transform: `rotate(${rotate})` }}
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="arrow-down"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="svg-inline--fa fa-arrow-down fa-w-14 fa-3x sort-icon"
                >
                  <path
                    fill="currentColor"
                    d="M443.5 248.5l-7.1-7.1c-4.7-4.7-12.3-4.7-17 0L241 419.9V44c0-6.6-5.4-12-12-12h-10c-6.6 0-12 5.4-12 12v375.9L28.5 241.4c-4.7-4.7-12.3-4.7-17 0l-7.1 7.1c-4.7 4.7-4.7 12.3 0 17l211 211.1c4.7 4.7 12.3 4.7 17 0l211-211.1c4.8-4.8 4.8-12.3.1-17z"
                    className=""
                  ></path>
                </svg>
              </th>
              {/* <th
                scope="col"
                onClick={() => {
                  const sortby = "itemcode";
                  if (pagination.reverse == "1") {
                    setRotate("0deg");
                    setPagination({ sortby, reverse: "0" });
                  } else {
                    setRotate("180deg");
                    setPagination({ sortby, reverse: "1" });
                  }
                }}
              >
                Inventory Code
                <svg
                  style={{ transform: `rotate(${rotate})` }}
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="arrow-down"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="svg-inline--fa fa-arrow-down fa-w-14 fa-3x sort-icon"
                >
                  <path
                    fill="currentColor"
                    d="M443.5 248.5l-7.1-7.1c-4.7-4.7-12.3-4.7-17 0L241 419.9V44c0-6.6-5.4-12-12-12h-10c-6.6 0-12 5.4-12 12v375.9L28.5 241.4c-4.7-4.7-12.3-4.7-17 0l-7.1 7.1c-4.7 4.7-4.7 12.3 0 17l211 211.1c4.7 4.7 12.3 4.7 17 0l211-211.1c4.8-4.8 4.8-12.3.1-17z"
                    className=""
                  ></path>
                </svg>
              </th> */}
              <th
                scope="col"
                onClick={() => {
                  const sortby = "qty";
                  if (pagination.reverse == "1") {
                    setRotate("0deg");
                    setPagination({ sortby, reverse: "0" });
                  } else {
                    setRotate("180deg");
                    setPagination({ sortby, reverse: "1" });
                  }
                }}
              >
                Qty
                <svg
                  style={{ transform: `rotate(${rotate})` }}
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="arrow-down"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="svg-inline--fa fa-arrow-down fa-w-14 fa-3x sort-icon"
                >
                  <path
                    fill="currentColor"
                    d="M443.5 248.5l-7.1-7.1c-4.7-4.7-12.3-4.7-17 0L241 419.9V44c0-6.6-5.4-12-12-12h-10c-6.6 0-12 5.4-12 12v375.9L28.5 241.4c-4.7-4.7-12.3-4.7-17 0l-7.1 7.1c-4.7 4.7-4.7 12.3 0 17l211 211.1c4.7 4.7 12.3 4.7 17 0l211-211.1c4.8-4.8 4.8-12.3.1-17z"
                    className=""
                  ></path>
                </svg>
              </th>
              <th
                scope="col"
                onClick={() => {
                  const sortby = "price";
                  if (pagination.reverse == "1") {
                    setRotate("0deg");
                    setPagination({ sortby, reverse: "0" });
                  } else {
                    setRotate("180deg");
                    setPagination({ sortby, reverse: "1" });
                  }
                }}
              >
                Price
                <svg
                  style={{ transform: `rotate(${rotate})` }}
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="arrow-down"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="svg-inline--fa fa-arrow-down fa-w-14 fa-3x sort-icon"
                >
                  <path
                    fill="currentColor"
                    d="M443.5 248.5l-7.1-7.1c-4.7-4.7-12.3-4.7-17 0L241 419.9V44c0-6.6-5.4-12-12-12h-10c-6.6 0-12 5.4-12 12v375.9L28.5 241.4c-4.7-4.7-12.3-4.7-17 0l-7.1 7.1c-4.7 4.7-4.7 12.3 0 17l211 211.1c4.7 4.7 12.3 4.7 17 0l211-211.1c4.8-4.8 4.8-12.3.1-17z"
                    className=""
                  ></path>
                </svg>
              </th>
              <th
                scope="col"
                onClick={() => {
                  const sortby = "amount";
                  if (pagination.reverse == "1") {
                    setRotate("0deg");
                    setPagination({ sortby, reverse: "0" });
                  } else {
                    setRotate("180deg");
                    setPagination({ sortby, reverse: "1" });
                  }
                }}
              >
                Amount
                <svg
                  style={{ transform: `rotate(${rotate})` }}
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="arrow-down"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="svg-inline--fa fa-arrow-down fa-w-14 fa-3x sort-icon"
                >
                  <path
                    fill="currentColor"
                    d="M443.5 248.5l-7.1-7.1c-4.7-4.7-12.3-4.7-17 0L241 419.9V44c0-6.6-5.4-12-12-12h-10c-6.6 0-12 5.4-12 12v375.9L28.5 241.4c-4.7-4.7-12.3-4.7-17 0l-7.1 7.1c-4.7 4.7-4.7 12.3 0 17l211 211.1c4.7 4.7 12.3 4.7 17 0l211-211.1c4.8-4.8 4.8-12.3.1-17z"
                    className=""
                  ></path>
                </svg>
              </th>
              <th
                scope="col"
                onClick={() => {
                  const sortby = "vouchercode";
                  if (pagination.reverse == "1") {
                    setRotate("0deg");
                    setPagination({ sortby, reverse: "0" });
                  } else {
                    setRotate("180deg");
                    setPagination({ sortby, reverse: "1" });
                  }
                }}
              >
                Voucher
                <svg
                  style={{ transform: `rotate(${rotate})` }}
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="arrow-down"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="svg-inline--fa fa-arrow-down fa-w-14 fa-3x sort-icon"
                >
                  <path
                    fill="currentColor"
                    d="M443.5 248.5l-7.1-7.1c-4.7-4.7-12.3-4.7-17 0L241 419.9V44c0-6.6-5.4-12-12-12h-10c-6.6 0-12 5.4-12 12v375.9L28.5 241.4c-4.7-4.7-12.3-4.7-17 0l-7.1 7.1c-4.7 4.7-4.7 12.3 0 17l211 211.1c4.7 4.7 12.3 4.7 17 0l211-211.1c4.8-4.8 4.8-12.3.1-17z"
                    className=""
                  ></path>
                </svg>
              </th>
              <th
                scope="col"
                onClick={() => {
                  const sortby = "customername";
                  if (pagination.reverse == "1") {
                    setRotate("0deg");
                    setPagination({ sortby, reverse: "0" });
                  } else {
                    setRotate("180deg");
                    setPagination({ sortby, reverse: "1" });
                  }
                }}
              >
                Customer
                <svg
                  style={{ transform: `rotate(${rotate})` }}
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="arrow-down"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="svg-inline--fa fa-arrow-down fa-w-14 fa-3x sort-icon"
                >
                  <path
                    fill="currentColor"
                    d="M443.5 248.5l-7.1-7.1c-4.7-4.7-12.3-4.7-17 0L241 419.9V44c0-6.6-5.4-12-12-12h-10c-6.6 0-12 5.4-12 12v375.9L28.5 241.4c-4.7-4.7-12.3-4.7-17 0l-7.1 7.1c-4.7 4.7-4.7 12.3 0 17l211 211.1c4.7 4.7 12.3 4.7 17 0l211-211.1c4.8-4.8 4.8-12.3.1-17z"
                    className=""
                  ></path>
                </svg>
              </th>
              <th
                scope="col"
                onClick={() => {
                  const sortby = "date";
                  if (pagination.reverse == "1") {
                    setRotate("0deg");
                    setPagination({ sortby, reverse: "0" });
                  } else {
                    setRotate("180deg");
                    setPagination({ sortby, reverse: "1" });
                  }
                }}
              >
                Date
                <svg
                  style={{ transform: `rotate(${rotate})` }}
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="arrow-down"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="svg-inline--fa fa-arrow-down fa-w-14 fa-3x sort-icon"
                >
                  <path
                    fill="currentColor"
                    d="M443.5 248.5l-7.1-7.1c-4.7-4.7-12.3-4.7-17 0L241 419.9V44c0-6.6-5.4-12-12-12h-10c-6.6 0-12 5.4-12 12v375.9L28.5 241.4c-4.7-4.7-12.3-4.7-17 0l-7.1 7.1c-4.7 4.7-4.7 12.3 0 17l211 211.1c4.7 4.7 12.3 4.7 17 0l211-211.1c4.8-4.8 4.8-12.3.1-17z"
                    className=""
                  ></path>
                </svg>
              </th>
              <th
                scope="col"
                onClick={() => {
                  const sortby = "invstatus";
                  if (pagination.reverse == "1") {
                    setRotate("0deg");
                    setPagination({ sortby, reverse: "0" });
                  } else {
                    setRotate("180deg");
                    setPagination({ sortby, reverse: "1" });
                  }
                }}
              >
                Status
                <svg
                  style={{ transform: `rotate(${rotate})` }}
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="arrow-down"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="svg-inline--fa fa-arrow-down fa-w-14 fa-3x sort-icon"
                >
                  <path
                    fill="currentColor"
                    d="M443.5 248.5l-7.1-7.1c-4.7-4.7-12.3-4.7-17 0L241 419.9V44c0-6.6-5.4-12-12-12h-10c-6.6 0-12 5.4-12 12v375.9L28.5 241.4c-4.7-4.7-12.3-4.7-17 0l-7.1 7.1c-4.7 4.7-4.7 12.3 0 17l211 211.1c4.7 4.7 12.3 4.7 17 0l211-211.1c4.8-4.8 4.8-12.3.1-17z"
                    className=""
                  ></path>
                </svg>
              </th>
            </tr>
          </thead>
          <tbody>
            {state.items.length ? (
              state.items.map((item, i) => (
                <tr
                  key={item.activityref}
                  className={item.voidstatus == 0 ? "void-row" : ""}
                >
                  <th scope="row">{i + 1}</th>
                  <td>
                    <span
                      onClick={() => {
                        localStorage.setItem("activityref", item.activityref);
                        router.push("/inventory-activity/form");
                      }}
                      style={{ textDecoration: "underline", cursor: "pointer" }}
                    >
                      {item.activityref}
                    </span>
                  </td>
                  <td>{item.label}</td>
                  {/* <td>{item.itemcode}</td> */}
                  <td>{item.qty}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatMoney(item.price)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatMoney(item.amount)}
                  </td>
                  <td>{item.vouchercode}</td>
                  <td>{item.customername}</td>
                  <td>{moment(item.date).format("DD/MM/YYYY")}</td>
                  <td>
                    <StatusBadge invstatus={item.invstatus} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="10"
                  style={{ textAlign: "center", fontWeight: "bold" }}
                >
                  No Data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="row mb-4 mt-4" style={{ justifyContent: "flex-end" }}>
        <div className="col-xl-2">
          <div className="card p-1">
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <svg
                onClick={() => setPagination({ page: 1 })}
                style={{ width: "1.3rem" }}
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="angle-double-left"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                className="svg-inline--fa fa-angle-double-left fa-w-14 fa-3x"
              >
                <path
                  style={{ color: "grey" }}
                  fill="currentColor"
                  d="M223.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L319.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L393.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34zm-192 34l136 136c9.4 9.4 24.6 9.4 33.9 0l22.6-22.6c9.4-9.4 9.4-24.6 0-33.9L127.9 256l96.4-96.4c9.4-9.4 9.4-24.6 0-33.9L201.7 103c-9.4-9.4-24.6-9.4-33.9 0l-136 136c-9.5 9.4-9.5 24.6-.1 34z"
                  className=""
                ></path>
              </svg>
              <svg
                onClick={skipPage.bind(this, -1)}
                style={{ width: "1rem", padding: "0.1rem" }}
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="angle-left"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 512"
                className="svg-inline--fa fa-angle-left fa-w-8 fa-3x"
              >
                <path
                  style={{ color: "grey" }}
                  fill="currentColor"
                  d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z"
                  className=""
                ></path>
              </svg>
              <span style={{ fontWeight: "bold" }}>
                {pagination.page} : {state.pagecount}
              </span>
              <svg
                onClick={skipPage.bind(this, 1)}
                style={{ width: "1rem", padding: "0.1rem" }}
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="angle-right"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 512"
                className="svg-inline--fa fa-angle-right fa-w-8 fa-3x"
              >
                <path
                  style={{ color: "grey" }}
                  fill="currentColor"
                  d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"
                  className=""
                ></path>
              </svg>
              <svg
                onClick={() => setPagination({ page: state.pagecount })}
                style={{ width: "1.3rem" }}
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="angle-double-right"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                className="svg-inline--fa fa-angle-double-right fa-w-14 fa-3x"
              >
                <path
                  style={{ color: "grey" }}
                  fill="currentColor"
                  d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34zm192-34l-136-136c-9.4-9.4-24.6-9.4-33.9 0l-22.6 22.6c-9.4 9.4-9.4 24.6 0 33.9l96.4 96.4-96.4 96.4c-9.4 9.4-9.4 24.6 0 33.9l22.6 22.6c9.4 9.4 24.6 9.4 33.9 0l136-136c9.4-9.2 9.4-24.4 0-33.8z"
                  className=""
                ></path>
              </svg>
            </div>
          </div>
        </div>
        <div className="col-xl-1">
          <select
            className="form-select form-control card"
            style={{ backgroundColor: "#fff" }}
            value={pagination.perpage}
            onChange={(e) =>
              setPagination({ perpage: e.target.value, page: "1" })
            }
          >
            {pageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
