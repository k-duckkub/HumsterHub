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

/* ── TEACHER GALLERY ──────────────────────────────────────────
   Only runs where the gallery exists; other pages have no #track.
   Invisible UI by design: drag is the interaction, the peeking
   neighbour is the affordance. Keyboard + SR access is .sr-only. */
(function () {
  const stage = document.getElementById("stage");
  const track = document.getElementById("track");
  if (!stage || !track) return;

  // photo: null renders the placeholder slot. Drop in a path to swap it.
  const TEACHERS = [
    {
      name: "ครูพาย",
      role: "สายเกมดีไซน์",
      accent: "#2c9fa2",
      stickers: ["GAME ON", "★ PLAY"],
      photo: null,
    },
    {
      name: "ครูบอส",
      role: "สายโค้ดดิ้งประจำทีม",
      accent: "#ff6b00",
      stickers: ["&lt;/&gt; CODE", "LET'S GO"],
      photo: null,
    },
    {
      name: "ครูเกม",
      role: "สายอาร์ตประจำทีม",
      accent: "#ffc52a",
      stickers: ["✎ ART", "WOW"],
      photo: null,
    },
  ];

  const SLOT = `
    <div class="photo-slot">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/>
        <path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      <b>ใส่รูปครูตรงนี้</b>
      <span>PNG พื้นใส ตัดขอบมาแล้ว</span>
    </div>`;

  const DOODLE_A = `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v5M12 16v5M3 12h5M16 12h5" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg>`;
  const DOODLE_B = `<svg viewBox="0 0 24 24" fill="none"><path d="M3 15c4-9 14-9 18-2" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"/><path d="M17 10l4 3-4 3" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const figure = (t) => t.photo
    ? `<img src="${t.photo}" alt="${t.name}">`
    : SLOT;

  track.innerHTML = TEACHERS.map((t) => `
    <article class="slide" style="--accent:${t.accent}">
      <span class="slide__blob" aria-hidden="true"></span>
      <span class="sticker sticker--a" aria-hidden="true">${t.stickers[0]}</span>
      <span class="sticker sticker--b" aria-hidden="true">${t.stickers[1]}</span>
      <span class="doodle doodle--a" aria-hidden="true">${DOODLE_A}</span>
      <span class="doodle doodle--b" aria-hidden="true">${DOODLE_B}</span>
      <div class="slide__figure">
        <div class="fig-layer fig-layer--top" aria-hidden="true">${figure(t)}</div>
        <div class="fig-layer fig-layer--bot">${figure(t)}</div>
      </div>
      <div class="slide__text">
        <h2 class="slide__name">${t.name}</h2>
        <p class="slide__role">${t.role}</p>
      </div>
    </article>`).join("");

  const slides = [...track.children];
  const live = document.getElementById("gLive");
  const reducedG = window.matchMedia("(prefers-reduced-motion: reduce)");

  let index = 0;
  let dragging = false;
  let startX = 0;
  let baseX = 0;

  // offsetWidth, not getBoundingClientRect: slides scale between .86 and 1,
  // and the visual rect would make the resting position shift with the
  // active slide — which breaks the 1:1 feel of the drag.
  const slideWidth = () => slides[0].offsetWidth;
  const restingX = (i) => stage.clientWidth / 2 - slideWidth() * (i + 0.5);

  function place(x, animate) {
    track.style.transition = animate && !reducedG.matches
      ? "transform 0.52s cubic-bezier(.22,1,.36,1)"
      : "none";
    track.style.transform = `translate3d(${x}px, 0, 0)`;
  }

  const SLASH_SHAPES = [
    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v18M3 12h18" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="6"/></svg>',
    '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2" transform="rotate(45 12 12)"/></svg>',
    '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9"/></svg>',
  ];
  const SLASH_TINTS = ["#ff6b00", "#2c9fa2", "#ffc52a", "#ffffff"];

  // Six, not a confetti cannon — the spec is explicit about restraint.
  function sparks(slide, dir) {
    for (let n = 0; n < 6; n++) {
      const s = document.createElement("span");
      s.className = "particle";
      s.innerHTML = SLASH_SHAPES[n % SLASH_SHAPES.length];
      const angle = Math.PI * (0.15 + Math.random() * 0.7) + (dir > 0 ? Math.PI : 0);
      const dist = 30 + Math.random() * 30;
      s.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      s.style.setProperty("--dy", `${(Math.random() - 0.5) * dist}px`);
      s.style.setProperty("--size", `${8 + Math.random() * 5}px`);
      s.style.setProperty("--spin", `${Math.random() * 300 - 150}deg`);
      s.style.setProperty("--tint", SLASH_TINTS[n % SLASH_TINTS.length]);
      slide.append(s);
      s.addEventListener("animationend", () => s.remove(), { once: true });
    }
  }

  const slashTimers = [];

  // Fruit-Ninja beat: squash → slash → the outgoing figure splits along a
  // diagonal and flies apart while the next teacher slides in underneath.
  function slash(fromIndex, dir) {
    const slide = slides[fromIndex];
    if (!slide || reducedG.matches) return;

    slashTimers.forEach(clearTimeout);
    slashTimers.length = 0;
    const at = (ms, fn) => slashTimers.push(setTimeout(fn, ms));

    // Clearing the timers above also kills the previous slash's cleanup, so
    // reset every slide here — otherwise a fast second swipe strands the
    // earlier slide at opacity 0 with its halves flung apart, permanently.
    slides.forEach((s) => {
      s.classList.remove("is-squash", "is-sliced");
      s.querySelectorAll(".particle").forEach((p) => p.remove());
    });
    stage.querySelectorAll(".slash-line").forEach((l) => l.remove());

    slide.style.setProperty("--dir", dir > 0 ? "1" : "-1");
    slide.classList.add("is-squash");

    at(80, () => {
      slide.classList.remove("is-squash");
      slide.classList.add("is-sliced");
      sparks(slide, dir);

      const line = document.createElement("span");
      line.className = "slash-line";
      line.style.setProperty("--dir", dir > 0 ? "1" : "-1");
      stage.append(line);
      at(220, () => line.remove());
    });

    at(700, () => slide.classList.remove("is-sliced"));
  }

  function show(i, animate = true) {
    const next = Math.max(0, Math.min(TEACHERS.length - 1, i));
    if (animate && next !== index) slash(index, next > index ? -1 : 1);
    index = next;
    place(restingX(index), animate);
    slides.forEach((s, n) => s.classList.toggle("is-active", n === index));
    live.textContent = `${TEACHERS[index].name} — ${TEACHERS[index].role} (${index + 1}/${TEACHERS.length})`;
  }

  let pendingX = null;
  let rafId = 0;

  stage.addEventListener("pointerdown", (e) => {
    // Stops the browser starting a native image-drag or text selection,
    // which otherwise swallows the gesture halfway through.
    e.preventDefault();
    dragging = true;
    startX = e.clientX;
    baseX = restingX(index);
    stage.setPointerCapture(e.pointerId);
    stage.classList.add("is-dragging");
    track.style.transition = "none";
    track.style.willChange = "transform";
  });

  // 1:1 with the pointer — drag 200px, the track moves 200px. Coalesced into
  // one write per frame; pointermove can fire well above refresh rate.
  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    pendingX = baseX + (e.clientX - startX);
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      if (pendingX !== null) track.style.transform = `translate3d(${pendingX}px, 0, 0)`;
    });
  });

  function release(e) {
    if (!dragging) return;
    dragging = false;
    pendingX = null;
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    stage.classList.remove("is-dragging");
    track.style.willChange = "auto";
    const dx = e.clientX - startX;
    const threshold = Math.min(140, window.innerWidth * 0.12);
    if (dx <= -threshold) show(index + 1);
    else if (dx >= threshold) show(index - 1);
    else show(index);
  }

  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);

  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); show(index - 1); }
  });

  // Trackpad horizontal swipe. Vertical wheel is left to the browser.
  let wheelLock = false;
  stage.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
    e.preventDefault();
    if (wheelLock) return;
    wheelLock = true;
    show(index + (e.deltaX > 0 ? 1 : -1));
    setTimeout(() => (wheelLock = false), 420);
  }, { passive: false });

  document.getElementById("gPrev").addEventListener("click", () => show(index - 1));
  document.getElementById("gNext").addEventListener("click", () => show(index + 1));

  window.addEventListener("resize", () => show(index, false));
  show(0, false);
})();
