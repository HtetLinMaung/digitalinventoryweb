export default function Inventory() {
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
      <div className="card">
        <div className="card-body">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="col-xxl-1">a</div>
            <div className="col-xxl-1 col-xl-2">
              <button className="btn btn-primary">New Inventory</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
