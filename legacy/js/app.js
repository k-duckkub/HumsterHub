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
    document.getElementById("resultGot").textContent = win ? "คุณได้รับกล่องเพชร!" : "คุณได้รับกล่องเหล็ก";
    document.getElementById("boxHint").textContent = win
      ? "✦ คลิกเพื่อเปิดกล่อง ✦"
      : "✦ ลองเปิดดูว่ามีอะไรอยู่ข้างใน ✦";
    document.getElementById("lootLabel").textContent = win ? "เปิดกล่องเพชร" : "เปิดกล่องเหล็ก";
    lootBox.classList.add(win ? "lootbox--diamond" : "lootbox--iron");

    swap(pQuiz, pResult);
    live.textContent = `${win ? "ผ่านด่านแล้ว" : "ยังไม่ผ่านรอบนี้"} — ${win ? "ได้รับกล่องเพชร" : "ได้รับกล่องเหล็ก"} คลิกเพื่อเปิดกล่อง`;
    quiz.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth", block: "center" });
  }

  // Diamond throws crystal chips; iron coughs embers and a little smoke.
  // Same restraint either way — the brief rules out confetti explicitly, and
  // the counts here are the top of its stated ranges, not beyond them.
  function burstFx(win) {
    const burst = lootBox.querySelector(".lootbox__burst");
    const add = (el) => {
      burst.append(el);
      el.addEventListener("animationend", () => el.remove(), { once: true });
    };

    if (win) {
      const tints = ["#ffffff", "#bdf4ff", "#56c7ff", "#ffd978"];
      for (let n = 0; n < 8; n++) {
        const s = document.createElement("i");
        s.className = "spark";
        const a = Math.PI * (0.15 + Math.random() * 0.7);
        const d = 40 + Math.random() * 70;
        s.style.setProperty("--dx", `${Math.cos(a) * d * (n % 2 ? 1 : -1)}px`);
        s.style.setProperty("--dy", `${-Math.sin(a) * d}px`);
        s.style.setProperty("--sz", `${7 + Math.random() * 7}px`);
        s.style.setProperty("--tint", tints[n % tints.length]);
        add(s);
      }
      return;
    }

    const tints = ["#ffb347", "#ff8a24", "#ffd978", "#e56a10"];
    for (let n = 0; n < 6; n++) {
      const e = document.createElement("i");
      e.className = "ember";
      // Embers rise more than they spread — the vertical bias is what keeps
      // them reading as heat rather than as debris.
      const dx = (Math.random() * 54 - 27);
      const dy = -(46 + Math.random() * 46);
      e.style.setProperty("--dx", `${dx}px`);
      e.style.setProperty("--dy", `${dy}px`);
      e.style.setProperty("--sz", `${4 + Math.random() * 5}px`);
      e.style.setProperty("--tint", tints[n % tints.length]);
      e.style.animationDelay = `${n * 45}ms`;
      add(e);
    }
    for (let n = 0; n < 2; n++) {
      const k = document.createElement("i");
      k.className = "smoke";
      k.style.setProperty("--dx", `${n ? 26 : -24}px`);
      k.style.setProperty("--dy", `${-38 - Math.random() * 20}px`);
      k.style.animationDelay = `${n * 90}ms`;
      add(k);
    }
  }

  // Android Chrome honours this; iOS Safari has no vibration API and simply
  // does not expose it, so the guard is the whole story.
  const buzz = (ms) => { if (navigator.vibrate) navigator.vibrate(ms); };

  // Opening runs to a fixed timeline rather than chained transitionend events,
  // so a dropped frame cannot strand the sequence half-finished.
  let opened = false;
  lootBox.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    const win = passed();
    const squish = document.getElementById("lootSquish");
    const flash = lootBox.querySelector(".lootbox__flash");

    // The chest is not swapped away for the reward — it shrinks and stays put
    // above it, so the card reads as having come out of the box the user just
    // opened rather than as the next screen.
    const reveal = () => {
      pResult.classList.add("is-compact");
      pPrize.hidden = false;
      if (!reduced.matches) {
        pPrize.classList.remove("is-pop");
        void pPrize.offsetWidth;
        pPrize.classList.add("is-pop");
      }
      document.getElementById("prizeEyebrow").textContent = "ยินดีด้วย! คุณปลดล็อกกิจกรรมนี้แล้ว";
      live.textContent = "ยินดีด้วย! ปลดล็อกกิจกรรม SciGameLab Camp แล้ว — เช็คอินเลยไหม?";
    };

    if (reduced.matches) {
      lootBox.classList.add("is-open", "is-settled");
      reveal();
      return;
    }

    buzz(12);
    squish.classList.add("is-pressing");                        // 0–130   ยุบ

    setTimeout(() => {                                          // 130–420 อัดพลัง + แสงสะสม
      squish.classList.remove("is-pressing");
      squish.classList.add("is-charging");
      lootBox.classList.add("is-charging");
    }, 130);

    setTimeout(() => {                                          // 420–570 สั่นสั้น ๆ
      squish.classList.remove("is-charging");
      squish.classList.add("is-shaking");
    }, 420);

    setTimeout(() => {                                          // 570     ฝาเปิด + ตัวกล่องยุบ
      squish.classList.remove("is-shaking");
      squish.classList.add("is-bursting");
      lootBox.classList.add("is-open");
    }, 570);

    setTimeout(() => {                                          // 620     แสงพุ่ง + อนุภาค
      flash.classList.add("is-firing");
      burstFx(win);
      buzz(25);
    }, 620);

    setTimeout(() => {                                          // 900     รางวัลเด้งขึ้น
      squish.classList.remove("is-bursting");
      reveal();
    }, 900);

    setTimeout(() => {                                          // 1250    คืนตัว แสงหรี่ลง
      squish.classList.add("is-settling");
      lootBox.classList.remove("is-charging");
      lootBox.classList.add("is-settled");
    }, 1250);
  });

  // "ไว้ก่อน" is a dismissal with nowhere to go — the reward and the check-in
  // link both stay put, the page just returns to the top so the chest and the
  // card are back in view together.
  document.getElementById("laterBtn").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduced.matches ? "auto" : "smooth" });
  });

  paintQuestion(0);
})();
