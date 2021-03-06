import { useRouter } from "next/router";
import Swal from "sweetalert2";
import checkToken from "../../commons/check-token";
import { useData } from "../../hooks/custom-hooks";
import { showError } from "../../utils/alert";
import iam from "../../utils/iam-rest";
import Head from "next/head";
import config from "../../appconfig.json";

const initState = {
  userid: "",
  password: "",
};

export default function Login() {
  const router = useRouter();
  const [state, setState] = useData(initState);

  const loginHandler = async () => {
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
    const [data, err] = await iam.post("/auth/login", {
      appid: "digitalinventory",
      userid: state.userid,
      password: state.password,
    });
    Swal.close();
    if (err) {
      showError(err);
    } else {
      if (data.data.token) {
        localStorage.setItem("iamtoken", data.data.token);
        localStorage.setItem("profile", data.data.profile);
        await checkToken();
        router.push("/");
      } else {
        localStorage.setItem("otpsession", data.data.otpsession);
        localStorage.setItem("userid", state.userid);
        router.push("/otp");
      }
    }
  };

  return (
    <div
      className="center-children"
      style={{
        height: "100vh",
        backgroundSize: "cover",
        backgroundImage: "url('/login-wallpaper.jpg')",
      }}
    >
      <Head>
        <title>{config.version}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className="card"
        style={{
          width: "30%",
          padding: "3rem",
          width: "400px",
          borderRadius: "25px",
        }}
      >
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: "bolder",
            color: "#211669",
            marginBottom: "3rem",
          }}
        >
          Log In to Digital Inventory
        </h1>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "14px" }}>User ID</label>
          <input
            name="username"
            value={state.userid}
            onChange={(e) => setState({ userid: e.target.value })}
            style={{ fontSize: "16px", marginTop: ".5rem" }}
            type="text"
            className="form-control"
          />
        </div>
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ fontSize: "14px" }}>Password</label>
          <input
            name="password"
            value={state.password}
            onChange={(e) => setState({ password: e.target.value })}
            onKeyPress={(e) => {
              console.log(e);
              if (e.key == "Enter") {
                loginHandler();
              }
            }}
            style={{ fontSize: "16px", marginTop: ".5rem" }}
            type="password"
            className="form-control"
          />
        </div>
        <button
          disabled={!state.userid || !state.password}
          onClick={loginHandler}
          className="btn btn-primary"
          style={{ fontSize: "14px", marginBottom: "2rem" }}
        >
          Sign In
        </button>
        <div
          style={{
            color: "#c7c4d7",
            fontWeight: "bold",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          Forgot your password?
        </div>
      </div>
    </div>
  );
}
