window.loginWithGoogle = function () {
  const checkbox = document.getElementById("agreeCheckbox");
  if (!checkbox?.checked) {
    alert("Harap centang dulu syarat & ketentuan.");
    return;
  }

  if (!window.plugins || !window.plugins.googleplus) {
    alert("❌ Plugin GooglePlus tidak aktif atau belum siap.");
    return;
  }

  window.plugins.googleplus.login(
    {
      webClientId:
        "1002312804738-7hlqdgbs2n0m5dcso852onr8no9qoq27.apps.googleusercontent.com",
      // Ganti jika perlu
      offline: true,
      scopes: "profile email",
    },
    function (userData) {
      alert("✅ Login Berhasil:\n" + JSON.stringify(userData));
      window.location.href = "chat.html";
    },
    function (error) {
      alert("❌ Login Gagal:\n" + JSON.stringify(error));
    }
  );
};
