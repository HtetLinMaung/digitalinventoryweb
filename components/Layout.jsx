import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useData } from "../hooks/custom-hooks";

const routes = ["/login", "/otp"];

const initState = {
  companyname: "",
  username: "",
  profile: "",
  role: "",
};

export default function Layout({ children }) {
  const router = useRouter();
  const [state, setState] = useData(initState);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const profile = localStorage.getItem("profile");
    const companyname = localStorage.getItem("companyname");
    const role = localStorage.getItem("role");
    setState({ username, profile, companyname, role });
    const token = localStorage.getItem("token");
    if (!routes.includes(router.route) && !token) {
      router.push("/login");
    } else if (token && routes.includes(router.route)) {
      router.push("/");
    }
  }, [router.route]);

  const handleSignOut = (e) => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div>
      {!routes.includes(router.route) ? (
        <nav className="__navbar">
          <ul className="__navbar-nav">
            <li className="logo">
              <a href="#" className="__nav-link">
                <span className="__link-text logo-text">Techhype</span>
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fad"
                  data-icon="angle-double-right"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="svg-inline--fa fa-angle-double-right fa-w-14 fa-5x"
                >
                  <g className="fa-group">
                    <path
                      fill="currentColor"
                      d="M224 273L88.37 409a23.78 23.78 0 0 1-33.8 0L32 386.36a23.94 23.94 0 0 1 0-33.89l96.13-96.37L32 159.73a23.94 23.94 0 0 1 0-33.89l22.44-22.79a23.78 23.78 0 0 1 33.8 0L223.88 239a23.94 23.94 0 0 1 .1 34z"
                      className="fa-secondary"
                    ></path>
                    <path
                      fill="currentColor"
                      d="M415.89 273L280.34 409a23.77 23.77 0 0 1-33.79 0L224 386.26a23.94 23.94 0 0 1 0-33.89L320.11 256l-96-96.47a23.94 23.94 0 0 1 0-33.89l22.52-22.59a23.77 23.77 0 0 1 33.79 0L416 239a24 24 0 0 1-.11 34z"
                      className="fa-primary"
                    ></path>
                  </g>
                </svg>
              </a>
            </li>

            {["admin", "superadmin"].includes(state.role) ? (
              <li className="__nav-item">
                <Link href="/user-setup">
                  <a className="__nav-link">
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fas"
                      data-icon="users"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 512"
                      className="svg-inline--fa fa-users fa-w-20 fa-3x"
                    >
                      <path
                        fill="currentColor"
                        d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4z"
                        className="fa-primary"
                      ></path>
                    </svg>

                    <span className="__link-text">User Setup</span>
                  </a>
                </Link>
              </li>
            ) : (
              ""
            )}

            <li className="__nav-item">
              <Link href="/inventory">
                <a className="__nav-link">
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="boxes"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                    className="svg-inline--fa fa-boxes fa-w-18 fa-3x"
                  >
                    <path
                      fill="currentColor"
                      d="M560 288h-80v96l-32-21.3-32 21.3v-96h-80c-8.8 0-16 7.2-16 16v192c0 8.8 7.2 16 16 16h224c8.8 0 16-7.2 16-16V304c0-8.8-7.2-16-16-16zm-384-64h224c8.8 0 16-7.2 16-16V16c0-8.8-7.2-16-16-16h-80v96l-32-21.3L256 96V0h-80c-8.8 0-16 7.2-16 16v192c0 8.8 7.2 16 16 16zm64 64h-80v96l-32-21.3L96 384v-96H16c-8.8 0-16 7.2-16 16v192c0 8.8 7.2 16 16 16h224c8.8 0 16-7.2 16-16V304c0-8.8-7.2-16-16-16z"
                      className="fa-primary"
                    ></path>
                  </svg>
                  <span className="__link-text">Inventory</span>
                </a>
              </Link>
            </li>

            <li className="__nav-item">
              <Link href="/">
                <a className="__nav-link">
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="chart-pie"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 544 512"
                    className="svg-inline--fa fa-chart-pie fa-w-17 fa-3x"
                  >
                    <path
                      fill="currentColor"
                      d="M527.79 288H290.5l158.03 158.03c6.04 6.04 15.98 6.53 22.19.68 38.7-36.46 65.32-85.61 73.13-140.86 1.34-9.46-6.51-17.85-16.06-17.85zm-15.83-64.8C503.72 103.74 408.26 8.28 288.8.04 279.68-.59 272 7.1 272 16.24V240h223.77c9.14 0 16.82-7.68 16.19-16.8zM224 288V50.71c0-9.55-8.39-17.4-17.84-16.06C86.99 51.49-4.1 155.6.14 280.37 4.5 408.51 114.83 513.59 243.03 511.98c50.4-.63 96.97-16.87 135.26-44.03 7.9-5.6 8.42-17.23 1.57-24.08L224 288z"
                      className="fa-primary"
                    ></path>
                  </svg>
                  <span className="__link-text">Dashboard</span>
                </a>
              </Link>
            </li>

            <li className="__nav-item">
              <Link href="/inventory-activity">
                <a className="__nav-link">
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="tasks"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="svg-inline--fa fa-tasks fa-w-16 fa-3x"
                  >
                    <path
                      fill="currentColor"
                      d="M139.61 35.5a12 12 0 0 0-17 0L58.93 98.81l-22.7-22.12a12 12 0 0 0-17 0L3.53 92.41a12 12 0 0 0 0 17l47.59 47.4a12.78 12.78 0 0 0 17.61 0l15.59-15.62L156.52 69a12.09 12.09 0 0 0 .09-17zm0 159.19a12 12 0 0 0-17 0l-63.68 63.72-22.7-22.1a12 12 0 0 0-17 0L3.53 252a12 12 0 0 0 0 17L51 316.5a12.77 12.77 0 0 0 17.6 0l15.7-15.69 72.2-72.22a12 12 0 0 0 .09-16.9zM64 368c-26.49 0-48.59 21.5-48.59 48S37.53 464 64 464a48 48 0 0 0 0-96zm432 16H208a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h288a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H208a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h288a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H208a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h288a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"
                      className="fa-primary"
                    ></path>
                  </svg>
                  <span className="__link-text">Inventory In/Out</span>
                </a>
              </Link>
            </li>

            <li className="__nav-item">
              <Link href="/shop">
                <a className="__nav-link">
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="far"
                    data-icon="store-alt"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 512"
                    class="svg-inline--fa fa-store-alt fa-w-20 fa-3x"
                  >
                    <path
                      fill="currentColor"
                      d="M635.7 176.1l-91.4-160C538.6 6.2 528 0 516.5 0h-393C112 0 101.4 6.2 95.7 16.1l-91.4 160C-7.9 197.5 7.4 224 32 224h32v252.8c0 19.4 14.3 35.2 32 35.2h256c17.7 0 32-15.8 32-35.2V224h144v272c0 8.8 7.2 16 16 16h16c8.8 0 16-7.2 16-16V224h32c24.6 0 39.9-26.5 27.7-47.9zM336 464H112v-95.8h224V464zm0-143.8H112V224h224v96.2zM59.6 176l73.1-128h374.5l73.1 128H59.6z"
                      className="fa-primary"
                    ></path>
                  </svg>
                  <span className="__link-text">Shop Setup</span>
                </a>
              </Link>
            </li>

            <li className="__nav-item" id="themeButton">
              <a href="#" className="__nav-link">
                <svg
                  className="theme-icon"
                  id="lightIcon"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fad"
                  data-icon="moon-stars"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="svg-inline--fa fa-moon-stars fa-w-16 fa-7x"
                >
                  <g className="fa-group">
                    <path
                      fill="currentColor"
                      d="M320 32L304 0l-16 32-32 16 32 16 16 32 16-32 32-16zm138.7 149.3L432 128l-26.7 53.3L352 208l53.3 26.7L432 288l26.7-53.3L512 208z"
                      className="fa-secondary"
                    ></path>
                    <path
                      fill="currentColor"
                      d="M332.2 426.4c8.1-1.6 13.9 8 8.6 14.5a191.18 191.18 0 0 1-149 71.1C85.8 512 0 426 0 320c0-120 108.7-210.6 227-188.8 8.2 1.6 10.1 12.6 2.8 16.7a150.3 150.3 0 0 0-76.1 130.8c0 94 85.4 165.4 178.5 147.7z"
                      className="fa-primary"
                    ></path>
                  </g>
                </svg>
                {/* <svg
            className="theme-icon"
            id="solarIcon"
            aria-hidden="true"
            focusable="false"
            data-prefix="fad"
            data-icon="sun"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="svg-inline--fa fa-sun fa-w-16 fa-7x"
          >
            <g className="fa-group">
              <path
                fill="currentColor"
                d="M502.42 240.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.41-94.8a17.31 17.31 0 0 0-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4a17.31 17.31 0 0 0 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.41-33.5 47.3 94.7a17.31 17.31 0 0 0 31 0l47.31-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3a17.33 17.33 0 0 0 .2-31.1zm-155.9 106c-49.91 49.9-131.11 49.9-181 0a128.13 128.13 0 0 1 0-181c49.9-49.9 131.1-49.9 181 0a128.13 128.13 0 0 1 0 181z"
                className="fa-secondary"
              ></path>
              <path
                fill="currentColor"
                d="M352 256a96 96 0 1 1-96-96 96.15 96.15 0 0 1 96 96z"
                className="fa-primary"
              ></path>
            </g>
          </svg>
          <svg
            className="theme-icon"
            id="darkIcon"
            aria-hidden="true"
            focusable="false"
            data-prefix="fad"
            data-icon="sunglasses"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            className="svg-inline--fa fa-sunglasses fa-w-18 fa-7x"
          >
            <g className="fa-group">
              <path
                fill="currentColor"
                d="M574.09 280.38L528.75 98.66a87.94 87.94 0 0 0-113.19-62.14l-15.25 5.08a16 16 0 0 0-10.12 20.25L395.25 77a16 16 0 0 0 20.22 10.13l13.19-4.39c10.87-3.63 23-3.57 33.15 1.73a39.59 39.59 0 0 1 20.38 25.81l38.47 153.83a276.7 276.7 0 0 0-81.22-12.47c-34.75 0-74 7-114.85 26.75h-73.18c-40.85-19.75-80.07-26.75-114.85-26.75a276.75 276.75 0 0 0-81.22 12.45l38.47-153.8a39.61 39.61 0 0 1 20.38-25.82c10.15-5.29 22.28-5.34 33.15-1.73l13.16 4.39A16 16 0 0 0 180.75 77l5.06-15.19a16 16 0 0 0-10.12-20.21l-15.25-5.08A87.95 87.95 0 0 0 47.25 98.65L1.91 280.38A75.35 75.35 0 0 0 0 295.86v70.25C0 429 51.59 480 115.19 480h37.12c60.28 0 110.38-45.94 114.88-105.37l2.93-38.63h35.76l2.93 38.63c4.5 59.43 54.6 105.37 114.88 105.37h37.12C524.41 480 576 429 576 366.13v-70.25a62.67 62.67 0 0 0-1.91-15.5zM203.38 369.8c-2 25.9-24.41 46.2-51.07 46.2h-37.12C87 416 64 393.63 64 366.11v-37.55a217.35 217.35 0 0 1 72.59-12.9 196.51 196.51 0 0 1 69.91 12.9zM512 366.13c0 27.5-23 49.87-51.19 49.87h-37.12c-26.69 0-49.1-20.3-51.07-46.2l-3.12-41.24a196.55 196.55 0 0 1 69.94-12.9A217.41 217.41 0 0 1 512 328.58z"
                className="fa-secondary"
              ></path>
              <path
                fill="currentColor"
                d="M64.19 367.9c0-.61-.19-1.18-.19-1.8 0 27.53 23 49.9 51.19 49.9h37.12c26.66 0 49.1-20.3 51.07-46.2l3.12-41.24c-14-5.29-28.31-8.38-42.78-10.42zm404-50l-95.83 47.91.3 4c2 25.9 24.38 46.2 51.07 46.2h37.12C489 416 512 393.63 512 366.13v-37.55a227.76 227.76 0 0 0-43.85-10.66z"
                className="fa-primary"
              ></path>
            </g>
          </svg> */}
                <span className="__link-text">Themify</span>
              </a>
            </li>
          </ul>
        </nav>
      ) : (
        ""
      )}
      {!routes.includes(router.route) ? (
        <nav className="top__navbar">
          <ul className="top__navbar-nav">
            {/* <li className="top__nav-item">
              <a href="#" className="top__nav-link">
                <span className="top__link-text">Projects</span>
              </a>
            </li>
            <li className="top__nav-item">
              <a href="#" className="top__nav-link">
                <span className="top__link-text">Planing</span>
              </a>
            </li>
            <li className="top__nav-item">
              <a href="#" className="top__nav-link">
                <span className="top__link-text">Calendar</span>
              </a>
            </li>
            <li className="top__nav-item">
              <a href="#" className="top__nav-link">
                <span className="top__link-text">Team</span>
              </a>
            </li> */}
            <li className="top__nav-item" style={{ fontSize: "1.3rem" }}>
              {state.companyname}
            </li>

            <li className="top__nav-item">
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="far"
                data-icon="bell"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                className="svg-inline--fa fa-bell fa-w-14 fa-3x d-none d-sm-block"
              >
                <path
                  fill="currentColor"
                  d="M439.39 362.29c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71zM67.53 368c21.22-27.97 44.42-74.33 44.53-159.42 0-.2-.06-.38-.06-.58 0-61.86 50.14-112 112-112s112 50.14 112 112c0 .2-.06.38-.06.58.11 85.1 23.31 131.46 44.53 159.42H67.53zM224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64z"
                  className=""
                ></path>
              </svg>

              {state.profile ? (
                <div className="dropdown">
                  <a
                    className="top__nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    id="dropdownMenuLink"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img src={state.profile} alt="profile" className="avatar" />
                  </a>

                  <ul
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuLink"
                  >
                    <li>
                      <a className="dropdown-item" onClick={handleSignOut}>
                        Sign Out
                      </a>
                    </li>
                    {/* <li>
                     <a className="dropdown-item" href="#">
                       Another action
                     </a>
                   </li>
                   <li>
                     <a className="dropdown-item" href="#">
                       Something else here
                     </a>
                   </li> */}
                  </ul>
                </div>
              ) : (
                <div className="dropdown">
                  <a
                    className="top__nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    id="dropdownMenuLink"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <svg
                      style={{ width: "2.5rem", margin: 0 }}
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fad"
                      data-icon="user-circle"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 496 512"
                      className="svg-inline--fa fa-user-circle fa-w-16 fa-3x"
                    >
                      <g className="fa-group">
                        <path
                          style={{ color: "#9ad6df" }}
                          fill="currentColor"
                          d="M248,8C111,8,0,119,0,256S111,504,248,504,496,393,496,256,385,8,248,8Zm0,96a88,88,0,1,1-88,88A88,88,0,0,1,248,104Zm0,344a191.61,191.61,0,0,1-146.5-68.2C120.3,344.4,157.1,320,200,320a24.76,24.76,0,0,1,7.1,1.1,124.67,124.67,0,0,0,81.8,0A24.76,24.76,0,0,1,296,320c42.9,0,79.7,24.4,98.5,59.8A191.61,191.61,0,0,1,248,448Z"
                        ></path>
                        <path
                          style={{ color: "#3aaabf" }}
                          fill="currentColor"
                          d="M248,280a88,88,0,1,0-88-88A88,88,0,0,0,248,280Zm48,40a24.76,24.76,0,0,0-7.1,1.1,124.67,124.67,0,0,1-81.8,0A24.76,24.76,0,0,0,200,320c-42.9,0-79.7,24.4-98.5,59.8,68.07,80.91,188.84,91.32,269.75,23.25A192,192,0,0,0,394.5,379.8C375.7,344.4,338.9,320,296,320Z"
                        ></path>
                      </g>
                    </svg>
                  </a>

                  <ul
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuLink"
                  >
                    <li>
                      <a className="dropdown-item" onClick={handleSignOut}>
                        Sign Out
                      </a>
                    </li>
                    {/* <li>
                    <a className="dropdown-item" href="#">
                      Another action
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Something else here
                    </a>
                  </li> */}
                  </ul>
                </div>
              )}

              <div className="dropdown">
                <a
                  className="top__nav-link dropdown-toggle d-none d-sm-block"
                  href="#"
                  role="button"
                  id="dropdownMenuLink"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span className="avatar-text">{state.username}</span>
                </a>

                <ul
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuLink"
                >
                  <li>
                    <a className="dropdown-item" onClick={handleSignOut}>
                      Sign Out
                    </a>
                  </li>
                  {/* <li>
                    <a className="dropdown-item" href="#">
                      Another action
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Something else here
                    </a>
                  </li> */}
                </ul>
              </div>
            </li>
          </ul>
        </nav>
      ) : (
        ""
      )}

      <main className={!routes.includes(router.route) ? "" : "login"}>
        {children}
      </main>
    </div>
  );
}
