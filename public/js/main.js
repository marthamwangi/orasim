$(".toggle-password").click(function () {
  $(this).toggleClass("bi-eye bi-eye-slash");
  var input = $("#passInput");
  if (input.attr("type") === "password") {
    input.attr("type", "text");
  } else {
    input.attr("type", "password");
  }
});

