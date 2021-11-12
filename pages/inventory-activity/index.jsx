import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Select from "react-select";
import { useData } from "../../hooks/custom-hooks";
import rest from "../../utils/rest";
import iam from "../../utils/iam-rest";
import { buildQuery } from "../../utils/url-builder";
import Swal from "sweetalert2";
import { formatMoney } from "../../utils/money";
import { showError } from "../../utils/alert";
import moment from "moment";
import { DatePicker } from "react-rainbow-components";
import Head from "next/head";
import config from "../../appconfig.json";
import { reactIf } from "../../utils/ui";

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
  invstatus: "all",
  companyid: "all",
  userid: "all",
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
  const [totalState, setTotalState] = useData({
    totalqty: "0",
    totalamount: "0.00",
  });
  const [rotate, setRotate] = useState("180deg");
  const [local, setLocal] = useState({ name: "en-US", label: "English (US)" });
  const [userRole, setUserRole] = useState("");
  const [hidefilter, setHidefilter] = useState(true);
  const [userOptions, setUserOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [shopOptions, setShopOptions] = useState([]);

  const getColSpan = () => {
    switch (userRole) {
      case "normaluser":
        return "9";
      case "admin":
        return "10";
      case "superadmin":
        return "11";
    }
  };
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
      }
    }
  };

  const toggleFilter = () => {
    setHidefilter(!hidefilter);
  };

  const fetchCompanyAndUser = async () => {
    const [data, err] = await iam.get("/auth/company-and-user");
    if (err) {
      showError(err);
    } else {
      setCompanyOptions(data.data.data);
    }
  };

  const handleImport = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.onchange = (e) => {
      const files = e.target.files;
      if (files[0]) {
        const fr = new FileReader();
        fr.readAsDataURL(files[0]);
        fr.addEventListener("load", () => {
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
            .post("/inventory-activities/import", {
              file: fr.result,
              fileext: files[0].name.split(".")[1],
            })
            .then(([data, err]) => {
              Swal.close();
              if (err) {
                showError(err);
              } else {
                fetchInvActivities();
                fetchInvActivitiesTotal();
              }
            });
        });
      }
    };
    fileInput.click();
  };

  const handleExport = () => {
    const query = buildQuery({
      ...pagination,
      fromdate: pagination.fromdate
        ? moment(pagination.fromdate).format("YYYY-MM-DD") + "T00:00"
        : null,
      todate: pagination.todate
        ? moment(pagination.todate).format("YYYY-MM-DD") + "T23:00"
        : null,
      page: 1,
      perpage: 9999999,
      authorization: localStorage.getItem("token"),
    });
    window.location = `${config.domain}/inventory-activities/export?${query}`;
  };

  const fetchInvActivitiesTotal = async () => {
    const query = buildQuery({
      ...pagination,
      fromdate: pagination.fromdate
        ? moment(moment(pagination.fromdate).format("YYYY-MM-DD"))
            .subtract(1, "millisecond")
            .toISOString()
        : null,
      todate: pagination.todate
        ? moment(moment(pagination.todate).format("YYYY-MM-DD"))
            .add(1, "day")
            .subtract(1, "millisecond")
            .toISOString()
        : null,
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
    const [data, err] = await rest.get(`/inventory-activities/totals?${query}`);
    Swal.close();
    if (err) {
      showError(err);
    } else {
      setTotalState({
        totalqty: data.data.data.totalqty + "",
        totalamount: formatMoney(data.data.data.totalamount),
      });
    }
  };

  const fetchInvActivities = async () => {
    const query = buildQuery({
      ...pagination,
      fromdate: pagination.fromdate
        ? moment(moment(pagination.fromdate).format("YYYY-MM-DD"))
            .subtract(1, "millisecond")
            .toISOString()
        : null,
      todate: pagination.todate
        ? moment(moment(pagination.todate).format("YYYY-MM-DD"))
            .add(1, "day")
            .subtract(1, "millisecond")
            .toISOString()
        : null,
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
    if (localStorage.getItem("role") == "superadmin") {
      fetchCompanies();
    }
    setUserRole(localStorage.getItem("role"));
  }, []);

  useEffect(() => {
    fetchShops();
  }, [pagination.companyid]);

  useEffect(() => {
    fetchInvActivities();
    fetchInvActivitiesTotal();
  }, [
    pagination.page,
    pagination.perpage,
    pagination.sortby,
    pagination.reverse,
    pagination.voidstatus,
    pagination.fromdate,
    pagination.todate,
    pagination.invstatus,
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
    <div className="mb-5">
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
          <li className="breadcrumb-item active" aria-current="page">
            Inventory In/Out
          </li>
        </ol>
      </nav>

      <div className="total-container mb-4">
        <div>
          <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            Qty - {totalState.totalqty}
          </span>
        </div>
        <div>
          <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            Amount - {totalState.totalamount}
          </span>
        </div>
        <div>
          <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            Total - {state.total}
          </span>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4 col-xxl-2 col-xl-3">
          <div
            className="input-group"
            style={{
              boxShadow: "0 0 6px 3px rgba(222, 112, 141, 0.1)",
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
              onChange={(e) =>
                setPagination({ search: e.target.value, page: "1" })
              }
              onKeyPress={(e) => {
                if (e.key == "Enter") {
                  fetchInvActivities();
                  fetchInvActivitiesTotal();
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
                onClick={() => {
                  fetchInvActivities();
                  fetchInvActivitiesTotal();
                }}
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

        <div className=" col-md-2 col-lg-4 col-xl-6 col-xxl-7 d-flex">
          <button
            className="btn btn-white center-children mx-2"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              padding: 0,
            }}
            onClick={toggleFilter}
          >
            <svg
              style={{ width: "1rem" }}
              aria-hidden="true"
              focusable="false"
              data-prefix="far"
              data-icon="filter"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="svg-inline--fa fa-filter fa-w-16 fa-3x __svg"
            >
              <path
                fill="currentColor"
                d="M463.952 0H48.057C5.419 0-16.094 51.731 14.116 81.941L176 243.882V416c0 15.108 7.113 29.335 19.2 40l64 47.066c31.273 21.855 76.8 1.538 76.8-38.4V243.882L497.893 81.941C528.042 51.792 506.675 0 463.952 0zM288 224v240l-64-48V224L48 48h416L288 224z"
                class=""
              ></path>
            </svg>
          </button>
          <button
            className="btn btn-white center-children mx-2"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              padding: 0,
            }}
            onClick={() => setPagination(initPageState)}
          >
            <svg
              style={{ width: "1rem" }}
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="redo-alt"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="svg-inline--fa fa-redo-alt fa-w-16 fa-3x __svg"
            >
              <path
                fill="currentColor"
                d="M256.455 8c66.269.119 126.437 26.233 170.859 68.685l35.715-35.715C478.149 25.851 504 36.559 504 57.941V192c0 13.255-10.745 24-24 24H345.941c-21.382 0-32.09-25.851-16.971-40.971l41.75-41.75c-30.864-28.899-70.801-44.907-113.23-45.273-92.398-.798-170.283 73.977-169.484 169.442C88.764 348.009 162.184 424 256 424c41.127 0 79.997-14.678 110.629-41.556 4.743-4.161 11.906-3.908 16.368.553l39.662 39.662c4.872 4.872 4.631 12.815-.482 17.433C378.202 479.813 319.926 504 256 504 119.034 504 8.001 392.967 8 256.002 7.999 119.193 119.646 7.755 256.455 8z"
                className=""
              ></path>
            </svg>
          </button>
        </div>
        <div className="import-control col-md-6 col-lg-4 col-xl-3 col-xxl-3">
          <button className="btn btn-white" onClick={handleImport}>
            Import
          </button>
          <button className="btn btn-white" onClick={handleExport}>
            Export
          </button>
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

      {!hidefilter ? (
        <div className="row mb-4">
          <div className="col-md-4 col-xl-2">
            <select
              style={{ backgroundColor: "#fff" }}
              value={pagination.invstatus}
              onChange={(e) =>
                setPagination({ invstatus: e.target.value, page: "1" })
              }
              className="form-select form-control card"
            >
              <option value="in">In</option>
              <option value="out">Out</option>
              <option value="reject">Reject</option>
              <option value="all">Status</option>
            </select>
          </div>
          <div className="col-md-4 col-xl-2">
            <select
              style={{ backgroundColor: "#fff" }}
              className="form-select form-control card"
              value={pagination.voidstatus}
              onChange={(e) =>
                setPagination({ voidstatus: e.target.value, page: "1" })
              }
            >
              <option value="2">All</option>
              <option value="1">Active</option>
              <option value="0">Void</option>
            </select>
          </div>
          <div className="col-md-4 col-xxl-2 col-xl-2">
            <DatePicker
              className="date-picker"
              id="datePicker-1"
              placeholder="From"
              value={pagination.fromdate}
              onChange={(value) =>
                setPagination({ fromdate: value, page: "1" })
              }
              formatStyle="medium"
              locale={local.name}
            />
          </div>
          <div className="col-md-4 col-xxl-2 col-xl-2">
            <DatePicker
              className="date-picker"
              placeholder="To"
              id="datePicker-1"
              value={pagination.todate}
              onChange={(value) => setPagination({ todate: value, page: "1" })}
              formatStyle="medium"
              locale={local.name}
            />
          </div>
          {userRole == "superadmin" ? (
            <div className="col-md-4 col-xl-2">
              <select
                value={pagination.companyid}
                style={{
                  backgroundColor: "#fff",
                }}
                className="form-select form-control card"
                onChange={(e) => {
                  const company = companyOptions.find(
                    (com) => com.companyid == e.target.value
                  );

                  const pageObj = {
                    companyid: e.target.value,
                    page: "1",
                  };
                  // if (company && company.users.length) {
                  //   pageObj.userid = company.users[0].userid;
                  // }
                  setPagination(pageObj);
                }}
              >
                <option value="all">Company</option>
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
          {pagination.companyid != "all" &&
          ["superadmin", "admin"].includes(userRole) ? (
            <div className="col-md-4 col-xl-2">
              <select
                value={state.shopid}
                style={{
                  backgroundColor: "#fff",
                }}
                className="form-select form-control card"
                onChange={(e) => {
                  let shopname = "";
                  const sm = shopOptions.find(
                    (opt) => opt.shopid == e.target.value
                  );
                  const pageObj = {
                    shopid: e.target.value,
                    page: "1",
                  };
                  // if (sm && sm.users.length) {
                  //   pageObj.userid = company.users[0].userid;
                  // }
                  setPagination(pageObj);
                }}
              >
                <option value="all">Shop</option>
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
          {pagination.companyid != "all" &&
          ["superadmin", "admin"].includes(userRole) ? (
            <div className="col-md-4 col-xl-2">
              {/* <select
                style={{ backgroundColor: "#fff" }}
                value={pagination.userid}
                onChange={(e) =>
                  setPagination({ userid: e.target.value, page: "1" })
                }
                className="form-select form-control card"
              >
                {companyOptions
                  .find((com) => com.companyid == pagination.companyid)
                  .users.map((option) => (
                    <option key={option.userid} value={option.userid}>
                      {option.username}
                    </option>
                  ))}
              </select> */}
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}

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
              {["admin", "superadmin"].includes(userRole) ? (
                <th
                  scope="col"
                  onClick={() => {
                    const sortby = "username";
                    if (pagination.reverse == "1") {
                      setRotate("0deg");
                      setPagination({ sortby, reverse: "0" });
                    } else {
                      setRotate("180deg");
                      setPagination({ sortby, reverse: "1" });
                    }
                  }}
                >
                  Created By
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
              ) : (
                ""
              )}
              {["superadmin"].includes(userRole) ? (
                <th
                  scope="col"
                  onClick={() => {
                    const sortby = "companyname";
                    if (pagination.reverse == "1") {
                      setRotate("0deg");
                      setPagination({ sortby, reverse: "0" });
                    } else {
                      setRotate("180deg");
                      setPagination({ sortby, reverse: "1" });
                    }
                  }}
                >
                  Company
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
              ) : (
                ""
              )}
              {reactIf(
                ["admin", "superadmin"].includes(userRole),
                <th
                  scope="col"
                  onClick={() => {
                    const sortby = "shopname";
                    if (pagination.reverse == "1") {
                      setRotate("0deg");
                      setPagination({ sortby, reverse: "0" });
                    } else {
                      setRotate("180deg");
                      setPagination({ sortby, reverse: "1" });
                    }
                  }}
                >
                  Shop
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
              )}
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
                  <td>{moment(item.date + "Z").format("DD/MM/YYYY")}</td>
                  <td>
                    <StatusBadge invstatus={item.invstatus} />
                  </td>
                  {["admin", "superadmin"].includes(userRole) ? (
                    <td>{item.username}</td>
                  ) : (
                    ""
                  )}
                  {["superadmin"].includes(userRole) ? (
                    <td>{item.companyname}</td>
                  ) : (
                    ""
                  )}
                  {reactIf(
                    ["admin", "superadmin"].includes(userRole),
                    <td>{item.shopname}</td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={getColSpan()}
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
        <div
          className="col-sm-4 col-xl-2 d-flex import-control"
          style={{ justifyContent: "flex-end" }}
        >
          <a
            className="d-none"
            id="invatvtemplate"
            download
            href="/Inventory-In-Out.xlsx"
          ></a>
          <button
            className="btn btn-white"
            onClick={() => document.getElementById("invatvtemplate").click()}
          >
            Download Template
          </button>
        </div>
        <div className="col-md-4 col-xl-2">
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
        <div className="col-md-2 col-xl-1">
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
