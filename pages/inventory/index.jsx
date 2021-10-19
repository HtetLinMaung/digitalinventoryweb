import { useRouter } from "next/router";

import Select from "react-select";
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
export default function Inventory() {
  const router = useRouter();

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
            class="input-group"
            style={{
              boxShadow: "0 0 6px 3px rgba(0,0,0,0.1)",
              borderRadius: 10,
            }}
          >
            <input
              type="text"
              class="form-control"
              placeholder="Search"
              aria-label="Username"
              aria-describedby="basic-addon1"
              style={{ borderRightStyle: "none", border: 0 }}
            />
            <span
              class="input-group-text"
              id="basic-addon1"
              style={{
                background: "#fff",
                borderRadius: "0 10px 10px 0",
                border: 0,
              }}
            >
              <svg
                style={{ width: "1rem" }}
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="search"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                class="svg-inline--fa fa-search fa-w-16 fa-3x"
              >
                <path
                  style={{ color: "grey" }}
                  fill="currentColor"
                  d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"
                  class=""
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
            onClick={() => router.push("/inventory/form")}
          >
            New Inventory
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Ref.</th>
              <th scope="col">Label</th>
              <th scope="col">Inventory Code</th>
              <th scope="col">Price</th>
              <th scope="col">In Stock</th>
              <th scope="col">Category</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">1</th>
              <td>I000001</td>
              <td>Ice Cream</td>
              <td>123456</td>
              <td>1,500.00</td>
              <td>3</td>
              <td>
                <span class="badge rounded-pill bg-primary">Sweet</span>
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
                    style={{ width: "1rem" }}
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="trash"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    class="svg-inline--fa fa-trash fa-w-14 fa-3x"
                  >
                    <path
                      style={{ color: "grey" }}
                      fill="currentColor"
                      d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"
                      class=""
                    ></path>
                  </svg>
                  <svg
                    style={{ width: "1rem" }}
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="pencil-alt"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    class="svg-inline--fa fa-pencil-alt fa-w-16 fa-3x"
                  >
                    <path
                      fill="currentColor"
                      style={{ color: "grey" }}
                      d="M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z"
                      class=""
                    ></path>
                  </svg>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">2</th>
              <td>I000002</td>
              <td>Bread</td>
              <td>123456</td>
              <td>2,000.00</td>
              <td>6</td>
              <td>
                <span class="badge rounded-pill bg-primary">Food</span>
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
                    style={{ width: "1rem" }}
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="trash"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    class="svg-inline--fa fa-trash fa-w-14 fa-3x"
                  >
                    <path
                      style={{ color: "grey" }}
                      fill="currentColor"
                      d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"
                      class=""
                    ></path>
                  </svg>
                  <svg
                    style={{ width: "1rem" }}
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="pencil-alt"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    class="svg-inline--fa fa-pencil-alt fa-w-16 fa-3x"
                  >
                    <path
                      style={{ color: "grey" }}
                      fill="currentColor"
                      d="M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z"
                      class=""
                    ></path>
                  </svg>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">3</th>
              <td>I000003</td>
              <td>Apple</td>
              <td>123456</td>
              <td>1,000.00</td>
              <td>10</td>
              <td>
                <span class="badge rounded-pill bg-primary">Fruit</span>
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
                    style={{ width: "1rem" }}
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="trash"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    class="svg-inline--fa fa-trash fa-w-14 fa-3x"
                  >
                    <path
                      style={{ color: "grey" }}
                      fill="currentColor"
                      d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"
                      class=""
                    ></path>
                  </svg>
                  <svg
                    style={{ width: "1rem" }}
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="pencil-alt"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    class="svg-inline--fa fa-pencil-alt fa-w-16 fa-3x"
                  >
                    <path
                      style={{ color: "grey" }}
                      fill="currentColor"
                      d="M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z"
                      class=""
                    ></path>
                  </svg>
                </div>
              </td>
            </tr>
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
                style={{ width: "1.3rem" }}
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="angle-double-left"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                class="svg-inline--fa fa-angle-double-left fa-w-14 fa-3x"
              >
                <path
                  style={{ color: "grey" }}
                  fill="currentColor"
                  d="M223.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L319.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L393.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34zm-192 34l136 136c9.4 9.4 24.6 9.4 33.9 0l22.6-22.6c9.4-9.4 9.4-24.6 0-33.9L127.9 256l96.4-96.4c9.4-9.4 9.4-24.6 0-33.9L201.7 103c-9.4-9.4-24.6-9.4-33.9 0l-136 136c-9.5 9.4-9.5 24.6-.1 34z"
                  class=""
                ></path>
              </svg>
              <svg
                style={{ width: "1rem", padding: "0.1rem" }}
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="angle-left"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 512"
                class="svg-inline--fa fa-angle-left fa-w-8 fa-3x"
              >
                <path
                  style={{ color: "grey" }}
                  fill="currentColor"
                  d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z"
                  class=""
                ></path>
              </svg>
              <span style={{ fontWeight: "bold" }}>1 : 1</span>
              <svg
                style={{ width: "1rem", padding: "0.1rem" }}
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="angle-right"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 512"
                class="svg-inline--fa fa-angle-right fa-w-8 fa-3x"
              >
                <path
                  style={{ color: "grey" }}
                  fill="currentColor"
                  d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"
                  class=""
                ></path>
              </svg>
              <svg
                style={{ width: "1.3rem" }}
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="angle-double-right"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                class="svg-inline--fa fa-angle-double-right fa-w-14 fa-3x"
              >
                <path
                  style={{ color: "grey" }}
                  fill="currentColor"
                  d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34zm192-34l-136-136c-9.4-9.4-24.6-9.4-33.9 0l-22.6 22.6c-9.4 9.4-9.4 24.6 0 33.9l96.4 96.4-96.4 96.4c-9.4 9.4-9.4 24.6 0 33.9l22.6 22.6c9.4 9.4 24.6 9.4 33.9 0l136-136c9.4-9.2 9.4-24.4 0-33.8z"
                  class=""
                ></path>
              </svg>
            </div>
          </div>
        </div>
        <div className="col-xl-1">
          <select class="form-select form-control card">
            {pageOptions.map((option) => (
              <option value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
