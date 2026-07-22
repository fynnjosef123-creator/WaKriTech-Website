const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

navToggle?.addEventListener("click", () => {
  const isOpen = siteNav?.classList.toggle("is-open") || false;
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("click", (event) => {
  if (!siteNav?.classList.contains("is-open")) return;
  if (siteNav.contains(event.target) || navToggle?.contains(event.target)) return;
  siteNav.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
});

const workflowVideo = document.querySelector(".workflow-video video");

if (workflowVideo) {
  workflowVideo.muted = true;
  const playWorkflow = () => workflowVideo.play().catch(() => {});

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playWorkflow();
        } else {
          workflowVideo.pause();
        }
      });
    }, { threshold: 0.2 });
    videoObserver.observe(workflowVideo);
  } else {
    playWorkflow();
  }
}
