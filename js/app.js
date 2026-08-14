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

/* ── ACTIVITY PICKER ─────────────────────────────────────────
   Only runs on the Thank You page; the summary page has no #boxes. */
(function () {
  const boxes = document.getElementById("boxes");
  const reveal = document.getElementById("reveal");
  const act = document.getElementById("act");
  if (!boxes || !reveal || !act) return;

  // Activity 1 is the real camp; 2 and 3 are placeholders awaiting real data.
  const ACTIVITIES = [
    {
      badge: "แนะนำ",
      title: "SciGame Lab Camp",
      hook: "ค่ายวิทย์ + โค้ดดิ้ง + เกม",
      desc: "เปิดโลกวิทยาศาสตร์และเทคโนโลยีผ่านการลงมือทำจริง สร้างเกม ทดลองวิทย์ และพัฒนาไอเดียสุดล้ำไปกับเพื่อนๆ",
      date: "14 – 16 ส.ค.",
      place: "เรียนออนไลน์ผ่าน Discord",
      link: "index.html",
    },
    {
      badge: "เร็วๆ นี้",
      title: "กิจกรรมที่ 2 (ตัวอย่าง)",
      hook: "รอข้อมูลจริงจากทีมงาน",
      desc: "ข้อความนี้เป็นตัวอย่างไว้ทดสอบระบบเลื่อนกิจกรรมเท่านั้น เมื่อมีข้อมูลกิจกรรมจริงแล้วสามารถนำมาแทนที่ได้ทันที",
      date: "รอประกาศ",
      place: "รอประกาศ",
      link: "#",
    },
    {
      badge: "เร็วๆ นี้",
      title: "กิจกรรมที่ 3 (ตัวอย่าง)",
      hook: "รอข้อมูลจริงจากทีมงาน",
      desc: "ข้อความนี้เป็นตัวอย่างไว้ทดสอบระบบเลื่อนกิจกรรมเท่านั้น เมื่อมีข้อมูลกิจกรรมจริงแล้วสามารถนำมาแทนที่ได้ทันที",
      date: "รอประกาศ",
      place: "รอประกาศ",
      link: "#",
    },
  ];

  const field = {
    badge: document.getElementById("act-badge"),
    title: document.getElementById("act-title"),
    hook: document.getElementById("act-hook"),
    desc: document.getElementById("act-desc"),
    date: document.getElementById("act-date"),
    place: document.getElementById("act-place"),
    link: document.getElementById("act-link"),
  };

  const dots = document.getElementById("dots");
  const boxEls = [...boxes.querySelectorAll(".box")];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let current = -1;
  let busy = false;

  function paint(i) {
    const a = ACTIVITIES[i];
    field.badge.textContent = a.badge;
    field.title.textContent = a.title;
    field.hook.textContent = a.hook;
    field.desc.textContent = a.desc;
    field.date.textContent = a.date;
    field.place.textContent = a.place;
    field.link.setAttribute("href", a.link);

    boxEls.forEach((b, n) => {
      const open = n === i;
      b.classList.toggle("is-open", open);
      b.setAttribute("aria-expanded", String(open));
      b.querySelector(".box__chip").lastChild.textContent = open ? " เปิดแล้ว! " : " คลิกเพื่อเปิด ";
    });

    [...dots.children].forEach((d, n) =>
      d.setAttribute("aria-current", String(n === i))
    );
    current = i;
  }

  ACTIVITIES.forEach((a, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.setAttribute("role", "tab");
    d.setAttribute("aria-label", a.title);
    d.setAttribute("aria-current", "false");
    d.addEventListener("click", () => go(i));
    dots.append(d);
  });

  function animate(el, cls, done) {
    if (reduced.matches) return done();
    el.classList.add(cls);
    el.addEventListener(
      "animationend",
      () => {
        el.classList.remove(cls);
        done();
      },
      { once: true }
    );
  }

  // Swap between activities: slide + scale, direction-aware.
  function go(i) {
    if (busy || i === current) return;
    if (current === -1) return open(i);
    busy = true;
    const forward = i > current;
    animate(act, forward ? "slide-out-left" : "slide-out-right", () => {
      paint(i);
      animate(act, forward ? "slide-in-right" : "slide-in-left", () => {
        busy = false;
      });
    });
  }

  // First open: press → overshoot → lid lifts → card rises from the box.
  function open(i) {
    if (busy) return;
    busy = true;
    const box = boxEls[i];
    const first = reveal.hidden;

    if (!first) return finishOpen(i, box);

    animate(box, "is-popping", () => {});
    setTimeout(
      () => finishOpen(i, box),
      reduced.matches ? 0 : 260
    );
  }

  function finishOpen(i, box) {
    reveal.hidden = false;
    paint(i);

    // Rise from the opened box rather than from the middle of the page.
    const bb = box.getBoundingClientRect();
    const rb = act.getBoundingClientRect();
    const origin = ((bb.left + bb.width / 2 - rb.left) / rb.width) * 100;
    act.style.transformOrigin = `${Math.max(0, Math.min(100, origin))}% top`;

    animate(act, "is-entering", () => {
      busy = false;
    });
    if (reduced.matches) busy = false;
  }

  boxEls.forEach((b, i) => b.addEventListener("click", () => (reveal.hidden ? open(i) : go(i))));

  document.getElementById("prev").addEventListener("click", () =>
    go((current - 1 + ACTIVITIES.length) % ACTIVITIES.length)
  );
  document.getElementById("next").addEventListener("click", () =>
    go((current + 1) % ACTIVITIES.length)
  );

  // Drag on desktop, swipe on touch.
  let startX = null;
  act.addEventListener("pointerdown", (e) => {
    startX = e.clientX;
  });
  act.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) < 60) return;
    go(
      dx < 0
        ? (current + 1) % ACTIVITIES.length
        : (current - 1 + ACTIVITIES.length) % ACTIVITIES.length
    );
  });
})();
