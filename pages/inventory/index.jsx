import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Select from "react-select";
import { useData } from "../../hooks/custom-hooks";
import rest from "../../utils/rest";
import { buildQuery } from "../../utils/url-builder";
import Swal from "sweetalert2";
import { formatMoney } from "../../utils/money";

const options = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" },
];

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
};

const initState = {
  pagecount: "1",
  total: "0",
  items: [],
};

export default function Inventory() {
  const router = useRouter();
  const [pagination, setPagination] = useData(initPageState);
  const [state, setState] = useData(initState);

  const fetchInventories = async () => {
    const query = buildQuery(pagination);

    Swal.fire({
      showConfirmButton: false,
      title: "Please Wait !",
      html: `<div style="width: 5rem; height: 5rem;" class="spinner-border m-3 text-info" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>`,
      // add html attribute if you want or remove
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    const [data, err] = await rest.get(`/inventories?${query}`);
    Swal.close();
    if (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err.message,
        footer: '<a href="">Why do I have this issue?</a>',
      });
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
    const pagecount = parseInt(pagination.pagecount || "1");
    if ((page == 1 && i < 0) || (page == pagecount && i > 0)) {
      return;
    }
    setPagination({ page: page + i });
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
            html: `<div style="width: 5rem; height: 5rem;" class="spinner-border m-3 text-info" role="status">
                    <span class="visually-hidden">Loading...</span>
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
                  fetchInventories();
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

  useEffect(() => {
    fetchInventories();
  }, [pagination.page, pagination.perpage, pagination.sortby]);

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
            Inventory
          </li>
        </ol>
      </nav>

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
                  fetchInventories();
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
                onClick={fetchInventories}
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

        <div className="col-xxl-8 col-xl-6">
          {/* <Select options={options} /> */}
        </div>

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
              localStorage.setItem("itemref", "");
              router.push("/inventory/form");
            }}
          >
            New Inventory
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Ref.</th>
              <th scope="col">Label</th>
              <th scope="col">Inventory Code</th>
              <th scope="col">Price</th>
              <th scope="col">In Stock</th>
              <th scope="col">Tags</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {state.items.map((item, i) => (
              <tr key={item.itemref}>
                <th scope="row">{i + 1}</th>
                <td>{item.itemref}</td>
                <td>{item.label}</td>
                <td>{item.itemcode}</td>
                <td style={{ textAlign: "right" }}>
                  {formatMoney(item.price)}
                </td>
                <td>{item.remaining}</td>
                <td>
                  {item.tag
                    ? item.tag.split(",").map((t) => (
                        <span
                          key={t}
                          className="badge rounded-pill bg-primary mx-1"
                        >
                          {t}
                        </span>
                      ))
                    : ""}
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      onClick={() => {
                        localStorage.setItem("itemref", item.itemref);
                        router.push("/inventory/form");
                      }}
                      style={{ width: "1rem" }}
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fas"
                      data-icon="pencil-alt"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      className="svg-inline--fa fa-pencil-alt fa-w-16 fa-3x"
                    >
                      <path
                        fill="currentColor"
                        style={{ color: "grey" }}
                        d="M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z"
                        className=""
                      ></path>
                    </svg>
                    <svg
                      style={{ width: "1rem" }}
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fas"
                      data-icon="trash"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                      className="svg-inline--fa fa-trash fa-w-14 fa-3x"
                      onClick={confirmDelete.bind(this, item.itemref)}
                    >
                      <path
                        style={{ color: "grey" }}
                        fill="currentColor"
                        d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"
                        className=""
                      ></path>
                    </svg>
                  </div>
                </td>
              </tr>
            ))}
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
                onClick={skipPage.bind(
                  this,
                  pagination.page - pagination.page + 1
                )}
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
                onClick={skipPage.bind(this, state.pagecount)}
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
            onChange={(e) => setPagination({ perpage: e.target.value })}
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
