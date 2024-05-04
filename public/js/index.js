import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

// DOM ELEMENTS
const loginFormEl = document.querySelector('.form--login');
const logOutBtnEl = document.querySelector('.nav__el--logout');
const userDataUpdateFormEl = document.querySelector('.form-user-data');
const userPasswordUpdateFormEl = document.querySelector('.form-user-password');
const bookTourBtnEl = document.getElementById('book-tour');

// DELEGATIONS
if (loginFormEl)
  loginFormEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginFormEl.querySelector('#email').value;
    const password = loginFormEl.querySelector('#password').value;

    login(email, password);
  });

if (logOutBtnEl) logOutBtnEl.addEventListener('click', logout);

if (userDataUpdateFormEl)
  userDataUpdateFormEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameFormEl = userDataUpdateFormEl.querySelector('#name');
    const emailFormEl = userDataUpdateFormEl.querySelector('#email');
    const photoFormEl = userDataUpdateFormEl.querySelector('#photo');

    const form = new FormData();

    form.append('name', nameFormEl.value);
    form.append('email', emailFormEl.value);
    form.append('photo', photoFormEl.files[0]);

    updateSettings('userDetails', form);
  });

if (userPasswordUpdateFormEl)
  userPasswordUpdateFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword =
      userPasswordUpdateFormEl.querySelector('#password-current').value;
    const newPassword =
      userPasswordUpdateFormEl.querySelector('#password').value;
    const confirmNewPassword =
      userPasswordUpdateFormEl.querySelector('#password-confirm').value;

    const savePasswordBtnEl = userPasswordUpdateFormEl.querySelector(
      '.btn--save-password',
    );

    savePasswordBtnEl.textContent = 'saving password...';

    await updateSettings('userPassword', {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });

    userPasswordUpdateFormEl.querySelector('#password-current').value = '';
    userPasswordUpdateFormEl.querySelector('#password').value = '';
    userPasswordUpdateFormEl.querySelector('#password-confirm').value = '';

    savePasswordBtnEl.textContent = 'save password';
    savePasswordBtnEl.blur();
  });

if (bookTourBtnEl)
  bookTourBtnEl.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';

    const { tourId } = e.target.dataset;

    bookTour(tourId);
  });
