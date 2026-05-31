/* ============================================================
   STATE
   ============================================================ */
const answers = { q1: '', q2: '', q3: '' };

/* ============================================================
   SUPABASE
   ============================================================ */
async function saveAnswers() {
  const { error } = await supabaseClient
    .from('answers')
    .insert([{
      q1: answers.q1,
      q2: answers.q2,
      q3: answers.q3
    }]);

  if (error) {
    console.error('Ошибка сохранения:', error);
  }
}

async function loadAnswers() {
  const { data, error } = await supabaseClient
    .from('answers')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Ошибка загрузки:', error);
    return [];
  }

  return data;
}

/* ============================================================
   PAGE TRANSITIONS
   ============================================================ */
function goTo(fromId, toId) {
  const from = document.getElementById(fromId);
  const to = document.getElementById(toId);

  from.classList.add('exit-left');
  from.classList.remove('active');

  to.style.transform = 'translateX(100%)';
  to.style.opacity = '0';

  setTimeout(() => {
    to.classList.add('active');
    to.style.transform = '';
    to.style.opacity = '';
  }, 80);

  setTimeout(() => {
    from.classList.remove('exit-left');
  }, 900);
}

/* ============================================================
   Q1 → Q2
   ============================================================ */
function goToPage2() {
  const val = document.getElementById('answer1').value.trim();

  if (!val) {
    shakeInput('answer1');
    return;
  }

  answers.q1 = val;

  goTo('page1', 'page2');
  setupYesButton();
}

/* ============================================================
   YES BUTTON
   ============================================================ */
function setupYesButton() {
  const btn = document.getElementById('yesBtn');
  btn.style.position = 'static';
}

function tryYes(e) {
  e.preventDefault();

  const btn = document.getElementById('yesBtn');

  if (btn.style.position !== 'fixed') {
    const rect = btn.getBoundingClientRect();

    btn.style.position = 'fixed';
    btn.style.left = rect.left + 'px';
    btn.style.top = rect.top + 'px';
    btn.style.margin = '0';
  }

  moveYes();
}

function moveYes() {
  const btn = document.getElementById('yesBtn');

  const margin = 10;
  const bw = btn.offsetWidth;
  const bh = btn.offsetHeight;

  const maxX = window.innerWidth - bw - margin;
  const maxY = window.innerHeight - bh - margin;

  const newX = Math.random() * maxX + margin;
  const newY = Math.random() * maxY + margin;

  btn.style.transition = 'left .18s, top .18s';
  btn.style.left = newX + 'px';
  btn.style.top = newY + 'px';
}

document.addEventListener('mousemove', (e) => {
  const btn = document.getElementById('yesBtn');

  if (!btn || btn.style.position !== 'fixed') return;

  const rect = btn.getBoundingClientRect();

  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const dist = Math.hypot(
    e.clientX - cx,
    e.clientY - cy
  );

  if (dist < 100) moveYes();
});

document.addEventListener('touchmove', (e) => {
  const btn = document.getElementById('yesBtn');

  if (!btn || btn.style.position !== 'fixed') return;

  const t = e.touches[0];
  const rect = btn.getBoundingClientRect();

  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const dist = Math.hypot(
    t.clientX - cx,
    t.clientY - cy
  );

  if (dist < 120) moveYes();
}, { passive: true });

/* ============================================================
   Q2 → Q3
   ============================================================ */
function goToPage3() {
  answers.q2 = 'Нет';

  const btn = document.getElementById('yesBtn');
  btn.style.display = 'none';

  goTo('page2', 'page3');
}

/* ============================================================
   Q3 → FINAL
   ============================================================ */
async function goToFinal() {
  const val = document.getElementById('answer3').value.trim();

  if (!val) {
    shakeInput('answer3');
    return;
  }

  answers.q3 = val;

  await saveAnswers();

  goTo('page3', 'pageFinal');
  launchEmojis();
}

/* ============================================================
   FINAL → ADMIN
   ============================================================ */
async function goToAdmin() {
  const allAnswers = await loadAnswers();

  const container = document.querySelector('.admin-inner');

  container.innerHTML = `
    <h2 class="admin-title">📋 Все ответы пользователей</h2>
  `;

  allAnswers.forEach(item => {
    container.innerHTML += `
      <div class="answer-card">
        <div class="answer-label">01 · Что ты ела сегодня?</div>
        <div class="answer-value">${item.q1 || '—'}</div>

        <div class="answer-label">02 · Тебя зовут Олеся?</div>
        <div class="answer-value">${item.q2 || '—'}</div>

        <div class="answer-label">03 · Почему у тебя 2 руки?</div>
        <div class="answer-value">${item.q3 || '—'}</div>
      </div>
    `;
  });

  container.innerHTML += `
    <button class="next-btn" onclick="restart()" style="margin-top:2rem;">
      <span>Начать заново</span>
    </button>
  `;

  goTo('pageFinal', 'pageAdmin');
}

/* ============================================================
   RESTART
   ============================================================ */
function restart() {
  answers.q1 = '';
  answers.q2 = '';
  answers.q3 = '';

  document.getElementById('answer1').value = '';
  document.getElementById('answer3').value = '';

  const yesBtn = document.getElementById('yesBtn');

  yesBtn.style.display = '';
  yesBtn.style.position = 'static';

  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active', 'exit-left');
  });

  document.getElementById('page1').classList.add('active');
}

/* ============================================================
   EMOJIS
   ============================================================ */
function launchEmojis() {
  const container = document.getElementById('emojis-container');
  container.innerHTML = '';

  const emojis = ['🌸','💕','✨','🎉','🌺','💖','🦋','🌷','💗','🎊','🥰','🌼'];

  for (let i = 0; i < 28; i++) {
    const el = document.createElement('span');

    el.className = 'emoji-fly';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    el.style.left = Math.random() * 96 + '%';
    el.style.animationDelay = (Math.random() * 2.5) + 's';
    el.style.animationDuration = (2.5 + Math.random() * 2) + 's';
    el.style.fontSize = (1.5 + Math.random() * 2) + 'rem';

    container.appendChild(el);
  }
}

/* ============================================================
   SHAKE
   ============================================================ */
function shakeInput(id) {
  const el = document.getElementById(id);

  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake .4s ease';
}

const shakeStyle = document.createElement('style');

shakeStyle.textContent = `
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}`;

document.head.appendChild(shakeStyle);

/* ============================================================
   ENTER
   ============================================================ */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;

  const p1 = document.getElementById('page1');
  const p3 = document.getElementById('page3');

  if (p1.classList.contains('active')) goToPage2();
  if (p3.classList.contains('active')) goToFinal();
});
