// ---------- Helpers ----------
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ---------- Mobile menu ----------
const nav = $('nav');
$('#menu-toggle').addEventListener('click', () => nav.classList.toggle('open'));
$$('#nav-links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// ---------- Dark mode (saved) ----------
const themeBtn = $('#theme-toggle');
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeBtn.textContent = '☀️';
}
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  themeBtn.textContent = dark ? '☀️' : '🌙';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
});

// ---------- Animated counters ----------
const counters = $$('.counter');
let counted = false;
function runCounters() {
  counters.forEach(c => {
    const target = +c.dataset.target;
    let n = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const timer = setInterval(() => {
      n += step;
      if (n >= target) { n = target; clearInterval(timer); }
      c.textContent = n;
    }, 30);
  });
}
const statsSection = $('.stats');
new IntersectionObserver((entries, obs) => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    runCounters();
    obs.disconnect();
  }
}, { threshold: 0.4 }).observe(statsSection);

// ---------- Eco tips with filter ----------
const tips = [
  { icon: '💡', title: 'Switch to LED', text: 'LED bulbs use up to 75% less energy and last much longer.', cat: 'home' },
  { icon: '🚰', title: 'Fix Leaks', text: 'A dripping tap can waste over 15 litres of water a day.', cat: 'home' },
  { icon: '🔌', title: 'Unplug Devices', text: 'Standby devices still consume power. Switch them off fully.', cat: 'home' },
  { icon: '🚲', title: 'Cycle or Walk', text: 'For short distances, avoid vehicles and cut emissions to zero.', cat: 'travel' },
  { icon: '🚌', title: 'Use Public Transport', text: 'One bus can replace dozens of cars on the road.', cat: 'travel' },
  { icon: '🚗', title: 'Carpool', text: 'Sharing rides reduces traffic, fuel use and pollution.', cat: 'travel' },
  { icon: '🥗', title: 'Eat More Plants', text: 'Plant-rich diets have a much lower carbon footprint.', cat: 'food' },
  { icon: '🍎', title: 'Buy Local & Seasonal', text: 'Local food travels less and is fresher.', cat: 'food' },
  { icon: '🍽️', title: 'Avoid Food Waste', text: 'Plan meals, store food well and compost scraps.', cat: 'food' },
  { icon: '🛍️', title: 'Carry Cloth Bags', text: 'One reusable bag can replace hundreds of plastic bags.', cat: 'shopping' },
  { icon: '🧴', title: 'Choose Refills', text: 'Pick refillable and low-packaging products.', cat: 'shopping' },
  { icon: '👕', title: 'Buy Second-hand', text: 'Thrifting and reusing reduces textile waste.', cat: 'shopping' }
];

const tipsContainer = $('#tips-container');
function renderTips(filter = 'all') {
  tipsContainer.innerHTML = '';
  tips.filter(t => filter === 'all' || t.cat === filter).forEach(t => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<div class="icon">${t.icon}</div><h3>${t.title}</h3><p>${t.text}</p>`;
    tipsContainer.appendChild(div);
  });
}
renderTips();
$$('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTips(btn.dataset.filter);
  });
});

// ---------- Waste bins ----------
const binData = {
  wet: { title: '🟢 Wet / Biodegradable Waste', items: ['Vegetable and fruit peels', 'Leftover food', 'Tea leaves, coffee grounds', 'Garden waste, leaves', 'Eggshells'], tip: 'Make compost from this waste for natural manure.' },
  dry: { title: '🔵 Dry / Recyclable Waste', items: ['Paper, cardboard', 'Plastic bottles and containers', 'Glass and metal cans', 'Cloth scraps', 'Tetra packs'], tip: 'Rinse and dry items before giving them for recycling.' },
  hazard: { title: '🔴 Hazardous Waste', items: ['Batteries', 'Medicines (expired)', 'Paint and chemicals', 'Sanitary waste', 'Bulbs and CFLs'], tip: 'Wrap safely and hand over to authorised collection centres.' },
  ewaste: { title: '⚫ E-Waste', items: ['Old mobile phones', 'Chargers and cables', 'Computers and laptops', 'Earphones', 'Remote controls'], tip: 'Donate working devices or give to certified e-waste recyclers.' }
};
$$('.bin').forEach(b => {
  b.addEventListener('click', () => {
    const d = binData[b.dataset.bin];
    $('#bin-info').innerHTML =
      `<h3>${d.title}</h3><ul>${d.items.map(i => `<li>${i}</li>`).join('')}</ul><p style="margin-top:12px"><strong>💡 Tip:</strong> ${d.tip}</p>`;
  });
});

// ---------- Quiz ----------
const questions = [
  { q: 'Which gas is the main cause of global warming?', o: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'], a: 1 },
  { q: 'What does the 3R rule stand for?', o: ['Read, Write, Repeat', 'Reduce, Reuse, Recycle', 'Run, Rest, Relax', 'Remove, Repair, Replace'], a: 1 },
  { q: 'Which of these is a renewable energy source?', o: ['Coal', 'Petrol', 'Solar', 'Natural gas'], a: 2 },
  { q: 'World Environment Day is celebrated on?', o: ['5 June', '22 April', '1 January', '16 September'], a: 0 },
  { q: 'Which waste should go in the green bin?', o: ['Batteries', 'Vegetable peels', 'Plastic bottles', 'Old phones'], a: 1 }
];
let qi = 0, score = 0, answered = false;
const qEl = $('#question'), oEl = $('#options'), nextBtn = $('#next-btn'),
      resEl = $('#result'), progEl = $('#quiz-progress');

function loadQuestion() {
  answered = false;
  nextBtn.disabled = true;
  nextBtn.textContent = qi === questions.length - 1 ? 'Finish' : 'Next';
  const cur = questions[qi];
  progEl.textContent = `Question ${qi + 1} of ${questions.length}`;
  qEl.textContent = cur.q;
  oEl.innerHTML = '';
  cur.o.forEach((opt, i) => {
    const b = document.createElement('button');
    b.textContent = opt;
    b.addEventListener('click', () => selectAnswer(i));
    oEl.appendChild(b);
  });
}
function selectAnswer(i) {
  if (answered) return;
  answered = true;
  const correct = questions[qi].a;
  const btns = oEl.querySelectorAll('button');
  btns.forEach((b, idx) => {
    b.disabled = true;
    if (idx === correct) b.classList.add('correct');
  });
  if (i === correct) score++; else btns[i].classList.add('wrong');
  nextBtn.disabled = false;
}
nextBtn.addEventListener('click', () => {
  if (qi < questions.length - 1) {
    qi++;
    loadQuestion();
  } else {
    showResult();
  }
});
function showResult() {
  progEl.textContent = 'Quiz Completed!';
  qEl.textContent = '';
  oEl.innerHTML = '';
  nextBtn.style.display = 'none';
  let msg = score >= 4 ? '🌟 Eco Champion!' : score >= 2 ? '🌱 Good effort, keep learning!' : '🌍 Time to learn more!';
  resEl.innerHTML = `Your score: ${score}/${questions.length}<br>${msg}<br><button class="btn" id="retry">Try Again</button>`;
  $('#retry').addEventListener('click', () => {
    qi = 0; score = 0; resEl.innerHTML = '';
    nextBtn.style.display = 'inline-block';
    loadQuestion();
  });
}
loadQuestion();

// ---------- Carbon calculator ----------
$('#carbon-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const travel = +$('#travel').value;
  const elec = +$('#electricity').value;
  const meat = +$('#meat').value;
  const flights = +$('#flights').value;

  // Approximate yearly emission factors (kg CO2)
  const total = (travel * 365 * 0.12) + (elec * 12 * 0.82) + (meat * 52 * 2.5) + (flights * 250);
  const tonnes = (total / 1000).toFixed(2);
  const pct = Math.min(100, (tonnes / 8) * 100);

  let level, color, advice;
  if (tonnes < 2) { level = 'Low 🌿'; color = '#2e7d32'; advice = 'Great! Keep it up and inspire others.'; }
  else if (tonnes < 5) { level = 'Moderate 🌤️'; color = '#f9a825'; advice = 'Try public transport and saving electricity.'; }
  else { level = 'High 🔥'; color = '#c62828'; advice = 'Reduce travel, meat and energy use to lower your impact.'; }

  $('#carbon-result').innerHTML = `
    Your estimated footprint: <strong>${tonnes} tonnes CO₂/year</strong>
    <div class="meter"><div style="width:${pct}%; background:${color}"></div></div>
    Level: ${level}<br><small>${advice}</small>`;
});

// ---------- Pledge form with validation ----------
let pledges = +localStorage.getItem('pledges') || 0;
$('#pledge-count').textContent = pledges;

$('#pledge-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#name').value.trim();
  const email = $('#email').value.trim();
  const action = $('#action').value;
  let valid = true;

  $('#name-error').textContent = '';
  $('#email-error').textContent = '';
  $('#action-error').textContent = '';

  if (name.length < 2) { $('#name-error').textContent = 'Please enter your name (min 2 letters).'; valid = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $('#email-error').textContent = 'Please enter a valid email.'; valid = false; }
  if (!action) { $('#action-error').textContent = 'Please choose an action.'; valid = false; }

  if (valid) {
    pledges++;
    localStorage.setItem('pledges', pledges);
    $('#pledge-count').textContent = pledges;
    $('#pledge-message').textContent = `🎉 Thank you, ${name}! You pledged to: ${action}.`;
    e.target.reset();
  } else {
    $('#pledge-message').textContent = '';
  }
});

// ---------- Back to top ----------
const topBtn = $('#top-btn');
window.addEventListener('scroll', () => {
  topBtn.style.display = window.scrollY > 400 ? 'block' : 'none';
  highlightNav();
});
topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ---------- Active nav link on scroll ----------
function highlightNav() {
  let current = '';
  $$('section[id]').forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  $$('#nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

// ---------- Scroll reveal ----------
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('show'); });
}, { threshold: 0.15 });
$$('.section').forEach(s => { s.classList.add('reveal'); revealObs.observe(s); });