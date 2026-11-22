const dialog = document.getElementById('account-dialog');
const accountButton = document.getElementById('account-button');
const guestButton = document.getElementById('account-guest');
const googleButton = document.getElementById('google-sign-in');
const message = document.getElementById('account-message');
let account;

async function updateAccount(action,credential) {
  const response = await fetch('/api/account',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action,credential})
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.user;
}

function continueAsGuest() {
  sessionStorage.setItem('watt2do.guest','1');
  accountButton.textContent = 'Guest';
  dialog.close();
}

accountButton.addEventListener('click',() => dialog.showModal());
dialog.addEventListener('cancel',event => {
  event.preventDefault();
  dialog.close();
});
guestButton.addEventListener('click',async () => {
  if (account?.user) {
    try {
      await updateAccount('sign-out');
      account.user = null;
      googleButton.hidden = !window.google?.accounts?.id;
      guestButton.textContent = 'Continue as guest';
      window.google?.accounts.id.disableAutoSelect();
    } catch (error) {
      message.textContent = error.message;
      return;
    }
  }
  continueAsGuest();
});

function loadGoogle() {
  return new Promise((resolve,reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

async function initialize() {
  try {
    const response = await fetch('/api/account');
    if (!response.ok) throw new Error();
    account = await response.json();
    if (account.user) {
      accountButton.textContent = account.user.name;
      guestButton.textContent = 'Sign out and continue as guest';
    } else if (sessionStorage.getItem('watt2do.guest')) {
      accountButton.textContent = 'Guest';
    } else if (!dialog.open) {
      dialog.showModal();
    }

    if (!account.clientId) {
      message.textContent = 'Google sign-in is unavailable. You can continue as a guest.';
      return;
    }

    await loadGoogle();
    google.accounts.id.initialize({
      client_id:account.clientId,
      callback:async ({credential}) => {
        try {
          account.user = await updateAccount('google',credential);
          sessionStorage.removeItem('watt2do.guest');
          accountButton.textContent = account.user.name;
          guestButton.textContent = 'Sign out and continue as guest';
          googleButton.hidden = true;
          message.textContent = '';
          dialog.close();
        } catch (error) {
          message.textContent = error.message;
        }
      }
    });
    let lastWidth = 0;
    let lastTheme;
    const renderGoogleButton = () => {
      const width = Math.min(400,Math.floor(googleButton.clientWidth));
      const theme = document.documentElement.dataset.theme === 'dark' ? 'outline_dark' : 'outline';
      if (!width || width === lastWidth && theme === lastTheme) return;
      lastWidth = width;
      lastTheme = theme;
      googleButton.replaceChildren();
      google.accounts.id.renderButton(googleButton,{theme,size:'large',shape:'rectangular',width});
    };
    new ResizeObserver(renderGoogleButton).observe(googleButton);
    new MutationObserver(renderGoogleButton).observe(document.documentElement,{attributeFilter:['data-theme']});
    googleButton.hidden = Boolean(account.user);
    renderGoogleButton();
  } catch {
    message.textContent = 'Google sign-in is unavailable. You can continue as a guest.';
  }
}

initialize();
