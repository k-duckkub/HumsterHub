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
      title: "SciGameLab Camp",
      hook: "ค่ายวิทย์ + โค้ดดิ้ง + เกม",
      desc: "เปิดโลกวิทยาศาสตร์และเทคโนโลยีผ่านการลงมือทำจริง สร้างเกม ทดลองวิทย์ และพัฒนาไอเดียสุดล้ำไปกับเพื่อนๆ",
      date: "14–16 ส.ค.",
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

  // photo: null renders the silhouette. Drop in a path to swap it.
  const TEACHERS = [
    {
      name: "ครูพาย",
      role: "สายเกมดีไซน์",
      accent: "#2c9fa2", ramp: ["#d8efee", "#7fcfcd", "#2c9fa2"],
      sticker: "GAME DEV",
      doodles: ["pad", "heart", "star"],
      photo: null,
    },
    {
      name: "ครูบอส",
      role: "สายโค้ดดิ้งประจำทีม",
      accent: "#ff6b00", ramp: ["#f6d8c8", "#ffb47a", "#ff6b00"],
      sticker: "CODE",
      doodles: ["tag", "brace", "terminal", "bolt"],
      photo: null,
    },
    {
      name: "ครูเกม",
      role: "สายอาร์ตประจำทีม",
      accent: "#ffc52a", ramp: ["#fdeec4", "#ffd873", "#ffc52a"],
      sticker: "ART",
      doodles: ["brush", "palette", "sparkle"],
      photo: null,
    },
  ];

  // Every mark means something for its teacher — nothing decorative-at-random.
  const DOODLE = {
    tag:      '<svg viewBox="0 0 24 24" fill="none"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    brace:    '<svg viewBox="0 0 24 24" fill="none"><path d="M9 4c-2 0-2 6-4 8 2 2 2 8 4 8M15 4c2 0 2 6 4 8-2 2-2 8-4 8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    terminal: '<svg viewBox="0 0 24 24" fill="none"><rect x="2.5" y="4.5" width="19" height="15" rx="3" stroke="currentColor" stroke-width="2.2"/><path d="M7 10l3 2.5L7 15M12.5 15H17" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bolt:     '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2L5 13h5.5L9.5 22 19 10h-6z"/></svg>',
    pad:      '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="11" rx="5" stroke="currentColor" stroke-width="2.2"/><path d="M7 11v3M5.5 12.5h3M16 12h.01M18.5 14h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    heart:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 4H6v3H3v3h3v3h3v3h3v-3h3v-3h3V7h-3V4h-3v3H9z"/></svg>',
    star:     '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.2 6.6.9-4.8 4.7 1.2 6.7L12 17.4 6.1 20.5l1.2-6.7L2.5 9.1l6.6-.9z"/></svg>',
    brush:    '<svg viewBox="0 0 24 24" fill="none"><path d="M18 3.5l2.5 2.5-9 9-3.5 1 1-3.5z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M6 16c-1.5 1.5-1 4-3 5 3 .5 5.5 0 6.5-2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    palette:  '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3a9 9 0 100 18c1.6 0 2-1.2 1.2-2-.8-.9-.3-2 1-2H16a5 5 0 005-5c0-5-4-9-9-9z" stroke="currentColor" stroke-width="2.2"/><circle cx="8" cy="10" r="1.3" fill="currentColor"/><circle cx="12.5" cy="7.5" r="1.3" fill="currentColor"/></svg>',
    sparkle:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8z"/></svg>',
  };

  // Unrevealed character, not a missing asset: a real figure in the teacher's
  // accent, wearing the same sticker outline the photo will get.
  const SILHOUETTE = `
    <svg class="figure-mock" viewBox="0 0 220 300" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <g fill="currentColor">
        <circle cx="110" cy="46" r="34"/>
        <path d="M110 86c-30 0-53 17-59 44l-12 54c-2 10 5 18 14 18 8 0 14-5 16-13l9-38v36c0 11 1 21 3 31l11 66c1 9 8 15 17 15 10 0 17-8 16-17l-5-68 5-32 5 32-5 68c-1 9 6 17 16 17 9 0 16-6 17-15l11-66c2-10 3-20 3-31v-36l9 38c2 8 8 13 16 13 9 0 16-8 14-18l-12-54c-6-27-29-44-59-44z"/>
      </g>
    </svg>`;

  const BLOB = `
    <svg class="blob-art" viewBox="0 0 400 420" aria-hidden="true">
      <path class="blob-back" d="M214 14c74-6 140 52 156 124 15 72-20 148-78 190-58 42-139 50-192 14C47 306 18 236 24 168 30 100 74 40 140 22c25-7 50-6 74-8z"/>
      <path class="blob-front" d="M196 30c68-4 128 46 146 112 18 66-8 140-60 182-52 42-128 48-176 12C58 300 30 234 38 170 46 106 90 48 152 34c15-3 29-3 44-4z"/>
    </svg>`;

  const UNDERLINE = `
    <svg class="role-underline" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
      <path d="M4 8c34-6 68-7 96-4 26 3 60 2 96-3" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>`;

  const figure = (t) => t.photo
    ? `<img src="${t.photo}" alt="${t.name}" draggable="false">`
    : SILHOUETTE;

  track.innerHTML = TEACHERS.map((t) => `
    <article class="slide" style="--accent:${t.accent};--ramp0:${t.ramp[0]};--ramp1:${t.ramp[1]};--ramp2:${t.ramp[2]}">
      <span class="slide__blob" aria-hidden="true">${BLOB}</span>

      <span class="deco deco--back deco--plus" aria-hidden="true">${DOODLE.sparkle}</span>
      ${t.doodles.slice(0, 2).map((d, i) => `<span class="doodle doodle--b${i}" aria-hidden="true">${DOODLE[d]}</span>`).join("")}

      <div class="slide__figure">
        <div class="fig-layer fig-layer--top" aria-hidden="true">${figure(t)}</div>
        <div class="fig-layer fig-layer--bot">${figure(t)}</div>
      </div>

      ${t.doodles.slice(2).map((d, i) => `<span class="doodle doodle--f${i}" aria-hidden="true">${DOODLE[d]}</span>`).join("")}
      <span class="sticker sticker--a" aria-hidden="true">${t.sticker}</span>
      <span class="deco deco--front deco--ring" aria-hidden="true"></span>
      <span class="deco deco--front deco--square" aria-hidden="true"></span>

      <div class="slide__text">
        <h3 class="slide__name">${t.name}</h3>
        <p class="slide__role">${t.role}${UNDERLINE}</p>
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

  // Parallax and tilt are pure decoration written from the drag offset the
  // handler already has — they never feed back into the pointer maths.
  function paint(x) {
    track.style.transform = `translate3d(${x}px, 0, 0)`;

    const slide = slides[index];
    if (!slide) return;
    const dx = x - restingX(index);
    const fig = slide.querySelector(".slide__figure");
    const blob = slide.querySelector(".slide__blob");
    // Capped at 1.5° — past that the character reads as falling over.
    const tilt = Math.max(-1.5, Math.min(1.5, dx / 90));
    if (fig) fig.style.transform = `rotate(${tilt}deg)`;
    // Counter-translated so the blob travels at ~70% of the character.
    if (blob) blob.style.transform = `translate(-50%, -50%) translateX(${-dx * 0.3}px)`;
  }

  function clearDragPaint() {
    slides.forEach((s) => {
      const fig = s.querySelector(".slide__figure");
      const blob = s.querySelector(".slide__blob");
      if (fig) fig.style.transform = "";
      if (blob) blob.style.transform = "";
    });
  }

  // 1:1 with the pointer — drag 200px, the track moves 200px. Coalesced into
  // one write per frame; pointermove can fire well above refresh rate.
  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    pendingX = baseX + (e.clientX - startX);
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      if (pendingX !== null) paint(pendingX);
    });
  });

  function release(e) {
    if (!dragging) return;
    dragging = false;
    pendingX = null;
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    stage.classList.remove("is-dragging");
    track.style.willChange = "auto";
    // Inline transforms outrank the squash/slice CSS, so they must go before
    // show() runs — otherwise the figure never takes the hit.
    clearDragPaint();
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
