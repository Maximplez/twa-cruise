const tg = window.Telegram?.WebApp;

const hello = document.getElementById('hello');
if (tg?.initDataUnsafe?.user) {
  const u = tg.initDataUnsafe.user;
  hello.textContent = `Привет, ${u.first_name}${u.last_name ? ' ' + u.last_name : ''}!`;
}

tg?.expand?.();

if (tg?.MainButton) {
  tg.MainButton.setText('Отправить в бота');
  tg.MainButton.show();
  tg.MainButton.onClick(() => {
    const query = document.getElementById('query').value || '';
    const payload = { query, ts: Date.now() };
    tg.sendData(JSON.stringify(payload));
  });
}

const verifyBtn = document.getElementById('verify');
const verifyOut = document.getElementById('verify-result');
verifyBtn?.addEventListener('click', async () => {
  try {
    const init_data = tg?.initData || '';
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ init_data })
    });
    const data = await res.json();
    verifyOut.textContent = `initData valid: ${data.ok}`;
  } catch (e) {
    verifyOut.textContent = 'Ошибка проверки: ' + String(e);
  }
});
