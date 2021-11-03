import Link from "next/link";
import { useEffect, useState } from "react";
import { useData } from "../../hooks/custom-hooks";
import rest from "../../utils/rest";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import { showError } from "../../utils/alert";
import Head from "next/head";
import config from "../../appconfig.json";
import { buildQuery } from "../../utils/url-builder";

const initState = {
  shopid: "",
  shopname: "",
  companyid: "",
  companyname: "",
};

export default function ShopForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useData(initState);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [userRole, setUserRole] = useState("normaluser");

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

  useEffect(() => {
    const role = localStorage.getItem("role");
    const shopid = localStorage.getItem("shopid");
    setUserRole(role);
    if (role == "superadmin") {
      fetchCompanies();
    }
    if (shopid) {
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
      rest.get(`/shops/${shopid}`).then(([data, err]) => {
        Swal.close();
        if (err) {
          showError(err);
        } else {
          setState(data.data.data);
        }
      });
    }
  }, []);

  const handleNew = () => {
    localStorage.setItem("shopid", "");
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

    const body = { ...state };
    let promise;
    const shopid = localStorage.getItem("shopid");
    if (shopid) {
      promise = rest.put(`/shops/${shopid}`, body);
    } else {
      if (body.hasOwnProperty("id")) {
        delete body.id;
      }
      promise = rest.post("/shops", body);
    }
    const [data, error] = await promise;
    if (error) {
      Swal.close();
      showError(err);
    }
    if (data) {
      Swal.close();

      Swal.fire({
        position: "center",
        icon: "success",
        title: data.data.message,
        showConfirmButton: false,
        timer: 5000,
      });

      if (!shopid) {
        setState({
          ...data.data.data,
        });
        localStorage.setItem("shopid", data.data.data.shopid);
      }
    }
    setLoading(false);
  };

  const confirmDelete = (shopid) => {
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
          rest.delete(`/shops/${shopid}`).then(([data, err]) => {
            Swal.close();
            if (err) {
              showError(err);
            } else {
              swalWithBootstrapButtons
                .fire("Deleted!", "Your data has been deleted.", "success")
                .then(() => {
                  router.push("/shop");
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
            <Link href="/shop">
              <a>Shop</a>
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {state.shopid ? state.shopid : "New"}
          </li>
        </ol>
      </nav>

      <div className="card" style={{ minHeight: "550px" }}>
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
                disabled={!state.shopname}
                className="btn btn-success mx-2"
                onClick={handleSave}
              >
                {state.shopid ? "Update" : "Save"}
              </button>
              <button
                disabled={!state.shopid}
                onClick={confirmDelete.bind(this, state.shopid)}
                className="btn btn-danger mx-2"
              >
                Delete
              </button>
            </div>
            <div className="col-xl-1"></div>
            <div className="col-xl-1"></div>
          </div>
          <div className="row mb-3">
            <div className="col-xl-4">
              <label className="form-label">ID</label>
              <input
                type="text"
                readOnly
                className="form-control"
                value={state.shopid}
                onChange={(e) => setState({ shopid: e.target.value })}
              />
            </div>
          </div>
          {userRole == "superadmin" ? (
            <div className="row mb-3">
              <div className="col-xl-4">
                <label className="form-label">Company</label>
                <select
                  value={state.companyid}
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #c4c4c4",
                  }}
                  className="form-select form-control"
                  onChange={(e) => {
                    const company = companyOptions.find(
                      (c) => c.companyid == e.target.value
                    );
                    let companyname = "";
                    if (company) {
                      companyname = company.companyname;
                    }
                    setState({ companyid: e.target.value, companyname });
                  }}
                >
                  {companyOptions.map((c) => (
                    <option key={c.companyid} value={c.companyid}>
                      {c.companyname}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            ""
          )}
          <div className="row mb-3">
            <div className="col-xl-4">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control required-field"
                value={state.shopname}
                onChange={(e) => setState({ shopname: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
