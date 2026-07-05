const store = window.FormaStore;
const formatter = new Intl.NumberFormat("pl-PL");
const formatDate = value => new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
const escapeHtml = value => String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

const menuButton = document.querySelector(".menu-btn");
const nav = document.querySelector("#nav");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

document.querySelectorAll(".filters button").forEach(button => button.addEventListener("click", () => {
  document.querySelector(".filters .active")?.classList.remove("active");
  button.classList.add("active");
  const filter = button.dataset.filter;
  document.querySelectorAll(".project-card").forEach(card => card.classList.toggle("hidden", filter !== "all" && card.dataset.category !== filter));
}));

const projects = [...document.querySelectorAll(".project-card")];
const projectDialog = document.querySelector("#project-dialog");
let currentProject = 0;

function openProject(index) {
  currentProject = (index + projects.length) % projects.length;
  const project = projects[currentProject].dataset;
  document.querySelector("#dialog-project-number").textContent = String(currentProject + 1).padStart(2, "0");
  document.querySelector("#dialog-project-title").textContent = project.title;
  document.querySelector("#dialog-project-description").textContent = project.description;
  document.querySelector("#dialog-project-location").textContent = project.location;
  document.querySelector("#dialog-project-material").textContent = project.material;
  const image = document.querySelector("#dialog-project-image");
  image.src = project.image;
  image.alt = `Realizacja ${project.title}`;
  if (!projectDialog.open) projectDialog.showModal();
}

projects.forEach((project, index) => project.querySelector(".open-project").addEventListener("click", () => openProject(index)));
document.querySelector("#project-prev").addEventListener("click", () => openProject(currentProject - 1));
document.querySelector("#project-next").addEventListener("click", () => openProject(currentProject + 1));

function renderFavorites() {
  const favorites = store.read("favorites");
  projects.forEach((project, index) => {
    const button = project.querySelector(".favorite-project");
    const selected = favorites.includes(index);
    button.classList.toggle("selected", selected);
    button.textContent = selected ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(selected));
  });
}

projects.forEach((project, index) => project.querySelector(".favorite-project").addEventListener("click", () => {
  const favorites = store.read("favorites");
  const updated = favorites.includes(index) ? favorites.filter(item => item !== index) : [...favorites, index];
  store.write("favorites", updated);
  renderFavorites();
  showToast(favorites.includes(index) ? "Usunięto z zapisanych inspiracji." : "Inspiracja zapisana na tym urządzeniu.");
}));
renderFavorites();

function calculate() {
  const length = Number(document.querySelector("#length").value);
  const layout = Number(document.querySelector("[name=layout]:checked").value);
  const finish = Number(document.querySelector("[name=finish]:checked").value);
  const base = Math.round((10500 + length * 4800 * layout) * finish / 1000) * 1000;
  document.querySelector("#length-output").textContent = `${length.toFixed(1).replace(".", ",")} m`;
  document.querySelector("#price-result").textContent = `${formatter.format(base)} – ${formatter.format(Math.round(base * 1.24 / 1000) * 1000)} zł`;
}
document.querySelectorAll("#calc-form input").forEach(input => input.addEventListener("input", calculate));

function renderPosts() {
  const posts = store.read("posts").filter(post => post.published).sort((a, b) => new Date(b.date) - new Date(a.date));
  document.querySelector("#posts-list").innerHTML = posts.map((post, index) => `
    <article class="journal-card ${index === 0 ? "journal-featured" : ""}">
      <div class="journal-visual"><span>${escapeHtml(post.category)}</span><b>${String(index + 1).padStart(2, "0")}</b></div>
      <div class="journal-copy"><small>${formatDate(post.date)} · ${escapeHtml(post.readTime)}</small><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.excerpt)}</p><button type="button" data-read-post="${escapeHtml(post.id)}">Czytaj artykuł <span>→</span></button></div>
    </article>`).join("") || "<p>Nowe materiały pojawią się wkrótce.</p>";
  document.querySelectorAll("[data-read-post]").forEach(button => button.addEventListener("click", () => showToast("Pełna treść artykułu będzie dostępna po podłączeniu CMS.")));
}
renderPosts();

let activeQuestionCategory = "all";
function renderQuestions() {
  const query = document.querySelector("#question-search").value.trim().toLocaleLowerCase("pl");
  const questions = store.read("questions").filter(item => item.approved).filter(item => activeQuestionCategory === "all" || item.category === activeQuestionCategory).filter(item => `${item.question} ${item.answer}`.toLocaleLowerCase("pl").includes(query));
  document.querySelector("#questions-list").innerHTML = questions.map(item => `
    <article class="question-card">
      <div class="question-meta"><span>${escapeHtml(item.category)}</span><small>${escapeHtml(item.author)} · ${formatDate(item.date)}</small></div>
      <h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p>
      <button class="helpful-button" type="button" data-helpful="${escapeHtml(item.id)}">♡ Pomocna odpowiedź <b>${item.helpful}</b></button>
    </article>`).join("") || "<p class='empty-state'>Nie znaleźliśmy takiego pytania. Zadaj je — chętnie odpowiemy.</p>";
  document.querySelectorAll("[data-helpful]").forEach(button => button.addEventListener("click", () => {
    const questionsData = store.read("questions");
    const question = questionsData.find(item => item.id === button.dataset.helpful);
    if (question) question.helpful += 1;
    store.write("questions", questionsData);
    renderQuestions();
  }));
}
document.querySelector("#question-search").addEventListener("input", renderQuestions);
document.querySelectorAll("[data-question-category]").forEach(button => button.addEventListener("click", () => {
  document.querySelector(".question-categories .active")?.classList.remove("active");
  button.classList.add("active");
  activeQuestionCategory = button.dataset.questionCategory;
  renderQuestions();
}));
renderQuestions();

let activeReviewRating = "all";
let reviewPage = 0;
const reviewPageSize = () => window.innerWidth <= 620 ? 1 : window.innerWidth <= 900 ? 2 : 3;

function reviewTimestamp(item) {
  const idTimestamp = Number(String(item.id).split("-").pop());
  return Number.isFinite(item.createdAt) ? item.createdAt : Number.isFinite(idTimestamp) && idTimestamp > 1000000000000 ? idTimestamp : new Date(item.date).getTime();
}

function renderReviews() {
  const allReviews = store.read("reviews").sort((a, b) => reviewTimestamp(b) - reviewTimestamp(a));
  const verifiedReviews = allReviews.filter(item => item.approved);
  const average = verifiedReviews.length ? verifiedReviews.reduce((sum, item) => sum + Number(item.rating), 0) / verifiedReviews.length : 0;
  document.querySelector("#rating-average").textContent = average.toFixed(1);
  const filteredReviews = activeReviewRating === "all" ? allReviews : allReviews.filter(item => Number(item.rating) === Number(activeReviewRating));
  const pages = Math.max(1, Math.ceil(filteredReviews.length / reviewPageSize()));
  reviewPage = Math.min(reviewPage, pages - 1);
  const visibleReviews = filteredReviews.slice(reviewPage * reviewPageSize(), (reviewPage + 1) * reviewPageSize());

  document.querySelector("#reviews-list").innerHTML = visibleReviews.map(item => `
    <article class="review-card">
      <div class="review-card-top"><div class="review-stars">${"★".repeat(item.rating)}${"☆".repeat(5 - item.rating)}</div>${item.approved ? "" : '<span class="review-pending">Czeka na moderację</span>'}</div>
      <blockquote>“${escapeHtml(item.text)}”</blockquote>
      <div><strong>${escapeHtml(item.author)}</strong><span>${escapeHtml(item.city)} · ${formatDate(item.date)}</span></div>
    </article>`).join("") || '<p class="reviews-empty">Brak opinii z taką oceną.</p>';

  document.querySelector("#review-page-info").textContent = `${reviewPage + 1} / ${pages} · ${filteredReviews.length} ${filteredReviews.length === 1 ? "opinia" : "opinii"}`;
  document.querySelector("#review-prev").disabled = reviewPage === 0;
  document.querySelector("#review-next").disabled = reviewPage >= pages - 1;
}

document.querySelectorAll("[data-review-rating]").forEach(button => button.addEventListener("click", () => {
  document.querySelector(".review-filters .active")?.classList.remove("active");
  button.classList.add("active");
  activeReviewRating = button.dataset.reviewRating;
  reviewPage = 0;
  renderReviews();
}));
document.querySelector("#review-prev").addEventListener("click", () => { reviewPage = Math.max(0, reviewPage - 1); renderReviews(); });
document.querySelector("#review-next").addEventListener("click", () => { reviewPage += 1; renderReviews(); });
window.addEventListener("resize", () => { reviewPage = 0; renderReviews(); });
renderReviews();

document.querySelectorAll("[data-open-dialog]").forEach(button => button.addEventListener("click", () => document.querySelector(`#${button.dataset.openDialog}`).showModal()));
document.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
document.querySelectorAll("dialog").forEach(dialog => dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
}));

document.querySelector("#question-form").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  store.add("questions", { author: data.get("author"), category: data.get("category"), question: data.get("question"), answer: "", helpful: 0, approved: false, date: new Date().toISOString().slice(0, 10) });
  event.currentTarget.reset();
  event.currentTarget.closest("dialog").close();
  showToast("Pytanie zapisane. Opublikujemy je po odpowiedzi moderatora.");
});

document.querySelector("#review-form").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  store.add("reviews", { author: data.get("author"), city: data.get("city"), rating: Number(data.get("rating")), text: data.get("text"), approved: false, date: new Date().toISOString().slice(0, 10), createdAt: Date.now() });
  event.currentTarget.reset();
  event.currentTarget.closest("dialog").close();
  activeReviewRating = "all";
  reviewPage = 0;
  document.querySelector(".review-filters .active")?.classList.remove("active");
  document.querySelector('[data-review-rating="all"]').classList.add("active");
  renderReviews();
  document.querySelector("#opinie").scrollIntoView({ behavior: "smooth" });
  showToast("Dziękujemy! Twoja opinia jest pierwsza i czeka na weryfikację.");
});

document.querySelector("#status-form").addEventListener("submit", event => {
  event.preventDefault();
  const code = new FormData(event.currentTarget).get("projectCode").trim().toUpperCase();
  document.querySelector("#status-result").innerHTML = code === "FM-2026-184" ? `<strong>Produkcja</strong><div class="status-track"><i></i><i></i><i class="current"></i><i></i><i></i></div><span>Planowany montaż: 20–24 lipca 2026</span>` : `<strong>Nie znaleziono projektu</strong><span>Sprawdź numer albo skontaktuj się z opiekunem.</span>`;
});

const toast = document.querySelector("#toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 4200);
}

document.querySelector("#contact-form").addEventListener("submit", event => {
  event.preventDefault();
  event.currentTarget.reset();
  showToast("Dziękujemy! Odezwemy się w ciągu 1 dnia roboczego.");
});

const header = document.querySelector(".site-header");
window.addEventListener("scroll", () => {
  const scrolled = scrollY > 80;
  header.style.position = scrolled ? "fixed" : "absolute";
  header.style.background = scrolled ? "rgba(20,31,25,.96)" : "transparent";
  header.style.backdropFilter = scrolled ? "blur(12px)" : "none";
}, { passive: true });
