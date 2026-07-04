const store = window.FormaStore;
const escapeHtml = value => String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
const formatDate = value => new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
const tabLabels = { dashboard: ["Przegląd", "Dzień dobry 👋"], posts: ["Treści", "Nowości i ciekawe fakty"], questions: ["Moderacja", "Pytania klientów"], reviews: ["Moderacja", "Opinie klientów"] };

document.querySelector("#today").textContent = new Intl.DateTimeFormat("pl-PL", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

function selectTab(name) {
  document.querySelector(".admin-sidebar .active")?.classList.remove("active");
  document.querySelector(`[data-admin-tab="${name}"]`)?.classList.add("active");
  document.querySelector(".admin-panel.active")?.classList.remove("active");
  document.querySelector(`[data-panel="${name}"]`)?.classList.add("active");
  document.querySelector("#admin-kicker").textContent = tabLabels[name][0];
  document.querySelector("#admin-title").textContent = tabLabels[name][1];
}
document.querySelectorAll("[data-admin-tab]").forEach(button => button.addEventListener("click", () => selectTab(button.dataset.adminTab)));
document.querySelectorAll("[data-go-tab]").forEach(button => button.addEventListener("click", () => selectTab(button.dataset.goTab)));

function updateStats() {
  const posts = store.read("posts");
  const questions = store.read("questions");
  const reviews = store.read("reviews");
  const pendingQuestions = questions.filter(item => !item.approved).length;
  const pendingReviews = reviews.filter(item => !item.approved).length;
  document.querySelector("#stat-posts").textContent = posts.filter(item => item.published).length;
  document.querySelector("#stat-questions").textContent = pendingQuestions;
  document.querySelector("#stat-reviews").textContent = pendingReviews;
  document.querySelector("#stat-favorites").textContent = store.read("favorites").length;
  document.querySelector("#question-badge").textContent = pendingQuestions;
  document.querySelector("#review-badge").textContent = pendingReviews;
}

function renderPosts() {
  const posts = store.read("posts");
  document.querySelector("#post-count").textContent = `${posts.length} materiałów`;
  document.querySelector("#admin-posts-list").innerHTML = posts.map(post => `<article class="admin-list-item"><div><div class="item-meta"><span>${escapeHtml(post.category)}</span><span>${formatDate(post.date)}</span><span>${post.published ? "opublikowany" : "szkic"}</span></div><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.excerpt)}</p></div><div class="item-actions"><button data-toggle-post="${escapeHtml(post.id)}">${post.published ? "Ukryj" : "Publikuj"}</button><button class="danger" data-delete-post="${escapeHtml(post.id)}">Usuń</button></div></article>`).join("") || "<p class='empty-admin'>Brak materiałów.</p>";
  document.querySelectorAll("[data-toggle-post]").forEach(button => button.addEventListener("click", () => {
    const items = store.read("posts");
    const post = items.find(item => item.id === button.dataset.togglePost);
    post.published = !post.published;
    store.write("posts", items); refresh(); showToast("Status publikacji zmieniony.");
  }));
  document.querySelectorAll("[data-delete-post]").forEach(button => button.addEventListener("click", () => {
    store.write("posts", store.read("posts").filter(item => item.id !== button.dataset.deletePost)); refresh(); showToast("Materiał usunięty.");
  }));
}

function renderQuestions() {
  const questions = store.read("questions").sort((a, b) => Number(a.approved) - Number(b.approved));
  document.querySelector("#admin-questions-list").innerHTML = questions.map(item => `<article class="admin-list-item moderation-item"><div class="item-meta"><span>${escapeHtml(item.category)}</span><span>${escapeHtml(item.author)}</span><span>${item.approved ? "opublikowane" : "oczekuje"}</span></div><h3>${escapeHtml(item.question)}</h3><textarea class="question-answer" data-answer-input="${escapeHtml(item.id)}" placeholder="Wpisz odpowiedź eksperta…">${escapeHtml(item.answer)}</textarea><div class="item-actions"><button data-save-answer="${escapeHtml(item.id)}">Zapisz odpowiedź</button><button data-toggle-question="${escapeHtml(item.id)}">${item.approved ? "Cofnij publikację" : "Odpowiedz i publikuj"}</button><button class="danger" data-delete-question="${escapeHtml(item.id)}">Usuń</button></div></article>`).join("") || "<p class='empty-admin'>Brak pytań.</p>";
  document.querySelectorAll("[data-save-answer]").forEach(button => button.addEventListener("click", () => saveAnswer(button.dataset.saveAnswer, false)));
  document.querySelectorAll("[data-toggle-question]").forEach(button => button.addEventListener("click", () => saveAnswer(button.dataset.toggleQuestion, true)));
  document.querySelectorAll("[data-delete-question]").forEach(button => button.addEventListener("click", () => { store.write("questions", store.read("questions").filter(item => item.id !== button.dataset.deleteQuestion)); refresh(); showToast("Pytanie usunięte."); }));
}

function saveAnswer(id, togglePublish) {
  const questions = store.read("questions");
  const question = questions.find(item => item.id === id);
  question.answer = document.querySelector(`[data-answer-input="${id}"]`).value.trim();
  if (togglePublish) {
    if (!question.approved && !question.answer) return showToast("Najpierw wpisz odpowiedź.");
    question.approved = !question.approved;
  }
  store.write("questions", questions); refresh(); showToast(togglePublish ? "Status pytania zmieniony." : "Odpowiedź zapisana.");
}

function renderReviews() {
  const reviews = store.read("reviews").sort((a, b) => Number(a.approved) - Number(b.approved));
  document.querySelector("#admin-reviews-list").innerHTML = reviews.map(item => `<article class="admin-list-item"><div><div class="item-meta"><span>${escapeHtml(item.city)}</span><span>${formatDate(item.date)}</span><span>${item.approved ? "opublikowana" : "oczekuje"}</span></div><h3>${escapeHtml(item.author)} <span class="review-stars">${"★".repeat(item.rating)}</span></h3><p>${escapeHtml(item.text)}</p></div><div class="item-actions"><button data-toggle-review="${escapeHtml(item.id)}">${item.approved ? "Ukryj" : "Publikuj"}</button><button class="danger" data-delete-review="${escapeHtml(item.id)}">Usuń</button></div></article>`).join("") || "<p class='empty-admin'>Brak opinii.</p>";
  document.querySelectorAll("[data-toggle-review]").forEach(button => button.addEventListener("click", () => { const items = store.read("reviews"); const review = items.find(item => item.id === button.dataset.toggleReview); review.approved = !review.approved; store.write("reviews", items); refresh(); showToast("Status opinii zmieniony."); }));
  document.querySelectorAll("[data-delete-review]").forEach(button => button.addEventListener("click", () => { store.write("reviews", store.read("reviews").filter(item => item.id !== button.dataset.deleteReview)); refresh(); showToast("Opinia usunięta."); }));
}

document.querySelector("#post-form").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  store.add("posts", { title: data.get("title"), category: data.get("category"), readTime: data.get("readTime"), excerpt: data.get("excerpt"), published: data.get("published") === "on", date: new Date().toISOString().slice(0, 10) });
  event.currentTarget.reset();
  event.currentTarget.querySelector("[name=readTime]").value = "4 min";
  event.currentTarget.querySelector("[name=published]").checked = true;
  refresh(); showToast("Publikacja zapisana.");
});

const toast = document.querySelector("#admin-toast");
let toastTimer;
function showToast(message) { toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 3200); }
function refresh() { updateStats(); renderPosts(); renderQuestions(); renderReviews(); }
refresh();
