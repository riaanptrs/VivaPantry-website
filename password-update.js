(function () {
  var form = document.getElementById('update-password-form');
  var status = document.getElementById('update-password-status');
  if (!form || !status) return;

  var client;

  function setStatus(message) {
    status.textContent = message;
  }

  function setFormDisabled(disabled) {
    Array.prototype.forEach.call(form.elements, function (element) {
      element.disabled = disabled;
    });
  }

  function getParams() {
    var params = new URLSearchParams(window.location.search || '');
    var hash = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
    hash.forEach(function (value, key) {
      if (!params.has(key)) params.set(key, value);
    });
    return params;
  }

  function getClient() {
    var config = window.VivaPantrySupabaseConfig || {};
    if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase) {
      throw new Error(form.getAttribute('data-config-error') || 'Password update is not configured yet.');
    }
    if (!client) {
      client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });
    }
    return client;
  }

  function prepareSession() {
    var params = getParams();
    var error = params.get('error_description') || params.get('error');
    if (error) {
      return Promise.reject(new Error(error));
    }

    var auth = getClient().auth;
    var code = params.get('code');
    var tokenHash = params.get('token_hash');
    var accessToken = params.get('access_token');
    var refreshToken = params.get('refresh_token');

    if (code) return auth.exchangeCodeForSession(code);
    if (tokenHash) return auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
    if (accessToken && refreshToken) return auth.setSession({ access_token: accessToken, refresh_token: refreshToken });

    return Promise.reject(new Error(form.getAttribute('data-token-error') || 'Open the reset link from your email before setting a password.'));
  }

  try {
    prepareSession().then(function (result) {
      if (result.error) throw result.error;
      setFormDisabled(false);
      setStatus(form.getAttribute('data-session-ready-message') || 'Enter a new password to finish the reset.');
    }).catch(function (error) {
      setFormDisabled(true);
      setStatus(error && error.message ? error.message : 'The reset link could not be verified.');
    });
  } catch (error) {
    setFormDisabled(true);
    setStatus(error && error.message ? error.message : 'The reset link could not be verified.');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var password = String(new FormData(form).get('password') || '');
    if (!password) return;

    try {
      setStatus(form.getAttribute('data-updating-message') || 'Updating password...');
      getClient().auth.updateUser({ password: password }).then(function (result) {
        if (result.error) throw result.error;
        form.reset();
        setStatus(form.getAttribute('data-success-message') || 'Your password has been updated. You can return to VivaPantry account access.');
      }).catch(function (error) {
        setStatus(error && error.message ? error.message : form.getAttribute('data-failure-message') || 'Password could not be updated.');
      });
    } catch (error) {
      setStatus(error && error.message ? error.message : form.getAttribute('data-failure-message') || 'Password could not be updated.');
    }
  });
})();
