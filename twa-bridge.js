(function () {
  function getRootVm() {
    var el = document.getElementById('ces');
    return el && el.__vue__ ? el.__vue__ : null;
  }
  function getStore() {
    var vm = getRootVm();
    return vm && vm.$store ? vm.$store : null;
  }
  function collectPayload(store) {
    try {
      var f = store?.state?.form ?? {};
      var s = store?.state?.settings ?? {};
      return {
        vendors: f.vendors,
        flightFrom: f.flightFrom,
        type: f.type,
        regions: f.regions,
        departurePort: f.departurePort,
        ships: f.ships,
        fares: f.fares,
        length: { min: f.minLength, max: f.maxLength },
        dates: { from: f.dateFrom, till: f.dateTill },
        people: { adults: f.adults, children: f.children },
        rusGroup: f.rus,
        available: f.available,
        currency: s.currency || 'EUR',
        timestamp: f.timestamp || Date.now()
      };
    } catch (e) {
      return { error: 'collect-failed', message: String(e) };
    }
  }

  function sendToTelegram() {
    var store = getStore();
    var payload = collectPayload(store || {});
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify(payload));
      try { window.Telegram.WebApp.HapticFeedback.impactOccurred('soft'); } catch {}
      try { window.Telegram.WebApp.showPopup({ title: 'Отправлено', message: 'Параметры поиска отправлены боту', buttons: [{type:'ok'}] }); } catch {}
    } else {
      console.log('[TWA] Payload:', payload);
      alert('Отправлено: ' + JSON.stringify(payload, null, 2));
    }
  }

  function bindHandlers() {
    const root = document.getElementById('ces');
    if (!root) return;

    // 1) Перехват всех submit внутри #ces
    root.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();
      sendToTelegram();
      return false;
    }, true); // capture

    // 2) Перехват кликов по «кнопкам-сабмитам» (если submit не стреляет)
    root.addEventListener('click', function (e) {
      const t = e.target.closest('button, a');
      if (!t) return;
      const isSubmit = t.type === 'submit' || t.getAttribute('type') === 'submit'
        || t.classList.contains('btn-primary') || t.classList.contains('ces-button')
        || /подобрать/i.test(t.textContent || '');
      if (isSubmit) {
        e.preventDefault();
        e.stopPropagation();
        sendToTelegram();
        return false;
      }
    }, true);
  }

  function ready(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(fn, 0);
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    try {
      if (window.Telegram?.WebApp) {
        Telegram.WebApp.expand();
        Telegram.WebApp.MainButton.hide();
        Telegram.WebApp.setHeaderColor('secondary_bg_color');
        Telegram.WebApp.setBackgroundColor('secondary_bg_color');
      }
    } catch {}

    // ждём, пока смонтируется Vue-виджет, потом вешаем обработчики
    let tries = 60;
    const timer = setInterval(() => {
      if (getRootVm()) {
        clearInterval(timer);
        bindHandlers();
      } else if (--tries <= 0) {
        clearInterval(timer);
        console.warn('[TWA] Vue root not found (#ces.__vue__).');
      }
    }, 250);
  });
})();
