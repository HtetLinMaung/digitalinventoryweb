import Link from "next/link";

export default function InventoryForm() {
  return (
    <div>
      <nav
        style={{
          "--bs-breadcrumb-divider": "'>'",
        }}
        aria-label="breadcrumb"
      >
        <ol className="breadcrumb">
          <li class="breadcrumb-item">
            <Link href="/inventory">
              <a>Inventory</a>
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            New
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
              >
                New
              </button>
              <button className="btn btn-success mx-2">Save</button>
              <button className="btn btn-danger mx-2">Delete</button>
            </div>
            <div className="col-xl-1"></div>
            <div className="col-xl-1"></div>
          </div>

          <div className="row mb-3">
            <div className="col-xl-3">
              <label className="form-label">Ref.</label>
              <input type="text" readOnly className="form-control" />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-xl-3">
              <label className="form-label">Label</label>
              <input type="text" className="form-control required-field" />
            </div>
            <div className="col-xl-3">
              <label className="form-label">Inventory Code</label>
              <input type="text" className="form-control required-field" />
            </div>
          </div>
          <div className="row mb-3" style={{ alignItems: "flex-end" }}>
            <div className="col-xl-2">
              <label className="form-label">Price</label>
              <input
                type="text"
                className="form-control price-control required-field"
              />
            </div>
            <div className="col-xl-2">
              <label className="form-label">Initial Counts</label>
              <div class="input-group" style={{ borderRadius: "10px" }}>
                <span
                  class="input-group-text"
                  id="basic-addon1"
                  style={{ borderRadius: "10px 0 0 10px", background: "#fff" }}
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
                    class="svg-inline--fa fa-minus fa-w-12 fa-3x"
                  >
                    <path
                      fill="currentColor"
                      d="M376 232H8c-4.42 0-8 3.58-8 8v32c0 4.42 3.58 8 8 8h368c4.42 0 8-3.58 8-8v-32c0-4.42-3.58-8-8-8z"
                      class=""
                    ></path>
                  </svg>
                </span>
                <input
                  type="text"
                  class="form-control"
                  aria-describedby="basic-addon1"
                  style={{ textAlign: "center" }}
                />
                <span
                  class="input-group-text"
                  id="basic-addon1"
                  style={{ borderRadius: "0 10px 10px 0", background: "#fff" }}
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
                    class="svg-inline--fa fa-plus fa-w-12 fa-3x"
                  >
                    <path
                      fill="currentColor"
                      d="M376 232H216V72c0-4.42-3.58-8-8-8h-32c-4.42 0-8 3.58-8 8v160H8c-4.42 0-8 3.58-8 8v32c0 4.42 3.58 8 8 8h160v160c0 4.42 3.58 8 8 8h32c4.42 0 8-3.58 8-8V280h160c4.42 0 8-3.58 8-8v-32c0-4.42-3.58-8-8-8z"
                      class=""
                    ></path>
                  </svg>
                </span>
              </div>
            </div>
            <div className="col-xl-2">
              <div
                class="btn-group"
                role="group"
                aria-label="Basic radio toggle button group"
              >
                <input
                  type="radio"
                  class="btn-check"
                  name="btnradio"
                  id="btnradio1"
                  autocomplete="off"
                  checked
                />
                <label class="btn btn-outline-primary" for="btnradio1">
                  Finite
                </label>

                <input
                  type="radio"
                  class="btn-check"
                  name="btnradio"
                  id="btnradio2"
                  autocomplete="off"
                />
                <label class="btn btn-outline-primary" for="btnradio2">
                  Infinite
                </label>
              </div>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-xl-2">
              <label className="form-label">Remaining</label>
              <input type="text" className="form-control" readOnly />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-xl-3">
              <label className="form-label">Tag</label>
              <input type="text" className="form-control" />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-xl-5">
              <label className="form-label">Remark</label>
              <textarea className="form-control"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
