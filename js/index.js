(function() {
  var form = document.forms.registerForm;
  var API_URL = 'https://test-task-182e1.firebaseio.com/users/';

  function request(url, options) {
    options = options || {}

    var xhr = new XMLHttpRequest();

    xhr.onerror = xhr.ontimeout = options.onError;
    xhr.onload = function() {
      options.onLoad(JSON.parse(xhr.responseText));
    };
    xhr.open(options.method || 'GET', url);
    xhr.send(options.data);

    return xhr;
  }

  function serializeForm(form) {
    return Array.prototype.slice.call(form.elements, 0).reduce(function(object, input) {
      if (input.name) {
        object[input.name] = input.value;
      }

      return object;
    }, {});
  }

  function tryToRegisterUser(event) {
    event.preventDefault();

    var canSend = validateAndShowErrors(form);

    if (canSend) {
      request(API_URL + sanitizeEmail(form.mail.value) + '.json', {
        method: 'PUT',
        data: JSON.stringify(serializeForm(form)),

        onError: function() {
          alert('Server is not responsive. Please try again later');
        },

        onLoad: function(response) {
          if (response.error) {
            alert('Something is wrong!');
          } else {
            alert('Congratulation! You have been successfully registered :)');
            form.reset();
          }
        }
      })
    }
  }

  function validateAndShowErrors(form) {
    var inputs = Array.prototype.slice.call(form.elements, 0);
    var isValid = true;

    inputs.forEach(function(input) {
      if (input.tagName === 'BUTTON') {
        return;
      }

      if (!input.checkValidity()) {
        if (!input.validity || !input.validity.customError) {
          showErrorMessageFor(input, input.getAttribute('data-error'));
        }
        isValid = false;
      } else if (input.classList.contains('waiting')) {
        isValid = false;
      } else {
        hideErrorOf(input);
      }
    })

    return isValid;
  }

  function showErrorMessageFor(input, errorMessage) {
    var block = input.parentNode;
    var errorNode = block.querySelector('.has-error');

    if (!errorNode) {
      var errorNode = document.createElement('div');
      errorNode.classList.add('has-error');
      block.appendChild(errorNode);
    }

    errorNode.innerHTML = errorMessage;
  }

  function hideErrorOf(input) {
    var errorNode = input.parentNode.querySelector('.has-error');

    if (errorNode) {
      errorNode.parentNode.removeChild(errorNode);
    }
  }

  var emailRequest;
  function validateEmailUniqueness(input) {
    if (emailRequest) {
      emailRequest.abort();
      emailRequest = null;
    }

    if (input.validationMessage === 'non-unique-email') {
      input.setCustomValidity('');
    }

    if (!input.checkValidity()) {
      return;
    }

    input.classList.add('waiting');
    emailRequest = request(API_URL + sanitizeEmail(input.value) + '.json', {
      onError: function() {
        alert('Server is not responsive. Please try again later')
        input.classList.remove('waiting');
        emailRequest = null;
      },

      onLoad: function(user) {
        if (user) {
          input.setCustomValidity('non-unique-email');
          showErrorMessageFor(input, input.getAttribute('data-error-unique'));
        } else {
          hideErrorOf(input);
        }

        input.classList.remove('waiting');
        emailRequest = null;
      }
    });
  }


  form.mail.addEventListener('change', function() {
    validateEmailUniqueness(this);
  });

  form.addEventListener('submit', tryToRegisterUser, false);
})();

