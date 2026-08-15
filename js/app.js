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

/* ── QUIZ → REWARD FLOW ──────────────────────────────────────
   Six states in one section: quiz → result → box → opening →
   activity → check-in. Only runs on the Thank You page. */
(function () {
  const quiz = document.getElementById("quiz");
  const qAsk = document.getElementById("qAsk");
  if (!quiz || !qAsk) return;

  const pQuiz = document.getElementById("pQuiz");
  const pResult = document.getElementById("pResult");
  const pPrize = document.getElementById("pPrize");
  const qCard = document.getElementById("qCard");
  const qOpts = document.getElementById("qOpts");
  const qCount = document.getElementById("qCount");
  const qBar = document.getElementById("qBar");
  const lootBox = document.getElementById("lootBox");
  const live = document.getElementById("quizLive");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ═══════ คำถามชั่วคราว — เปลี่ยนเป็นของจริงได้เลย ═══════
  // score: แต้มของตัวเลือกนั้น เก็บครบ 3 ข้อแล้วได้ >= PASS_MARK คือผ่าน
  const QUESTIONS = [
    {
      ask: "เวลาทำกิจกรรม น้องชอบแบบไหนที่สุด?",
      opts: [
        { icon: "pad",   text: "ทำเกม",                    score: 1 },
        { icon: "flask", text: "ลองอะไรใหม่ ๆ",            score: 1 },
        { icon: "bulb",  text: "อยากรู้ว่าตัวเองเหมาะกับอะไร", score: 0 },
      ],
    },
    {
      ask: "ถ้ามีภารกิจให้เลือก น้องจะหยิบอะไรก่อน?",
      opts: [
        { icon: "rocket", text: "อันที่ดูท้าทายที่สุด",  score: 1 },
        { icon: "puzzle", text: "อันที่ต้องคิดเยอะ ๆ",   score: 1 },
        { icon: "heart",  text: "อันที่ดูน่ารักที่สุด",   score: 0 },
      ],
    },
    {
      ask: "วันนี้อยากได้ความสนุกสายไหน?",
      opts: [
        { icon: "bolt",  text: "สายลุย ทำเลยไม่ต้องคิดนาน", score: 1 },
        { icon: "brush", text: "สายสร้างของสวย ๆ",          score: 1 },
        { icon: "star",  text: "ยังไม่แน่ใจ ขอลองดูก่อน",    score: 0 },
      ],
    },
  ];
  const PASS_MARK = 2;

  const ICON = {
    pad:    '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="11" rx="5" stroke="currentColor" stroke-width="2"/><path d="M7 11v3M5.5 12.5h3M16 12h.01M18.5 14h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    flask:  '<svg viewBox="0 0 24 24" fill="none"><path d="M9 3h6M10 3v6l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 18l-5-9V3" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    bulb:   '<svg viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1h6c0-.4.1-.8.5-1.1A6 6 0 0 0 12 3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    rocket: '<svg viewBox="0 0 24 24" fill="none"><path d="M13 3c4 1.5 6.5 5 7 9-4 3.5-8 5-8 5l-4-4s1.5-4 5-8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 13l-3 1 1 3 3-1M15 9h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    puzzle: '<svg viewBox="0 0 24 24" fill="none"><path d="M10 4a2 2 0 1 1 4 0v1h4v4h-1a2 2 0 1 0 0 4h1v4h-4v-1a2 2 0 1 0-4 0v1H6v-4H5a2 2 0 1 0 0-4h1V5h4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    heart:  '<svg viewBox="0 0 24 24" fill="none"><path d="M12 20s-7.5-4.7-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.3 12 20 12 20Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    bolt:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2L5 13h5.5L9.5 22 19 10h-6z"/></svg>',
    brush:  '<svg viewBox="0 0 24 24" fill="none"><path d="M18 3.5l2.5 2.5-9 9-3.5 1 1-3.5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M6 16c-1.5 1.5-1 4-3 5 3 .5 5.5 0 6.5-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    star:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.2 6.6.9-4.8 4.7 1.2 6.7L12 17.4 6.1 20.5l1.2-6.7L2.5 9.1l6.6-.9z"/></svg>',
  };

  let index = 0;
  let score = 0;
  let locked = false;

  function paintQuestion(dir) {
    const q = QUESTIONS[index];
    qAsk.textContent = q.ask;
    qOpts.innerHTML = q.opts.map((o, i) => `
      <button class="opt" type="button" data-i="${i}">
        <span class="opt__icon">${ICON[o.icon] || ""}</span>
        <span class="opt__text">${o.text}</span>
        <svg class="opt__go" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>`).join("");

    qCount.textContent = `${index + 1} / ${QUESTIONS.length}`;
    qBar.style.width = `${((index + 1) / QUESTIONS.length) * 100}%`;
    live.textContent = `ข้อ ${index + 1} จาก ${QUESTIONS.length}: ${q.ask}`;

    if (dir && !reduced.matches) {
      qCard.classList.remove("is-in-right", "is-in-left");
      void qCard.offsetWidth;               // restart the animation
      qCard.classList.add(dir > 0 ? "is-in-right" : "is-in-left");
    }
  }

  // Answering: squash the button, glow it, then slide the next question in.
  qOpts.addEventListener("click", (e) => {
    const btn = e.target.closest(".opt");
    if (!btn || locked) return;
    locked = true;

    score += QUESTIONS[index].opts[+btn.dataset.i].score;
    btn.classList.add("is-picked");

    const step = () => {
      if (index < QUESTIONS.length - 1) {
        index += 1;
        paintQuestion(1);
        locked = false;
      } else {
        finish();
      }
    };

    if (reduced.matches) step();
    else {
      qCard.classList.add("is-out");
      setTimeout(() => { qCard.classList.remove("is-out"); step(); }, 260);
    }
  });

  function swap(from, to) {
    from.hidden = true;
    to.hidden = false;
    if (!reduced.matches) {
      to.classList.remove("is-pop");
      void to.offsetWidth;
      to.classList.add("is-pop");
    }
  }

  const passed = () => score >= PASS_MARK;

  function finish() {
    // The hero has done its job; it steps aside so the result owns the screen.
    const hero = document.querySelector(".page-thanks .hero");
    if (hero) hero.classList.add("is-gone");
    document.getElementById("quizHead").classList.add("is-gone");

    const win = passed();
    document.getElementById("resultTitle").textContent = win ? "ผ่านด่านแล้ว!" : "ยังไม่ผ่านรอบนี้";
    document.getElementById("resultSub").textContent = win
      ? "คุณปลดล็อกรางวัลพิเศษได้แล้ว"
      : "ไม่เป็นไร ยังมีของให้เปิดเหมือนกัน";
    document.getElementById("resultGot").textContent = win ? "คุณได้รับกล่องเพชร" : "คุณได้รับกล่องเหล็ก";
    document.getElementById("lootLabel").textContent = win ? "เปิดกล่องเพชร" : "เปิดกล่องเหล็ก";
    lootBox.classList.add(win ? "lootbox--diamond" : "lootbox--iron");

    swap(pQuiz, pResult);
    live.textContent = `${win ? "ผ่านด่านแล้ว" : "ยังไม่ผ่านรอบนี้"} — ${win ? "ได้รับกล่องเพชร" : "ได้รับกล่องเหล็ก"} คลิกเพื่อเปิดกล่อง`;
    quiz.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth", block: "center" });
  }

  // Six sparks, same restraint as the gallery slash — a loot box, not a
  // confetti cannon.
  function sparks(win) {
    const burst = lootBox.querySelector(".lootbox__burst");
    const tints = win ? ["#ffffff", "#7fd6ff", "#ffc52a", "#ff6b00"]
                      : ["#ffffff", "#c9d1d9", "#ff6b00", "#8d949c"];
    for (let n = 0; n < 8; n++) {
      const s = document.createElement("i");
      s.className = "spark";
      const a = Math.PI * (0.15 + Math.random() * 0.7);
      const d = 60 + Math.random() * 60;
      s.style.setProperty("--dx", `${Math.cos(a) * d * (n % 2 ? 1 : -1)}px`);
      s.style.setProperty("--dy", `${-Math.sin(a) * d}px`);
      s.style.setProperty("--sz", `${6 + Math.random() * 7}px`);
      s.style.setProperty("--tint", tints[n % tints.length]);
      burst.append(s);
      s.addEventListener("animationend", () => s.remove(), { once: true });
    }
  }

  let opened = false;
  lootBox.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    const win = passed();

    if (reduced.matches) { swap(pResult, pPrize); return; }

    lootBox.classList.add(win ? "is-opening" : "is-opening-hard");
    setTimeout(() => sparks(win), win ? 260 : 340);
    setTimeout(() => {
      swap(pResult, pPrize);
      live.textContent = "ได้รับกิจกรรม SciGameLab Camp — เช็คอินเลยไหม?";
    }, 900);
  });

  document.getElementById("laterBtn").addEventListener("click", () => {
    document.querySelector(".gallery").scrollIntoView({
      behavior: reduced.matches ? "auto" : "smooth", block: "start",
    });
  });

  paintQuestion(0);
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
