    (() => {

      /* ---------- DOM Shortcuts ---------- */

      const $ = id => document.getElementById(id);

      const body = document.body;
      const toggle = $("toggle");
      const wp = $("wp");

      const list = $("list");
      const right = $("right");
      const thumb = $("thumb");

      const menu = $("menu");
      const wave = $("wave");

      /* ---------- Navigation Items ---------- */

      const items = [
        "Home 1",
        "Home 2",
        "Home 3",
        "Home 4",
        "Home 5",
        "About",
        "Services",
        "Work",
        "Work Details",
        "Blog",
        "Blog Details",
        "404",
        "Contact"
      ];

      list.innerHTML = items
        .map((item, index) => {

          const delayIndex = index < 5 ? index : 4;

          return `
            <a
              href="#"
              data-in
              style="--i:${delayIndex}"
            >
              ${item}
            </a>
          `;

        })
        .join("");

      /* ---------- Prevent Placeholder Links ---------- */

      list.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", event => {
          event.preventDefault();
        });

      });

      document.querySelectorAll('a[href="#"]').forEach(link => {

        link.addEventListener("click", event => {
          event.preventDefault();
        });

      });

      /* ---------- Wave Animation ---------- */

      const ease = progress => {

        if (progress < 0.5) {
          return 4 * progress * progress * progress;
        }

        return 1 - Math.pow(-2 * progress + 2, 3) / 2;

      };

      function draw(y, progress) {

        const bulge = 11 * Math.sin(Math.PI * progress);

        const leftY = y + bulge * 0.55;
        const centerY = y - bulge * 1.15;
        const rightY = y + bulge * 0.05;

        wp.setAttribute(
          "d",
          `
            M0 101
            V${leftY.toFixed(2)}
            Q50 ${centerY.toFixed(2)} 100 ${rightY.toFixed(2)}
            V101Z
          `
        );

      }

      let animationFrame;
      let isOpen = false;
      let busy = false;

      /* ---------- Run Wave Animation ---------- */

      function run(from, to, duration, callback) {

        cancelAnimationFrame(animationFrame);

        const startTime = performance.now();

        function step(now) {

          const progress = Math.min(
            1,
            (now - startTime) / duration
          );

          const easedProgress = ease(progress);

          draw(
            from + (to - from) * easedProgress,
            progress
          );

          if (progress < 1) {

            animationFrame = requestAnimationFrame(step);

          } else if (callback) {

            callback();

          }

        }

        step(startTime);

      }

      /* ---------- Initial Wave State ---------- */

      draw(100, 0);

      /* ---------- Open Menu ---------- */

      function openMenu() {

        busy = true;
        isOpen = true;

        body.classList.add("open");

        body.classList.remove(
          "hide",
          "show",
          "covered"
        );

        menu.style.visibility = "hidden";

        toggle.setAttribute(
          "aria-expanded",
          "true"
        );

        $("l1").textContent = "Menu";
        $("l2").textContent = "Close";

        wave.style.transition = "none";
        wave.style.opacity = 1;

        run(100, 0, 700, () => {

          menu.style.visibility = "";

          wave.style.transition = "opacity .2s";
          wave.style.opacity = 0;

          requestAnimationFrame(() => {

            body.classList.add(
              "show",
              "covered"
            );

            setTimeout(() => {
              busy = false;
            }, 500);

          });

        });

      }

      /* ---------- Close Menu ---------- */

      function closeMenu() {

        busy = true;
        isOpen = false;

        body.classList.remove("show");

        body.classList.add(
          "hide",
          "closing"
        );

        toggle.setAttribute(
          "aria-expanded",
          "false"
        );

        $("l2").textContent = "Open";

        setTimeout(() => {

          wave.style.transition = "none";
          wave.style.opacity = 1;

          body.classList.remove("covered");

          draw(0, 0);

          menu.style.visibility = "hidden";

          body.classList.remove("open");

          run(0, 100, 750, () => {

            body.classList.remove(
              "hide",
              "closing"
            );

            busy = false;

          });

        }, 230);

      }

      /* ---------- Menu Toggle ---------- */

      toggle.addEventListener("click", () => {

        if (busy) {
          return;
        }

        if (isOpen) {
          closeMenu();
        } else {
          openMenu();
        }

      });

      /* ---------- Escape Key Support ---------- */

      addEventListener("keydown", event => {

        if (
          event.key === "Escape" &&
          isOpen &&
          !busy
        ) {
          closeMenu();
        }

      });

      /* ---------- Navigation List Scrolling ---------- */

      let target = 0;
      let current = 0;

      const maxScroll = () => {

        return Math.max(
          0,
          list.scrollHeight - right.clientHeight
        );

      };

      /* ---------- Mouse Wheel Scrolling ---------- */

      addEventListener(
        "wheel",
        event => {

          if (!isOpen) {
            return;
          }

          target = Math.min(
            maxScroll(),
            Math.max(
              0,
              target + event.deltaY
            )
          );

        },
        {
          passive: true
        }
      );

      /* ---------- Touch Scrolling ---------- */

      let touchY = null;

      addEventListener(
        "touchstart",
        event => {

          touchY = event.touches[0].clientY;

        },
        {
          passive: true
        }
      );

      addEventListener(
        "touchmove",
        event => {

          if (!isOpen || touchY === null) {
            return;
          }

          const newY = event.touches[0].clientY;

          target = Math.min(
            maxScroll(),
            Math.max(
              0,
              target + touchY - newY
            )
          );

          touchY = newY;

        },
        {
          passive: true
        }
      );

      /* ---------- Smooth Scroll Animation ---------- */

      function updateScroll() {

        current += (target - current) * 0.09;

        list.style.transform =
          `translateY(${-current}px)`;

        /* Scrollbar Measurements */

        const max = maxScroll();

        const trackHeight =
          thumb.parentElement.clientHeight;

        const thumbHeight = Math.max(
          0.2,
          right.clientHeight / list.scrollHeight
        ) * trackHeight;

        /* Update Scrollbar Height */

        thumb.style.height =
          `${thumbHeight}px`;

        /* Update Scrollbar Position */

        thumb.style.top =
          `${
            (max ? current / max : 0) *
            (trackHeight - thumbHeight)
          }px`;

        requestAnimationFrame(updateScroll);

      }

      updateScroll();

      /*
       * Custom cursor effect has been removed.
       *
       * The native browser cursor is enabled.
       *
       * Hero section, menu transitions, wave animation,
       * navigation links, smooth scrolling, touch support,
       * and responsive styles remain in place.
       */

    })();



  
document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");

    if (!header) return;

    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY <= 50) {
            // Show header at the top
            header.classList.remove("header-hidden");
        } else if (currentScrollY > lastScrollY) {
            // Scrolling down: hide header
            header.classList.add("header-hidden");
        } else if (currentScrollY < lastScrollY) {
            // Scrolling up: show header
            header.classList.remove("header-hidden");
        }

        lastScrollY = currentScrollY;
    }, { passive: true });
});
