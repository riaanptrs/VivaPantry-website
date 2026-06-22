(function () {
  var form = document.getElementById('reset-password-form');
  var status = document.getElementById('reset-password-status');
  if (!form || !status) return;

  function setStatus(message) {
    status.textContent = message;
  }

  function getClient() {
    var config = window.VivaPantrySupabaseConfig || {};
    if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase) {
      throw new Error(form.getAttribute('data-config-error') || 'Password reset is not configured yet.');
    }
    return window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var email = String(new FormData(form).get('email') || '').trim();
    if (!email) return;

    try {
      setStatus(form.getAttribute('data-sending-message') || 'Sending reset email...');
      getClient().auth.resetPasswordForEmail(email, {
        redirectTo: 'https://vivapantry.com/update-password/'
      }).then(function (result) {
        if (result.error) throw result.error;
        form.reset();
        setStatus(form.getAttribute('data-success-message') || 'If an account exists for that email, a password reset link has been sent.');
      }).catch(function (error) {
        setStatus(error && error.message ? error.message : form.getAttribute('data-failure-message') || 'Password reset could not be started.');
      });
    } catch (error) {
      setStatus(error && error.message ? error.message : form.getAttribute('data-failure-message') || 'Password reset could not be started.');
    }
  });
})();
