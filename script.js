// SLIDEER

const prevBtn = document.querySelector(`.prev-slide-btn`);
const nextBtn = document.querySelector(`.next-slide-btn`);
const slideList = document.querySelectorAll(`.slide`);
console.log(slideList)
let index = 0;

prevBtn.addEventListener("click", goPrev);
nextBtn.addEventListener("click", goNext);

function update() {
  slideList.forEach((element, i) => {
    element.classList.toggle("active-slide", i == index);
  });
}

function goNext() {
  if (index < slideList.length - 1) {
    index++;
    update();
  } else {
    index = 0;
    update();
  }
}

function goPrev() {
  if (index > 0) {
    index--;
    update();
  } else {
    index = slideList.length - 1;
    update();
  }
}

update();

///////////////////////

// ACCOUNT SYSTEM

let currentSessionUser = null;

const modalContainer = document.querySelector(`.modal-container`);
const signInBtn = document.querySelector(`.sign-in-btn`);
signInBtn.addEventListener(`click`, showModal);

const registrationForm = document.querySelector(`.registration-form`);
const loginForm = document.querySelector(`.login-form`);

const openLoginBtn = document.querySelector(`.open-login-btn`);
openLoginBtn.addEventListener(`click`, switchToLogin);

const openRegistrationBtn = document.querySelector(`.open-registration-btn`);
openRegistrationBtn.addEventListener(`click`, switchToRegister);

const infoContainer = document.querySelector(`.info-container`);
const infoMessage = document.querySelector(`.info-text`);
const infoBtn = document.querySelector(`.info-btn`);
infoBtn.addEventListener(`click`, hideInfoMessage);

const submitRegistrationBtn = document.querySelector(`.submit-registration`);
submitRegistrationBtn.addEventListener(`click`, submitRegistration);

const submitLoginBtn = document.querySelector(`.submit-login`);
submitLoginBtn.addEventListener(`click`, submitLogin);

const accountControls = document.querySelector(`.account-controls`);

const logoutBtn = document.querySelector(`.logout-btn`);
logoutBtn.addEventListener(`click`, logout);

function showModal() {
    modalContainer.style.display = `flex`;
}

function hideModal() {
    modalContainer.style.display = `none`;
}

function showAccountControls() {
    accountControls.style.display = `flex`;
    signInBtn.style.display = `none`;
}

function hideAccountControls() {
    accountControls.style.display = `none`;
    signInBtn.style.display = `block`;
}

function hideInfoMessage() {
    infoContainer.style.display = `none`;
}

function logout() {
    currentSessionUser = null;
    hideAccountControls();
    showInfoMessage(`You have logged out!`);
}

function showInfoMessage(message) {
    infoMessage.textContent = message;
    infoContainer.style.display = `flex`;
}

function switchToLogin(event) {
    event.preventDefault();

    registrationForm.style.display = `none`;
    loginForm.style.display = `flex`;
}

function switchToRegister(event) {
    event.preventDefault();

    loginForm.style.display = `none`;
    registrationForm.style.display = `flex`;
}

function removeErrorMessage() {
    const prevErrorMessage = document.querySelector(
      `#${this.id} + .error-message`
    );
    if (prevErrorMessage) {
      prevErrorMessage.remove();
    }
}
  
function throwErrorMessage(key, currentInputField) {
    const errorMessage = document.createElement(`p`);
    errorMessage.className = `error-message`;
    errorMessage.textContent = `Please input ${key}*`;
    currentInputField.insertAdjacentElement("afterend", errorMessage);
    currentInputField.addEventListener(`focus`, removeErrorMessage);
}

function validateForm(formData) {
    let formState = true;

    for (let key of formData.keys()) {
        const currentInputField = document.querySelector(`#${key}`);
        const prevErrorMessage = document.querySelector(`#${key} + .error-message`);
    
        if (!currentInputField.value.trim()) {
          if (!prevErrorMessage) {
            throwErrorMessage(key, currentInputField);
            formState = false;
            continue;
          } else {
            formState = false;
            continue;
          }
        }
    }
    return formState;
}

function submitRegistration(event) {
    event.preventDefault();
    let userData = {};
    let taskList = [`Task 1`, `Task 2`, `Task 3`];

    const formData = new FormData(registrationForm);
    let formIsValid = validateForm(formData);

    if (formIsValid) {
        const username = formData.get(`username`);

        if (localStorage.getItem(username) !== null) {
            infoMessage = `Username already exists!`;
            showInfoMessage(infoMessage);
            return;
        }

        const password = formData.get(`password`);

        userData.id = +new Date();
        userData.username = username;
        userData.password = password;
        userData.tasks = taskList;

        localStorage.setItem(userData.username, JSON.stringify(userData));
        registrationForm.reset();
        hideModal();

        showInfoMessage(`Successful registration!`);
    }
}

function submitLogin(event) {
    event.preventDefault();

    const formData = new FormData(loginForm);
    let formIsValid = validateForm(formData);

    if (formIsValid) {   
        const loginUsername = formData.get(`login-username`);
        const loginPassword = formData.get(`login-password`);
        
        if(loginUsername in localStorage) {
            const existingUser = JSON.parse(localStorage.getItem(loginUsername));

            if(existingUser.password === loginPassword) {
                currentSessionUser = loginUsername;
                loginForm.reset();
                hideModal();
                showAccountControls();

                showInfoMessage(`Successful login`);
            }
            else {
                showInfoMessage(`Incorrect username or password!`);
            }
        }
        else {
            showInfoMessage(`User not found!`);
        }
    }
} 