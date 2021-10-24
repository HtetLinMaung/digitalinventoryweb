import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import checkToken from "../../commons/check-token";
import { showError } from "../../utils/alert";
import iam from "../../utils/iam-rest";

const formatTimer = (time) => {
  if (time <= 0) {
    return "00 : 00";
  }
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;
  return `0${minutes} : ${seconds < 10 ? "0" + seconds : seconds}`;
};

export default function Otp() {
  const router = useRouter();
  const [otpcode, setOtpcode] = useState("");
  const [intervalid, setIntervalid] = useState(null);

  useEffect(() => {
    let i = 120;
    const iid = setInterval(() => {
      if (i < 0) {
        return clearInterval(intervalid);
      }
      const element = document.getElementById("timer");
      if (element) {
        element.innerHTML = formatTimer(i--);
      }
    }, 1000);
    setIntervalid(iid);
  }, []);

  const resendOtp = async () => {
    setOtpcode("");
    const [data, err] = await iam.post("/auth/resend-otp", {
      otpsession: localStorage.getItem("otpsession") || "",
      appid: "digitalinventory",
      userid: localStorage.getItem("userid") || "",
    });

    if (err) {
      showError(err);
    } else {
      let i = 120;
      const iid = setInterval(() => {
        if (i < 0) {
          return clearInterval(intervalid);
        }
        const element = document.getElementById("timer");
        if (element) {
          element.innerHTML = formatTimer(i--);
        }
      }, 1000);
      setIntervalid(iid);
      localStorage.setItem("otpsession", data.data.otpsession);
    }
  };

  const checkOtp = async () => {
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
    const [data, err] = await iam.post("/auth/check-otp", {
      otpsession: localStorage.getItem("otpsession") || "",
      otpcode,
      appid: "digitalinventory",
      userid: localStorage.getItem("userid") || "",
    });
    Swal.close();
    if (err) {
      showError(err);
    } else {
      clearInterval(intervalid);
      localStorage.setItem("iamtoken", data.data.token);
      await checkToken();
      router.push("/");
    }
  };

  useEffect(() => {
    if (otpcode.length == 6) {
      checkOtp();
    }
  }, [otpcode]);

  const handleChange = (e, i) => {
    const elements = document.querySelectorAll(".otp-input");
    setOtpcode([...elements].map((e) => e.value).join(""));
    if (i < elements.length - 1) {
      elements[i + 1].focus();
    }
  };

  return (
    <div className="center-children vh-100">
      <div style={{ width: "375px" }}>
        <h1 className="text-center mb-5" style={{ color: "#211669" }}>
          OTP Verification
        </h1>
        <h1 className="text-center mb-5" id="timer">
          02 : 00
        </h1>
        <div className="d-flex justify-space-between mb-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <input
              key={n}
              type="text"
              className="form-control otp-input"
              maxLength={1}
              onChange={(e) => handleChange(e, n - 1)}
            />
          ))}
        </div>
        <div
          onClick={resendOtp}
          className="text-center  mb-5"
          style={{
            fontSize: 12,
            textDecoration: "underline",
            cursor: "pointer",
            color: "#211669",
            fontWeight: "bold",
          }}
        >
          Resend Code
        </div>
        {/* <div className="d-flex">
          <button
            className="btn btn-primary"
            style={{ width: "40%", fontSize: "14px", margin: "auto" }}
          >
            Verify
          </button>
        </div> */}
      </div>
    </div>
  );
}
