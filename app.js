// ── State ────────────────────────────────────────────────
const state = {
  carrotBalance: 500,
  coinBalance: 1050,
  activeOverlay: null,
  selectedIndex: null,
  pagedIndex: 0,
  selectedAction: null,
  unreadCount: 3,
  memberStates: ['healthy','wilting','wilting','healthy','healthy','healthy'],
  memberNames: ['Me','Jennie','Min','Sumant','Blake','Lee'],
  memberIsSelf: [true,false,false,false,false,false],
};

// ── DOM refs ─────────────────────────────────────────────
const bellBtn       = document.getElementById('bellBtn');
const notifBadge    = document.getElementById('notifBadge');
const notifBackdrop = document.getElementById('notifBackdrop');
const notifPanel    = document.getElementById('notifPanel');
const profileBtn    = document.getElementById('profileBtn');
const currencyRow   = document.getElementById('currencyRow');
const cardGrid      = document.getElementById('cardGrid');
const sectionTitle  = document.getElementById('sectionTitle');
const backBtn       = document.getElementById('backBtn');
const carousel      = document.getElementById('carousel');
const carouselTrack = document.getElementById('carouselTrack');
const grassZone     = document.getElementById('grassZone');
const sendBar       = document.getElementById('sendBar');
const sendBtn       = document.getElementById('sendBtn');
const careOverlay   = document.getElementById('careOverlay');
const careTargetName= document.getElementById('careTargetName');
const careSendBtn   = document.getElementById('careSendBtn');
const profileView   = document.getElementById('profileView');
const profileBack   = document.getElementById('profileBack');
const marketView    = document.getElementById('marketView');
const marketBack    = document.getElementById('marketBack');
const bannerTrack   = document.getElementById('bannerTrack');
const bannerDots    = document.getElementById('bannerDots').querySelectorAll('.banner-dot');

// ── Init ─────────────────────────────────────────────────
function init() {
  updateBalanceDisplay();
  bindCardGrid();
  bindStickerButtons();
  bindBannerDots();
  bindEvents();
}

// ── Balance ───────────────────────────────────────────────
function updateBalanceDisplay() {
  document.getElementById('carrotBal').textContent = state.carrotBalance.toLocaleString();
  document.getElementById('coinBal').textContent   = state.coinBalance.toLocaleString();
  document.getElementById('pCarrot').textContent   = state.carrotBalance.toLocaleString();
  document.getElementById('pCoin').textContent     = state.coinBalance.toLocaleString();
  if (state.unreadCount > 0) {
    notifBadge.textContent = state.unreadCount;
    notifBadge.classList.remove('hidden');
  } else {
    notifBadge.classList.add('hidden');
  }
}

// ── Card grid clicks ──────────────────────────────────────
function bindCardGrid() {
  cardGrid.querySelectorAll('.member-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var idx = parseInt(card.getAttribute('data-index'), 10);
      openIndividual(idx);
    });
  });
}

function openIndividual(index) {
  state.selectedIndex  = index;
  state.pagedIndex     = index;
  state.selectedAction = null;

  cardGrid.classList.add('hidden');
  sectionTitle.classList.add('hidden');
  backBtn.classList.remove('hidden');
  carousel.classList.remove('hidden');
  grassZone.classList.add('hidden');

  var isSelf = state.memberIsSelf[index];
  if (isSelf) {
    sendBar.classList.add('hidden');
  } else {
    sendBar.classList.remove('hidden');
  }

  setTimeout(function() {
    var target = document.getElementById('cc' + index);
    if (target) target.scrollIntoView({behavior:'auto', block:'nearest', inline:'center'});
  }, 30);

  carouselTrack.addEventListener('scroll', onCarouselScroll, {passive:true});
}

function onCarouselScroll() {
  var cards = carouselTrack.querySelectorAll('.carousel-card');
  var centerX = carouselTrack.scrollLeft + carouselTrack.offsetWidth / 2;
  var closest = 0, minDist = Infinity;
  cards.forEach(function(c, i) {
    var dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - centerX);
    if (dist < minDist) { minDist = dist; closest = i; }
  });
  if (state.pagedIndex !== closest) {
    state.pagedIndex     = closest;
    state.selectedAction = null;
    deselectAllStickers();
    updateCareSendBtn();
    var isSelf = state.memberIsSelf[closest];
    if (isSelf) { sendBar.classList.add('hidden'); }
    else         { sendBar.classList.remove('hidden'); }
  }
}

function backToGrid() {
  state.selectedIndex  = null;
  state.selectedAction = null;
  cardGrid.classList.remove('hidden');
  sectionTitle.classList.remove('hidden');
  backBtn.classList.add('hidden');
  carousel.classList.add('hidden');
  grassZone.classList.remove('hidden');
  sendBar.classList.add('hidden');
  hideCareOverlay();
  carouselTrack.removeEventListener('scroll', onCarouselScroll);
}

// ── Send button → open care overlay ──────────────────────
sendBtn.addEventListener('click', function() {
  var m = state.pagedIndex;
  if (state.memberIsSelf[m]) return;
  careTargetName.textContent = state.memberNames[m] + '!';
  state.selectedAction = null;
  deselectAllStickers();
  updateCareSendBtn();
  careOverlay.classList.remove('hidden');
  requestAnimationFrame(function() {
    careOverlay.style.transition = 'opacity 0.2s ease';
    careOverlay.style.opacity = '1';
  });
});

function hideCareOverlay() {
  careOverlay.style.transition = 'opacity 0.2s ease';
  careOverlay.style.opacity = '0';
  setTimeout(function() { careOverlay.classList.add('hidden'); }, 200);
}

// ── Sticker buttons ───────────────────────────────────────
function bindStickerButtons() {
  document.querySelectorAll('.sticker-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var type = btn.getAttribute('data-type');
      var grid = document.querySelector('.sticker-grid');
      if (state.selectedAction === type) {
        state.selectedAction = null;
        btn.classList.remove('selected');
        grid.classList.remove('has-selection');
      } else {
        state.selectedAction = type;
        deselectAllStickers();
        btn.classList.add('selected');
        grid.classList.add('has-selection');
      }
      updateCareSendBtn();
    });
  });
}

function deselectAllStickers() {
  document.querySelectorAll('.sticker-btn').forEach(function(b) {
    b.classList.remove('selected');
  });
  document.querySelector('.sticker-grid').classList.remove('has-selection');
}

function updateCareSendBtn() {
  if (state.selectedAction) {
    careSendBtn.classList.remove('disabled');
  } else {
    careSendBtn.classList.add('disabled');
  }
}

careSendBtn.addEventListener('click', function() {
  if (!state.selectedAction) return;
  sendCare();
});

// Tap outside care-inner to dismiss
careOverlay.addEventListener('click', function(e) {
  if (!e.target.closest('.care-inner')) {
    state.selectedAction = null;
    deselectAllStickers();
    updateCareSendBtn();
    hideCareOverlay();
  }
});

function sendCare() {
  var idx = state.pagedIndex;
  var action = state.selectedAction;
  var name = state.memberNames[idx];

  if (state.memberStates[idx] === 'wilting') {
    state.memberStates[idx] = 'healthy';
    // Update grid card
    var gridCard = cardGrid.querySelector('[data-index="' + idx + '"]');
    if (gridCard) {
      gridCard.classList.remove('wilting');
      gridCard.classList.add('healthy');
      var sticker = gridCard.querySelector('.card-sticker');
      if (sticker) sticker.src = 'assets/healthybunny.png';
      var bg = gridCard.querySelector('.card-bg');
      if (bg) bg.style.backgroundImage = "url('assets/backgroundhealthy.png')";
    }
    // Update carousel card
    var cc = document.getElementById('cc' + idx);
    if (cc) {
      cc.classList.remove('wilting');
      cc.classList.add('healthy');
      var cs = cc.querySelector('.carousel-sticker');
      if (cs) cs.src = 'assets/healthybunny.png';
      var cbg = cc.querySelector('.card-bg');
      if (cbg) cbg.style.backgroundImage = "url('assets/backgroundhealthy.png')";
      var status = cc.querySelector('.card-status');
      if (status) status.innerHTML = 'No problem so far!<br/>Everything is organized';
      var tags = cc.querySelectorAll('.hashtag');
      if (tags[0]) tags[0].textContent = '#Happy';
      if (tags[1]) tags[1].textContent = '#Hehe';
    }
  }

  if (action === 'coin') {
    state.carrotBalance = Math.max(0, state.carrotBalance - 50);
  }

  updateBalanceDisplay();
  state.selectedAction = null;
  deselectAllStickers();
  updateCareSendBtn();
  hideCareOverlay();

  // Heart burst animation after overlay fades
  setTimeout(function() { showHeartAnimation(idx); }, 180);

  // Add sent-care notification
  addSentCareNotification(name, action, idx);
}

function showHeartAnimation(idx) {
  var cc = document.getElementById('cc' + idx);
  var bezel = document.querySelector('.screen-bezel');
  if (!cc || !bezel) return;

  var cardRect  = cc.getBoundingClientRect();
  var bezelRect = bezel.getBoundingClientRect();

  var heart = document.createElement('div');
  heart.className = 'heart-burst';
  heart.textContent = '❤️';
  heart.style.left = (cardRect.left - bezelRect.left + cardRect.width  / 2) + 'px';
  heart.style.top  = (cardRect.top  - bezelRect.top  + cardRect.height / 2) + 'px';
  bezel.appendChild(heart);
  setTimeout(function() { heart.remove(); }, 950);
}

function addSentCareNotification(name, action, idx) {
  var icons = { mail:'assets/mail.png', coffee:'assets/coffee.png', coin:'assets/carrot.png', help:'assets/help.png' };
  var msgs  = { mail:'received your message!', coffee:'received your coffee!', coin:'received your carrots!', help:'received your help offer!' };
  var avatars = ['assets/Mephoto.png','assets/jenniephoto.png','assets/Minphoto.png','assets/sumantphoto.png','assets/Blakephoto.png','assets/Leephoto.png'];

  var iconSrc   = icons[action]   || 'assets/carrot.png';
  var msg       = msgs[action]    || 'received your care!';
  var avatarSrc = avatars[idx]    || '';

  var avatarHtml = avatarSrc
    ? '<img src="' + avatarSrc + '" alt="' + name + '"/>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="5" fill="#bbb"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" fill="#bbb"/></svg>';

  var row = document.createElement('div');
  row.className = 'notif-row notif-new';
  row.innerHTML =
    '<div class="notif-avatar-wrap">' +
      '<div class="notif-avatar">' + avatarHtml + '</div>' +
      '<div class="notif-icon-badge"><img src="' + iconSrc + '" alt=""/></div>' +
    '</div>' +
    '<div class="notif-text">' +
      '<div class="notif-sender">' + name + '</div>' +
      '<div class="notif-msg">' + msg + '</div>' +
    '</div>' +
    '<div class="notif-time">now</div>';

  var notifList = document.getElementById('notifList');
  notifList.insertBefore(row, notifList.firstChild);

  state.unreadCount++;
  updateBalanceDisplay();
}

// ── Notification panel ────────────────────────────────────
bellBtn.addEventListener('click', function() {
  if (state.activeOverlay === 'notifications') {
    closeNotifPanel();
  } else {
    state.activeOverlay = 'notifications';
    notifPanel.classList.remove('hidden');
    notifBackdrop.classList.remove('hidden');
    currencyRow.style.opacity = '0';
    currencyRow.style.pointerEvents = 'none';
    state.unreadCount = 0;
    notifBadge.classList.add('hidden');
  }
});

notifBackdrop.addEventListener('click', closeNotifPanel);

function closeNotifPanel() {
  state.activeOverlay = null;
  notifPanel.classList.add('hidden');
  notifBackdrop.classList.add('hidden');
  currencyRow.style.opacity = '1';
  currencyRow.style.pointerEvents = 'auto';
}

// ── Profile slide ─────────────────────────────────────────
profileBtn.addEventListener('click', function() { toggleSlide(profileView); });
profileBack.addEventListener('click', function() { closeSlide(profileView); });

// ── Market slide (via currency pill) ─────────────────────
currencyRow.addEventListener('click', function() { toggleSlide(marketView); });
marketBack.addEventListener('click', function() { closeSlide(marketView); });

function openSlide(view) {
  view.classList.add('is-open');
  view.classList.remove('hidden');
  view.style.transform = 'translateX(100%)';
  view.style.opacity   = '1';
  view.style.pointerEvents = 'auto';
  requestAnimationFrame(function() {
    view.style.transition = 'transform 0.32s cubic-bezier(0.4,0,0.2,1)';
    view.style.transform  = 'translateX(0)';
  });
}

function closeSlide(view) {
  view.classList.remove('is-open');
  view.style.transition = 'transform 0.28s cubic-bezier(0.4,0,0.2,1)';
  view.style.transform  = 'translateX(100%)';
  setTimeout(function() { view.classList.add('hidden'); }, 300);
}

function toggleSlide(view) {
  view.classList.contains('is-open') ? closeSlide(view) : openSlide(view);
}

// ── Market banner dots ────────────────────────────────────
function bindBannerDots() {
  var slides = bannerTrack.querySelectorAll('.banner-slide');
  bannerTrack.addEventListener('scroll', function() {
    if (!slides.length) return;
    var idx = Math.round(bannerTrack.scrollLeft / bannerTrack.offsetWidth);
    bannerDots.forEach(function(d, i) {
      d.classList.toggle('active', i === idx);
    });
  }, {passive:true});
}

// ── Back button ───────────────────────────────────────────
function bindEvents() {
  backBtn.addEventListener('click', backToGrid);
}

// ── Start ─────────────────────────────────────────────────
init();

// ── Splash screen ──────────────────────────────────────────
(function() {
  var splash = document.getElementById('splashScreen');
  if (!splash) return;
  setTimeout(function() {
    splash.classList.add('fade-out');
    setTimeout(function() { splash.style.display = 'none'; }, 580);
  }, 2000);
})();

// ── Carousel mouse drag-to-swipe ──────────────────────────
(function() {
  var track = document.getElementById('carouselTrack');
  if (!track) return;

  var isDown        = false;
  var startX        = 0;
  var startScroll   = 0;
  var moved         = false;  // true once drag exceeded threshold

  track.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;          // left-click only
    isDown      = true;
    moved       = false;
    startX      = e.pageX;
    startScroll = track.scrollLeft;
    track.classList.add('is-dragging');
    e.preventDefault();                  // stops text-selection
  });

  document.addEventListener('mousemove', function(e) {
    if (!isDown) return;
    var dx = e.pageX - startX;
    if (Math.abs(dx) > 5) moved = true;
    track.scrollLeft = startScroll - dx;
  });

  document.addEventListener('mouseup', function() {
    if (!isDown) return;
    isDown = false;
    track.classList.remove('is-dragging');

    if (moved) {
      // Snap to whichever card is closest to the center
      var cards   = track.querySelectorAll('.carousel-card');
      var centerX = track.scrollLeft + track.offsetWidth / 2;
      var closest = 0, minDist = Infinity;
      cards.forEach(function(c, i) {
        var dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - centerX);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      var target = cards[closest];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  });

  // Block card-click from firing after a drag
  track.addEventListener('click', function(e) {
    if (moved) {
      e.stopPropagation();
      moved = false;
    }
  }, true);
})();

// ── Market banner + gift card carousel drag-to-swipe ──────
(function() {
  var tracks = [
    document.getElementById('bannerTrack'),
    document.getElementById('giftCarousel'),
  ].filter(Boolean);

  tracks.forEach(function(track) {
    var isDown = false, startX = 0, startScroll = 0;

    track.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      isDown = true;
      startX = e.pageX;
      startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDown) return;
      track.scrollLeft = startScroll - (e.pageX - startX);
    });

    document.addEventListener('mouseup', function() {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('is-dragging');
    });
  });
})();

// ── Custom cursor (desktop) ────────────────────────────────
(function() {
  var cursor = document.getElementById('customCursor');
  if (!cursor) return;

  // Only activate on true pointer devices (mouse/trackpad)
  var mq = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!mq.matches) return;

  var cursorVisible = false;
  document.addEventListener('mousemove', function(e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    if (!cursorVisible) {
      cursorVisible = true;
      cursor.style.opacity = '1';
    }
  });

  // Tilt + scale on hover over interactive elements
  var interactiveSelector = 'button, .member-card, .market-card, a, [role="button"]';
  document.addEventListener('mouseover', function(e) {
    if (e.target.closest(interactiveSelector)) {
      cursor.style.transform = 'translate(-50%,-50%) rotate(20deg) scale(1.3)';
    } else {
      cursor.style.transform = 'translate(-50%,-50%) rotate(-20deg) scale(1)';
    }
  });

  // Press feedback
  document.addEventListener('mousedown', function() {
    cursor.classList.add('clicking');
  });
  document.addEventListener('mouseup', function() {
    cursor.classList.remove('clicking');
  });
})();

// ── Touch ripple (mobile) ──────────────────────────────────
(function() {
  var isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (!isTouchDevice) return;

  document.addEventListener('touchstart', function(e) {
    var touch = e.touches[0];
    var ripple = document.createElement('div');
    ripple.className = 'touch-ripple';
    ripple.style.left = touch.clientX + 'px';
    ripple.style.top  = touch.clientY + 'px';
    document.body.appendChild(ripple);
    setTimeout(function() { ripple.remove(); }, 600);
  }, { passive: true });
})();

// ── Block outer-page scroll on mobile ─────────────────────
// Prevent touchmove outside the screen bezel so the phone
// mockup never drifts when the user accidentally swipes the background.
document.addEventListener('touchmove', function(e) {
  if (!e.target.closest('.screen-bezel')) {
    e.preventDefault();
  }
}, { passive: false });

// ── Phone scaling (fit entire mockup in any viewport) ─────
(function() {
  var wrap = document.querySelector('.phone-wrap');
  if (!wrap) return;

  var PHONE_W   = 340;  // CSS px
  var PHONE_H   = 736;  // CSS px
  var BTN_EXTRA = 8;    // side-button protrusion (both sides combined)
  var PAD       = 20;   // minimum safe margin each side

  function fitPhone() {
    // visualViewport gives the true visible area on mobile
    // (excludes address bar / bottom nav chrome)
    var vp = window.visualViewport;
    var vw = vp ? vp.width  : window.innerWidth;
    var vh = vp ? vp.height : window.innerHeight;

    var scale = Math.min(
      (vw - PAD * 2) / (PHONE_W + BTN_EXTRA),
      (vh - PAD * 2) / PHONE_H,
      1
    );

    if (scale < 0.995) {
      // Negative margins collapse layout space so the flex-center
      // of .page aligns the phone visually to the center of the screen
      var mH = Math.ceil(PHONE_H * (1 - scale) / 2);
      var mW = Math.ceil(PHONE_W * (1 - scale) / 2);
      wrap.style.transform = 'scale(' + scale.toFixed(4) + ')';
      wrap.style.margin    = (-mH) + 'px ' + (-mW) + 'px';
    } else {
      wrap.style.transform = '';
      wrap.style.margin    = '';
    }
  }

  fitPhone();
  window.addEventListener('resize', fitPhone);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fitPhone);
  }
})();
