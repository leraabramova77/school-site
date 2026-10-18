// Общая логика прототипов: даты, выбранный день в адресе (#2026-10-15), листание, свайп, тема. Вёрстку делает вариант.
(function () {
  const pad = (n) => String(n).padStart(2, "0");
  const toUtc = (iso) => new Date(`${iso}T00:00:00Z`);
  const fromUtc = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  const addDays = (iso, n) => {
    const d = toUtc(iso);
    d.setUTCDate(d.getUTCDate() + n);
    return fromUtc(d);
  };
  const weekday = (iso) => (toUtc(iso).getUTCDay() + 6) % 7; // Пн = 0
  const mondayOf = (iso) => addDays(iso, -weekday(iso));
  const fmt = (opts) => new Intl.DateTimeFormat("ru-RU", { ...opts, timeZone: "UTC" });
  const fWd = fmt({ weekday: "short" });
  const fWdLong = fmt({ weekday: "long" });
  const fDayMonth = fmt({ day: "numeric", month: "long" });
  const fMonth = fmt({ month: "long" });
  const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

  const F = {
    addDays,
    mondayOf,
    weekday,
    wd: (iso) => fWd.format(toUtc(iso)).replace(".", ""),
    wdLong: (iso) => fWdLong.format(toUtc(iso)),
    num: (iso) => String(toUtc(iso).getUTCDate()),
    dayMonth: (iso) => fDayMonth.format(toUtc(iso)),
    month: (iso) => fMonth.format(toUtc(iso)),
    weekRange(monday) {
      const [d1, m1] = fDayMonth.format(toUtc(monday)).split(" ");
      const [d2, m2] = fDayMonth.format(toUtc(addDays(monday, 5))).split(" ");
      return m1 === m2 ? `${d1}–${d2} ${m2}` : `${d1} ${m1} – ${d2} ${m2}`;
    },
    esc: (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]),
    plural(n, one, few, many) {
      const m10 = n % 10;
      const m100 = n % 100;
      if (m10 === 1 && m100 !== 11) return `${n} ${one}`;
      if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} ${few}`;
      return `${n} ${many}`;
    },
  };

  // Тема: по системе; кнопка переключает и запоминает выбор (только удобство, данных там нет).
  function initTheme() {
    let saved = null;
    try {
      saved = localStorage.getItem("variant-theme");
    } catch {}
    const system = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = saved || system;
  }
  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("variant-theme", next);
    } catch {}
  }
  initTheme();

  window.mountDiary = function mountDiary(root, render) {
    const data = window.DIARY;
    const open = new Set();
    let direction = 0;
    const valid = (iso) => /^\d{4}-\d{2}-\d{2}$/.test(iso) && iso in data.days;
    const current = () => {
      const h = location.hash.slice(1);
      return valid(h) ? h : data.today;
    };

    function draw() {
      const date = current();
      const monday = mondayOf(date);
      const week = Array.from({ length: 6 }, (_, i) => addDays(monday, i));
      const entries = (data.days[date] || []).map((e, i) => ({ ...e, id: `${date}-${i}` }));
      root.innerHTML = render({
        F,
        date,
        monday,
        week,
        entries,
        open,
        today: data.today,
        marksOf: (d) => (data.days[d] || []).filter((e) => e.mark !== undefined).map((e) => e.mark),
        countOf: (d) => (data.days[d] || []).length,
        canPrev: data.weeks.includes(addDays(monday, -7)),
        canNext: data.weeks.includes(addDays(monday, 7)),
        isThisWeek: monday === mondayOf(data.today),
      });
      const content = root.querySelector("[data-day-content]");
      if (content && direction) {
        content.style.setProperty("--from", `${direction * 18}px`);
        content.classList.add("day-enter");
      }
      direction = 0;
    }

    function go(next) {
      if (!valid(next) || next === current()) return;
      direction = next > current() ? 1 : -1;
      history.replaceState(null, "", next === data.today ? location.pathname : `#${next}`);
      draw();
    }

    function step(n) {
      let next = addDays(current(), n);
      if (weekday(next) === 6) next = addDays(next, n);
      go(next);
    }

    root.addEventListener("click", (event) => {
      const el = event.target.closest("[data-go],[data-week],[data-toggle],[data-theme-toggle],[data-today]");
      if (!el) return;
      if (el.dataset.go) go(el.dataset.go);
      else if (el.dataset.week) go(addDays(mondayOf(current()), Number(el.dataset.week) * 7));
      else if (el.dataset.today !== undefined) go(data.today);
      else if (el.dataset.toggle) {
        const id = el.dataset.toggle;
        if (open.has(id)) open.delete(id);
        else open.add(id);
        draw();
        root.querySelector(`[data-toggle="${id}"]`)?.focus();
      } else if (el.dataset.themeToggle !== undefined) toggleTheme();
    });

    let start = null;
    root.addEventListener(
      "touchstart",
      (e) => {
        start = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
      },
      { passive: true },
    );
    root.addEventListener("touchend", (e) => {
      if (!start) return;
      const dx = e.changedTouches[0].clientX - start.x;
      const dy = e.changedTouches[0].clientY - start.y;
      start = null;
      if (Math.abs(dx) >= 56 && Math.abs(dx) >= Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
    });
    document.addEventListener("keydown", (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
    addEventListener("hashchange", draw);
    draw();
  };
})();
