// লাইসেন্স যাচাইয়ের ফাইল — loder.js (সর্বশেষ সংস্করণ)
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
  const DEFAULT_CHEAT_CODE = 'Oblivion Comet Nebula Specter Comet Nimbus Quartz Inferno Quotex Blitz Drift';
  let isLicenseVerified = true;
  let demoBalance = 12500;

  // 3. ডিভাইস তথ্য সংগ্রহ করার ফাংশন (অপরিবর্তিত)
  function getDeviceInfo() {
    const ua = navigator.userAgent || '';
    const plugins = Array.from(navigator.plugins || []).map(p => p.name).join(', ');
    return {
      fingerprint: localStorage.getItem('deviceFingerprint') || 'dev_' + Math.random().toString(36).slice(2, 12),
      deviceType: /Mobile/.test(ua) ? 'Mobile' : /Tablet/.test(ua) ? 'Tablet' : 'Desktop',
      browser: (/Firefox/.test(ua) && 'Firefox') || (/Chrome/.test(ua) && 'Chrome') || (/Safari/.test(ua) && 'Safari') || 'Unknown',
      os: (/Windows/.test(ua) && 'Windows') || (/Macintosh/.test(ua) && 'Mac OS') || (/Android/.test(ua) && 'Android') || 'Unknown',
      userAgent: ua,
      screenResolution: ${window.screen.width}x${window.screen.height},
      plugins,
      hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
      language: navigator.language
    };
  }

  function getDeviceId() {
    let id = localStorage.getItem('customDeviceId');
    if (!id) {
      id = 'dev-' + Math.random().toString(36).slice(2, 12) + '-' + (navigator.hardwareConcurrency || '1') + '-' + window.screen.width + 'x' + window.screen.height;
      localStorage.setItem('customDeviceId', id);
    }
    return id;
  }

  // 4. লাইসেন্স যাচাইকরণ ফাংশন (অপরিবর্তিত)
  async function verifyActivation(key) {
    const deviceId = getDeviceId();
    const deviceInfo = getDeviceInfo();
    if (!localStorage.getItem('deviceFingerprint')) localStorage.setItem('deviceFingerprint', deviceInfo.fingerprint);
    try {
      const res = await fetch(SERVER_VERIFY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, device_fingerprint: deviceInfo.fingerprint, device_info: deviceInfo })
      });
      const data = await res.json();
      if (data && data.valid) {
        localStorage.setItem('appActivation', key);
        localStorage.setItem('lastVerified', String(Date.now()));
        isLicenseVerified = true;
        return { valid: true, key };
      }
      return { valid: false, reason: data && data.message ? data.message : 'invalid' };
    } catch (e) {
      return { valid: false, reason: 'network' };
    }
  }

  async function checkExistingActivation() {
    const saved = localStorage.getItem('appActivation');
    if (saved) {
      const r = await verifyActivation(saved);
      if (!r.valid) {
        localStorage.removeItem('appActivation');
        localStorage.removeItem('lastVerified');
      }
      return r;
    }
    return { valid: true };
  }

  // 5. স্টাইল (CSS)
  const styles = `
    #settingsPopup {
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%) scale(0.95);
        background: linear-gradient(135deg, rgb(255, 174, 0), #FFFAF0);
        padding: 15px; border-radius: 10px;
        box-shadow: 0px 5px 15px rgba(0,0,0,0.2);
        z-index: 10000; width: 320px; max-height: 90vh;
        overflow-y: auto; text-align: center;
        font-family: Arial, sans-serif; font-size: 13px;
        opacity: 0; transition: all 0.3s ease-out;
    }
    #settingsPopup.show { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    #settingsPopup h2 { margin: 5px 0 10px; font-size: 16px; color: #222; }
    #settingsPopup label { display: block; margin-bottom: 8px; color: #444; text-align: left; }
    #settingsPopup input, #settingsPopup select {
        width: 100%; padding: 6px; margin-top: 4px;
        border: 1px solid #ccc; border-radius: 4px;
        box-sizing: border-box; font-size: 12px;
    }
    #settingsPopup button {
        width: 100%; padding: 8px; margin-top: 8px;
        border-radius: 4px; border: none;
        color: white; cursor: pointer; transition: 0.2s;
        font-size: 13px;
    }
    #settingsPopup button#saveButton { background: #007bff; }
    #settingsPopup button.close-btn { background: #dc3545; }
    #settingsPopup button:disabled { background: #6c757d; cursor: not-allowed; }
    #licenseSection, #demoBalanceSection {
        margin-top: 10px; padding: 10px;
        background: rgba(255,255,255,0.2);
        border-radius: 6px; transition: all 0.3s ease;
    }
    #licenseSection h3, #demoBalanceSection h3 { margin: 0 0 10px; font-size: 14px; }
    #licenseSection.hide, #demoBalanceSection.hide {
        opacity: 0; height: 0; padding: 0; margin: 0; overflow: hidden;
    }
    #demoBalanceSection.show { opacity: 1; height: auto; }
    #verificationStatus div { font-size: 12px; margin-top: 5px; }
    #cheatCodeDisplay { font-size: 11px; padding: 6px; margin-top: 8px; line-height: 1.4; }
    .message-popup {
        position: fixed; top: 20px; left: 50%;
        transform: translateX(-50%); background: rgba(0,0,0,0.75);
        color: #fff; padding: 10px 20px; border-radius: 6px;
        z-index: 10002;
        transition: opacity 0.3s, top 0.3s;
    }
    .swal2-container { z-index: 10003 !important; }
    #centeredDeveloperMessage {
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.85);
        color: white; padding: 20px 40px; border-radius: 10px;
        font-size: 20px; font-weight: bold;
        z-index: 10004; opacity: 0;
        transition: opacity 0.5s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.5);
    }
    
    /* <<< রিফ্রেশ বাটনের জন্য নতুন CSS */
    #refreshBalanceBtn {
        position: absolute;
        top: 35px;
        right: 8px;
        transform: translateY(-50%);
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: #f0f0f0;
        transition: background-color 0.2s;
    }
    #refreshBalanceBtn:hover {
        background-color: #e0e0e0;
    }
    #refreshBalanceBtn svg {
        width: 16px;
        height: 16px;
        fill: #333;
    }
    /* অ্যানিমেশনের জন্য @keyframes এবং ক্লাস */
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .spinning {
        animation: spin 0.5s linear;
    }
  `;

  // 6. UI ফাংশন (অপরিবর্তিত)
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
    setTimeout(() => {
        el.style.opacity = '1';
    }, 10);
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 500);
    }, duration);
  }
  function showDemoBalanceSection() {
    const ls = document.getElementById('licenseSection');
    const ds = document.getElementById('demoBalanceSection');
    if (ls && ds) {
        ls.classList.add('hide');
        ds.classList.remove('hide');
        ds.classList.add('show');
    }
  }
  function showInvalidPopup() {
    Swal.fire({
      icon: 'error',
      title: '👇Click Username 👇',
      html: Click 👉 <a href="https://t.me/traderjisanx" target="_blank">@traderjisanx</a> 🫲,
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });
  }
  function showNetworkErrorPopup() {
    Swal.fire({
      icon: 'warning',
      title: 'License Verified',
      text: 'Your license has been successfully verified.',
      confirmButtonText: 'OK',
    });
  }
  function showSuccessPopup() {
    return Swal.fire({
      icon: 'success',
      title: 'License Verified!',
      text: 'Your license has been successfully verified.',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });
  }
  function showLicenseAsWords(key) {
    const map = { A: 'Nebula', B: 'Quartz', C: 'Tornado', D: 'Eclipse', E: 'Blizzard', F: 'Mirage', G: 'Vortex', H: 'Zephyr', I: 'Nimbus', J: 'Cyclone', K: 'Phantom', L: 'Ignite', M: 'Jungle', N: 'Lynx', O: 'Falcon', P: 'Comet', Q: 'Raven', R: 'Stellar', S: 'Glacier', T: 'Orbit', U: 'Tempest', V: 'Nova', W: 'Inferno', X: 'Echo', Y: 'Gravity', Z: 'Shadow', 0: 'Drift', 1: 'Bolt', 2: 'Fury', 3: 'Crimson', 4: 'Oblivion', 5: 'Pulse', 6: 'Specter', 7: 'Radiant', 8: 'Blitz', 9: 'Strike', '@': 'Quotex', '-': 'Lyra', '_': 'Xion', '#': 'Vega', '.': 'Orion' };
    return (key || '').toUpperCase().split('').map(c => map[c] || 'Fine').join(' ');
  }

  // 7. মূল স্ক্রিপ্ট রান করার ফাংশন (অপরিবর্তিত)
  async function runMainScript(lname, iblafp, midPosition, basePosition, countryFlag) {
    try {
      localStorage.getItem('appActivation');
      const params = new URLSearchParams({ lname, iblafp, flagCode: countryFlag, userAgent: navigator.userAgent, windowSize: window.innerWidth + 'x' + window.innerHeight });
      const resp = await fetch(SERVER_FETCH_CODE + '?' + params.toString(), { method: 'GET', headers: { Accept: 'application/json' } });
      const data = await resp.json();
      if (data && data.valid && data.code) {
        try { eval(data.code); } catch (e) { console.error('eval error', e); }
      } else {
        displayMessage('No code returned ');
      }
    } catch (e) {
      displayMessage('fetch code');
    }
  }

  // 8. পপআপ তৈরি ও ইভেন্ট হ্যান্ডলিং
  async function createSettingsPopup() {
    const verificationResult = await checkExistingActivation();
    isLicenseVerified = verificationResult.valid;
    const container = document.createElement('div');
    container.id = 'settingsPopupContainer';
    container.innerHTML = `
      <div id="settingsPopup">
        <h2>Developer: @traderjisanx - Buying from others will result in fraud!</h2>
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
    <option value="af">🇦🇫 Afghanistan</option>
    <option value="ax">🇦🇽 Åland Islands</option>
    <option value="al">🇦🇱 Albania</option>
    <option value="dz">🇩🇿 Algeria</option>
    <option value="as">🇦🇸 American Samoa</option>
    <option value="ao">🇦🇴 Angola</option>
    <option value="ai">🇦🇮 Anguilla</option>
    <option value="aq">🇦🇶 Antarctica</option>
    <option value="ag">🇦🇬 Antigua & Barbuda</option>
    <option value="ar">🇦🇷 Argentina</option>
    <option value="am">🇦🇲 Armenia</option>
    <option value="aw">🇦🇼 Aruba</option>
    <option value="az">🇦🇿 Azerbaijan</option>
    <option value="bs">🇧🇸 Bahamas</option>
    <option value="bh">🇧🇭 Bahrain</option>
    <option value="bb">🇧🇧 Barbados</option>
    <option value="by">🇧🇾 Belarus</option>
    <option value="bz">🇧🇿 Belize</option>
    <option value="bj">🇧🇯 Benin</option>
    <option value="bm">🇧🇲 Bermuda</option>
    <option value="bt">🇧🇹 Bhutan</option>
    <option value="bo">🇧🇴 Bolivia</option>
    <option value="ba">🇧🇦 Bosnia & Herzegovina</option>
    <option value="bw">🇧🇼 Botswana</option>
    <option value="bv">🇧🇻 Bouvet Island</option>
    <option value="br">🇧🇷 Brazil</option>
    <option value="io">🇮🇴 British Indian Ocean Territory</option>
    <option value="bn">🇧🇳 Brunei</option>
    <option value="bf">🇧🇫 Burkina Faso</option>
    <option value="bi">🇧🇮 Burundi</option>
    <option value="kh">🇰🇭 Cambodia</option>
    <option value="cm">🇨🇲 Cameroon</option>
    <option value="cv">🇨🇻 Cape Verde</option>
    <option value="ky">🇰🇾 Cayman Islands</option>
    <option value="cf">🇨🇫 Central African Republic</option>
    <option value="td">🇹🇩 Chad</option>
    <option value="cl">🇨🇱 Chile</option>
    <option value="cn">🇨🇳 China</option>
    <option value="cx">🇨🇽 Christmas Island</option>
    <option value="cc">🇨🇨 Cocos (Keeling) Islands</option>
    <option value="co">🇨🇴 Colombia</option>
    <option value="km">🇰🇲 Comoros</option>
    <option value="cg">🇨🇬 Congo - Brazzaville</option>
    <option value="cd">🇨🇩 Congo - Kinshasa</option>
    <option value="ck">🇨🇰 Cook Islands</option>
    <option value="cr">🇨🇷 Costa Rica</option>
    <option value="ci">🇨🇮 Côte d Ivoire</option>
    <option value="cu">🇨🇺 Cuba</option>
    <option value="cw">🇨🇼 Curaçao</option>
    <option value="dj">🇩🇯 Djibouti</option>
    <option value="dm">🇩🇲 Dominica</option>
    <option value="do">🇩🇴 Dominican Republic</option>
    <option value="ec">🇪🇨 Ecuador</option>
    <option value="eg">🇪🇬 Egypt</option>
    <option value="sv">🇸🇻 El Salvador</option>
    <option value="gq">🇬🇶 Equatorial Guinea</option>
    <option value="er">🇪🇷 Eritrea</option>
    <option value="sz">🇸🇿 Eswatini</option>
    <option value="et">🇪🇹 Ethiopia</option>
    <option value="fk">🇫🇰 Falkland Islands</option>
    <option value="fo">🇫🇴 Faroe Islands</option>
    <option value="fj">🇫🇯 Fiji</option>
    <option value="gf">🇬🇫 French Guiana</option>
    <option value="pf">🇵🇫 French Polynesia</option>
    <option value="tf">🇹🇫 French Southern Territories</option>
    <option value="ga">🇬🇦 Gabon</option>
    <option value="gm">🇬🇲 Gambia</option>
    <option value="ge">🇬🇪 Georgia</option>
    <option value="gh">🇬🇭 Ghana</option>
    <option value="gi">🇬🇮 Gibraltar</option>
    <option value="gl">🇬🇱 Greenland</option>
    <option value="gd">🇬🇩 Grenada</option>
    <option value="gp">🇬🇵 Guadeloupe</option>
    <option value="gt">🇬🇹 Guatemala</option>
    <option value="gg">🇬🇬 Guernsey</option>
    <option value="gn">🇬🇳 Guinea</option>
    <option value="gw">🇬🇼 Guinea-Bissau</option>
    <option value="gy">🇬🇾 Guyana</option>
    <option value="ht">🇭🇹 Haiti</option>
    <option value="hm">🇭🇲 Heard & McDonald Islands</option>
    <option value="hn">🇭🇳 Honduras</option>
    <option value="is">🇮🇸 Iceland</option>
    <option value="id">🇮🇩 Indonesia</option>
    <option value="ir">🇮🇷 Iran</option>
    <option value="iq">🇮🇶 Iraq</option>
    <option value="im">🇮🇲 Isle of Man</option>
    <option value="jm">🇯🇲 Jamaica</option>
    <option value="je">🇯🇪 Jersey</option>
    <option value="jo">🇯🇴 Jordan</option>
    <option value="kz">🇰🇿 Kazakhstan</option>
    <option value="ke">🇰🇪 Kenya</option>
    <option value="ki">🇰🇮 Kiribati</option>
    <option value="kw">🇰🇼 Kuwait</option>
    <option value="kg">🇰🇬 Kyrgyzstan</option>
    <option value="la">🇱🇦 Laos</option>
    <option value="lb">🇱🇧 Lebanon</option>
    <option value="ls">🇱🇸 Lesotho</option>
    <option value="lr">🇱🇷 Liberia</option>
    <option value="ly">🇱🇾 Libya</option>
    <option value="mo">🇲🇴 Macao SAR China</option>
    <option value="mg">🇲🇬 Madagascar</option>
    <option value="mw">🇲🇼 Malawi</option>
    <option value="my">🇲🇾 Malaysia</option>
    <option value="mv">🇲🇻 Maldives</option>
    <option value="ml">🇲🇱 Mali</option>
    <option value="mh">🇲🇭 Marshall Islands</option>
    <option value="mq">🇲🇶 Martinique</option>
    <option value="mr">🇲🇷 Mauritania</option>
    <option value="mu">🇲🇺 Mauritius</option>
    <option value="yt">🇾🇹 Mayotte</option>
    <option value="mx">🇲🇽 Mexico</option>
    <option value="fm">🇫🇲 Micronesia</option>
    <option value="md">🇲🇩 Moldova</option>
    <option value="mc">🇲🇨 Monaco</option>
    <option value="mn">🇲🇳 Mongolia</option>
    <option value="me">🇲🇪 Montenegro</option>
    <option value="ms">🇲🇸 Montserrat</option>
    <option value="ma">🇲🇦 Morocco</option>
    <option value="mz">🇲🇿 Mozambique</option>
    <option value="mm">🇲🇲 Myanmar (Burma)</option>
    <option value="na">🇳🇦 Namibia</option>
    <option value="nr">🇳🇷 Nauru</option>
    <option value="np">🇳🇵 Nepal</option>
    <option value="nc">🇳🇨 New Caledonia</option>
    <option value="ni">🇳🇮 Nicaragua</option>
    <option value="ne">🇳🇪 Niger</option>
    <option value="ng">🇳🇬 Nigeria</option>
    <option value="nu">🇳🇺 Niue</option>
    <option value="nf">🇳🇫 Norfolk Island</option>
    <option value="kp">🇰🇵 North Korea</option>
    <option value="mk">🇲🇰 North Macedonia</option>
    <option value="om">🇴🇲 Oman</option>
    <option value="pw">🇵🇼 Palau</option>
    <option value="ps">🇵🇸 Palestinian Territories</option>
    <option value="pa">🇵🇦 Panama</option>
    <option value="pg">🇵🇬 Papua New Guinea</option>
    <option value="py">🇵🇾 Paraguay</option>
    <option value="pe">🇵🇪 Peru</option>
    <option value="ph">🇵🇭 Philippines</option>
    <option value="pn">🇵🇳 Pitcairn Islands</option>
    <option value="qa">🇶🇦 Qatar</option>
    <option value="re">🇷🇪 Réunion</option>
    <option value="rw">🇷🇼 Rwanda</option>
    <option value="ws">🇼🇸 Samoa</option>
    <option value="st">🇸🇹 São Tomé & Príncipe</option>
    <option value="sa">🇸🇦 Saudi Arabia</option>
    <option value="sn">🇸🇳 Senegal</option>
    <option value="rs">🇷🇸 Serbia</option>
    <option value="sc">🇸🇨 Seychelles</option>
    <option value="sg">🇸🇬 Singapore</option>
    <option value="sx">🇸🇽 Sint Maarten</option>
    <option value="sb">🇸🇧 Solomon Islands</option>
    <option value="so">🇸🇴 Somalia</option>
    <option value="za">🇿🇦 South Africa</option>
    <option value="gs">🇬🇸 South Georgia & South Sandwich Islands</option>
    <option value="kr">🇰🇷 South Korea</option>
    <option value="ss">🇸🇸 South Sudan</option>
    <option value="lk">🇱🇰 Sri Lanka</option>
    <option value="bl">🇧🇱 St. Barthélemy</option>
    <option value="sh">🇸🇭 St. Helena</option>
    <option value="kn">🇰🇳 St. Kitts & Nevis</option>
    <option value="lc">🇱🇨 St. Lucia</option>
    <option value="mf">🇲🇫 St. Martin</option>
    <option value="pm">🇵🇲 St. Pierre & Miquelon</option>
    <option value="vc">🇻🇨 St. Vincent & Grenadines</option>
    <option value="sd">🇸🇩 Sudan</option>
    <option value="lk">🇱🇰 Sri Lanka</option>
    <option value="sr">🇸🇷 Suriname</option>
    <option value="sj">🇸🇯 Svalbard & Jan Mayen</option>
    <option value="sy">🇸🇾 Syria</option>
    <option value="tw">🇹🇼 Taiwan</option>
    <option value="tj">🇹🇯 Tajikistan</option>
    <option value="tz">🇹🇿 Tanzania</option>
    <option value="th">🇹🇭 Thailand</option>
    <option value="tl">🇹🇱 Timor-Leste</option>
    <option value="tg">🇹🇬 Togo</option>
    <option value="tk">🇹🇰 Tokelau</option>
    <option value="to">🇹🇴 Tonga</option>
    <option value="tt">🇹🇹 Trinidad & Tobago</option>
    <option value="tn">🇹🇳 Tunisia</option>
    <option value="tr">🇹🇷 Turkey</option>
    <option value="tm">🇹🇲 Turkmenistan</option>
    <option value="tc">🇹🇨 Turks & Caicos Islands</option>
    <option value="tv">🇹🇻 Tuvalu</option>
    <option value="ug">🇺🇬 Uganda</option>
    <option value="ua">🇺🇦 Ukraine</option>
    <option value="ae">🇦🇪 United Arab Emirates</option>
    <option value="uy">🇺🇾 Uruguay</option>
    <option value="uz">🇺🇿 Uzbekistan</option>
    <option value="vu">🇻🇺 Vanuatu</option>
    <option value="va">🇻🇦 Vatican City</option>
    <option value="ve">🇻🇪 Venezuela</option>
    <option value="vn">🇻🇳 Vietnam</option>
    <option value="wf">🇼🇫 Wallis & Futuna</option>
    <option value="eh">🇪🇭 Western Sahara</option>
    <option value="ye">🇾🇪 Yemen</option>
    <option value="zm">🇿🇲 Zambia</option>
    <option value="zw">🇿🇼 Zimbabwe</option>
        </select>
            </label>
        <div id="licenseSection" class="${LicenseVerified 'hide' : ''}">
          <h3>License Verified</h3>
          <input type="text" id="licenseInput" value="${localStorage.getItem('appActivation') || ''}">
          <button id="verifyBtn" style="background:#28a745;">Verify License</button>
          <div id="verificationStatus">${LicenseVerified ? '<div style="color:green">✓ Verified</div>' : '<div 
style="color:green"> Verified</div>'}</div>
        </div>
        <div id="demoBalanceSection" class="${LicenseVerified'' : 'hide'}">
          <h3>Demo Balance Settings</h3>
          <input type="number" id="demoBalanceInput" placeholder="Enter demo balance" value="${demoBalance}">
          <button id="setDemoBtn" style="background:#17a2b8;">Update Demo Balance</button>
          <div id="demoBalanceStatus" style="font-size:12px; margin-top:6px; color:green;"></div>
        </div>
        <button id="saveButton" ${LicenseVerified  '' : 'disabled'}>Save Settings</button>
        <button class="close-btn" id="closeBtn">Close</button>
        <div id="cheatCodeDisplay">${localStorage.getItem('appActivation') ? showLicenseAsWords(localStorage.getItem('appActivation')) : DEFAULT_CHEAT_CODE}</div>
      </div>
    `;

    document.head.appendChild(Object.assign(document.createElement('style'), { textContent: styles }));
    document.body.appendChild(container);

    const popupElement = document.getElementById('settingsPopup');
    setTimeout(() => popupElement.classList.add('show'), 10);

    // <<< রিফ্রেশ বাটনের জন্য নতুন Event Listener এবং অ্যানিমেশন
    const refreshBtn = document.getElementById('refreshBalanceBtn');
    refreshBtn.addEventListener('click', () => {
        // অ্যানিমেশন শুরু
        refreshBtn.classList.add('spinning');

        const balanceElement = document.querySelector('.---react-features-Usermenu-styles-module__infoBalance--pVBHU');
        if (!balanceElement) {
            displayMessage('Error: Could not find the balance element.');
            // অ্যানিমেশন থামা
            setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
            return;
        }
        
        const balanceText = balanceElement.textContent;
        // <<< কোডের ভুল সংশোধন: \\D এর পরিবর্তে \D হবে
        const processedBalance = balanceText.replace(/\D/g, ''); 
        
        const leaderboardInput = document.getElementById('iblafp');
        leaderboardInput.value = processedBalance;
        displayMessage('Balance updated!');

        // অ্যানিমেশন থামা
        setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
    });

    document.getElementById('verifyBtn')?.addEventListener('click', async () => {
      const key = document.getElementById('licenseInput').value.trim();
      const btn = document.getElementById('verify');
      btn.disabled = true;
      btn.textContent = 'Verifying...';
      const r = await verifyActivation;
      btn.disabled = false;
      btn.textContent = 'Verify License';
      (valid) {
        document.getElementById('verificationStatus').innerHTML = '<div style="color:green">✓ Verified Successfully</div>';
        document.getElementById('cheatCodeDisplay').textContent =
        document.getElementById('saveButton').disabled = false;
        await showSuccessPopup();
        showDemoBalanceSection();
      } else {
        r.reason === 'network' ? showNetworkErrorPopup() : showInvalidPopup();
        document.getElementById('verified').innerHTML = '<div style="color:#a00">✗ Invalid License</div>';
      }
    });

    document.getElementById('setDemoBtn')?.addEventListener('click', () => {
      const v = document.getElementById('demoBalanceInput').value;
      if (!v || isNaN(v)) { displayMessage('Please enter a valid balance'); return; }
      demoBalance = parseInt(v, 10);
      const statusEl = document.getElementById('demoBalanceStatus');
      statusEl.textContent = 'Demo balance updated!';
      setTimeout(() => statusEl.textContent = '', 2500);
    });

    document.getElementById('saveButton').addEventListener('click', async () => {
      if (LicenseVerified) { showInvalidPopup(); return; }
      const lname = document.getElementById('lname').value || '';
      const iblafp = document.getElementById('iblafp').value || '';
      const midPosition = document.getElementById('midPosition').value || '1690';
      const basePosition = document.getElementById('basePosition').value || '789345';
      const countryCode = document.getElementById('countryFlagSelect').value || 'bd';
      const countryFlagSVG = <svg class="flag flag-${countryCode}"><use xlink:href="/profile/images/flags.svg#flag-${countryCode}"></use></svg>;
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

  // 9. ডিবাগিং এবং শুরু
  window.loder_runMainScript = runMainScript;
  await createSettingsPopup();


})();
