import Swal from "sweetalert2";

export const showError = (e) => {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: e.response.data.message,
    footer: '<a href="">Why do I have this issue?</a>',
  });
};
