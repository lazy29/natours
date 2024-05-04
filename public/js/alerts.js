// type is 'success' or 'error'

export const hideToaster = function () {
  const toasterEl = document.querySelector('.alert');

  if (toasterEl) toasterEl.parentElement.removeChild(toasterEl);
};

export const showToaster = function (type, message) {
  hideToaster();

  const markup = `<div class="alert alert--${type}">${message}</div>`;

  document.body.insertAdjacentHTML('afterbegin', markup);

  window.setTimeout(hideToaster, 5000);
};
