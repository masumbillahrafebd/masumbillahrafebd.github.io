gsap.from(".gsap-test", {
  clipPath: "inset(100% 0 0 0)",
  duration: 2,
  ease: "power2.out"
});

document.fonts.ready.then(() => {
  gsap.registerPlugin(SplitText);
  const split = SplitText.create(".main-heading-text", { type: "words" });

  gsap.from(split.words, {
    y: 40,
    opacity: 0,
    stagger: 0.15,
    duration: 1,
    ease: "power2.out"
  });
});




gsap.registerPlugin(ScrollTrigger, SplitText);

const split = SplitText.create(".scroll-highlight", {
  type: "words"
});

gsap.to(split.words, {
  color: "#fff",
  stagger: 0.5,
  ease: "none",

  scrollTrigger: {
    trigger: ".personal-statement",
    start: "top top",
    end: "bottom bottom",
    scrub: true
  }
});
