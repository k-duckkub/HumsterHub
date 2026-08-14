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

  // Brand shapes for the burst — plus, ring, diamond, dot.
  const SHAPES = [
    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v18M3 12h18" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="6"/></svg>',
    '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2" transform="rotate(45 12 12)"/></svg>',
    '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9"/></svg>',
  ];
  const TINTS = ["#ff6b00", "#2c9fa2", "#ffc52a", "#ffffff"];

  // Ten, not fifty — more than this and it reads as a gacha pull.
  function burst(slot) {
    const layer = slot.querySelector(".box__burst");
    if (!layer) return;
    layer.classList.add("is-boom");
    layer.addEventListener(
      "animationend",
      () => layer.classList.remove("is-boom"),
      { once: true }
    );

    for (let n = 0; n < 10; n++) {
      const p = document.createElement("span");
      p.className = "particle";
      p.innerHTML = SHAPES[n % SHAPES.length];
      const angle = (n / 10) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 30 + Math.random() * 40;
      p.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      p.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      p.style.setProperty("--size", `${7 + Math.random() * 6}px`);
      p.style.setProperty("--spin", `${Math.random() * 360 - 180}deg`);
      p.style.setProperty("--tint", TINTS[n % TINTS.length]);
      layer.append(p);
      p.addEventListener("animationend", () => p.remove(), { once: true });
    }
  }

  // First open: ยุบ → อัดพลัง → BOOM → ดำเปลี่ยนเป็นส้ม, then the card.
  // Beats run on timers rather than chained animationend so a dropped event
  // cannot strand the box mid-sequence.
  const timers = [];
  function open(i) {
    if (busy) return;
    busy = true;
    const box = boxEls[i];
    const slot = box.closest(".box-slot");

    if (reduced.matches) return finishOpen(i, box);

    timers.forEach(clearTimeout);
    timers.length = 0;
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));

    box.classList.add("is-pressing");

    at(140, () => {
      box.classList.remove("is-pressing");
      box.classList.add("is-charging");
    });

    at(350, () => {
      box.classList.remove("is-charging");
      box.classList.add("is-boom");
      burst(slot);
    });

    // Colour lands only after the boom — holding black until here is the
    // whole point of the sequence.
    at(500, () => {
      box.classList.remove("is-boom");
      paint(i);
    });

    at(650, () => finishOpen(i, box));
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
