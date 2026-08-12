const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

document.querySelectorAll("[data-copy]").forEach((el) => {
  el.addEventListener("click", async () => {
    const value = el.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      showToast(`คัดลอก ${value} แล้ว`);
    } catch {
      showToast(value);
    }
  });
});
