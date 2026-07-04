(function () {
  const keys = {
    posts: "forma_posts_v1",
    questions: "forma_questions_v1",
    reviews: "forma_reviews_v1",
    favorites: "forma_favorites_v1"
  };

  const seeds = {
    posts: [
      { id: "post-1", title: "Blat na lata: spiek, konglomerat czy laminat?", category: "Materiały", excerpt: "Porównujemy odporność, pielęgnację i realne koszty trzech najczęściej wybieranych blatów.", date: "2026-06-28", readTime: "6 min", published: true },
      { id: "post-2", title: "5 centymetrów, które zmieniają wygodę kuchni", category: "Projektowanie", excerpt: "O wysokości blatu, przejściach i detalach, których nie widać na wizualizacji, ale czuć je codziennie.", date: "2026-06-12", readTime: "4 min", published: true },
      { id: "post-3", title: "Co nowego w naszej pracowni?", category: "Z pracowni", excerpt: "Nowy system szuflad, cieplejsze odcienie forniru i kilka rozwiązań prosto z ostatnich realizacji.", date: "2026-05-30", readTime: "3 min", published: true }
    ],
    questions: [
      { id: "q-1", author: "Katarzyna", category: "koszt", question: "Od czego najbardziej zależy cena kuchni na wymiar?", answer: "Największy wpływ mają metraż zabudowy, rodzaj frontów, blat oraz systemy wewnętrzne. Po pierwszym spotkaniu pokazujemy koszt w rozbiciu na te elementy, żeby łatwo było świadomie dopasować budżet.", helpful: 18, approved: true, date: "2026-06-29" },
      { id: "q-2", author: "Tomasz", category: "materialy", question: "Czy matowe fronty naprawdę mniej się brudzą?", answer: "Dobre laminaty i lakiery z powłoką anti-fingerprint ograniczają ślady, ale nie są całkowicie odporne. Kluczowy jest też kolor — średnie, ciepłe tony są bardziej praktyczne niż głęboka czerń.", helpful: 11, approved: true, date: "2026-06-21" },
      { id: "q-3", author: "Ola", category: "realizacja", question: "Czy można mieszkać w domu podczas montażu?", answer: "Zwykle tak. Montaż kuchni trwa 2–4 dni. Potrzebujemy swobodnego dostępu do pomieszczenia, prądu i miejsca na wniesienie elementów; harmonogram ustalamy wcześniej.", helpful: 9, approved: true, date: "2026-06-14" },
      { id: "q-4", author: "Marek", category: "realizacja", question: "Kiedy najlepiej wykonać pomiar?", answer: "Pomiar końcowy robimy po tynkach, posadzkach i ustaleniu okładzin ściennych. Wcześniej możemy wykonać pomiar koncepcyjny, aby przygotować układ instalacji.", helpful: 7, approved: true, date: "2026-06-03" }
    ],
    reviews: [
      { id: "r-1", author: "Anna i Krzysztof", city: "Kraków", rating: 5, text: "Od pierwszego spotkania czuliśmy, że ktoś naprawdę nas słucha. Kuchnia jest piękna, ale przede wszystkim działa dokładnie tak, jak żyjemy.", date: "2026-05-18", approved: true },
      { id: "r-2", author: "Magdalena", city: "Wieliczka", rating: 5, text: "Bardzo dobry kontakt, porządek podczas montażu i dużo cierpliwości przy wyborze materiałów. Efekt jest lepszy niż wizualizacja.", date: "2026-04-22", approved: true },
      { id: "r-3", author: "Piotr", city: "Niepołomice", rating: 4, text: "Doceniam jasną wycenę i pilnowanie terminów. Jedna korekta frontu została załatwiona szybko i bez dyskusji.", date: "2026-03-11", approved: true }
    ],
    favorites: []
  };

  function read(name) {
    try {
      const stored = localStorage.getItem(keys[name]);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      console.warn("Nie udało się odczytać danych", error);
    }
    return structuredClone(seeds[name]);
  }

  function write(name, value) {
    localStorage.setItem(keys[name], JSON.stringify(value));
    return value;
  }

  function ensure() {
    Object.keys(keys).forEach(name => {
      if (!localStorage.getItem(keys[name])) write(name, seeds[name]);
    });
  }

  function add(name, item) {
    const items = read(name);
    items.unshift({ ...item, id: item.id || `${name}-${Date.now()}` });
    return write(name, items);
  }

  window.FormaStore = { keys, read, write, add, ensure };
  ensure();
})();
