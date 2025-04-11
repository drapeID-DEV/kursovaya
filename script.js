// SLIDEER

const prevBtn = document.querySelector(`.prev-slide-btn`);
const nextBtn = document.querySelector(`.next-slide-btn`);
const slideList = document.querySelectorAll(`.slide`);
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

const modalMessage = document.querySelector(`.modal-message`);

const modalContainer = document.querySelector(`.modal-container`);
modalContainer.addEventListener(`click`, (event) => {
  const target = event.target;
  if (target.className !== "modal-container") return;
  hideElement(modalContainer);
});

const signInBtn = document.querySelector(`.sign-in-btn`);
signInBtn.addEventListener(`click`, () => showElement(modalContainer));

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

function showElement(element) {
  element.classList.remove(`hidden`);
}

function hideElement(element) {
  element.classList.add(`hidden`);
}

function hideInfoMessage() {
  infoContainer.style.display = `none`;
}

function showInfoMessage(message) {
  infoMessage.textContent = message;
  infoContainer.style.display = `flex`;
}

function logout() {
  currentSessionUser = null;
  if (tasksContainer.children) {
    Array.from(tasksContainer.children).forEach((element) => element.remove());
  }
  showElement(signInBtn);
  hideElement(accountControls);
  showInfoMessage(`You have logged out!`);
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

function throwErrorMessage(currentField, message = "Поле обов’язкове") {
  const prevErrorMessage = currentField.nextElementSibling;
  if (
    prevErrorMessage &&
    prevErrorMessage.classList.contains("error-message")
  ) {
    prevErrorMessage.remove();
  }

  const errorDiv = document.createElement("div");
  errorDiv.classList.add("error-message");
  errorDiv.innerText = message;
  currentField.addEventListener(`focus`, removeErrorMessage);
  currentField.insertAdjacentElement("afterend", errorDiv);
}

function removeErrorMessage(event) {
  const input = event.target;
  const error = input.nextElementSibling;

  if (error && error.classList.contains("error-message")) {
    error.remove();
  }

  input.removeEventListener("focus", removeErrorMessage);
}

function validateForm(formData) {
  let formState = true;

  for (let key of formData.keys()) {
    const input = document.getElementById(key);
    const error = input.nextElementSibling;

    if (!input.value.trim()) {
      throwErrorMessage(input);
      formState = false;
    } else {
      if (error && error.classList.contains("error-message")) {
        error.remove();
      }
    }
  }

  return formState;
}

function submitRegistration(event) {
  event.preventDefault();
  let userData = {};

  const formData = new FormData(registrationForm);
  let formIsValid = validateForm(formData);

  if (formIsValid) {
    const username = formData.get(`username`);

    if (localStorage.getItem(username) !== null) {
      showInfoMessage(`Username already exists!`);
      return;
    }

    const password = formData.get(`password`);

    userData.id = +new Date();
    userData.username = username;
    userData.password = password;

    localStorage.setItem(userData.username, JSON.stringify(userData));
    registrationForm.reset();
    hideElement(modalContainer);

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

    if (loginUsername in localStorage) {
      const existingUser = JSON.parse(localStorage.getItem(loginUsername));

      if (existingUser.password === loginPassword) {
        currentSessionUser = loginUsername;
        loginForm.reset();
        hideElement(modalContainer);
        hideElement(signInBtn);
        showElement(accountControls);
        renderTasks(existingUser.tasks);

        showInfoMessage(`Successful login`);
      } else {
        showInfoMessage(`Incorrect username or password!`);
      }
    } else {
      showInfoMessage(`User not found!`);
    }
  }
}

// TASKS BLOCK

const taskInput = document.querySelector(`#task-text`);
const tasksContainer = document.querySelector(`.tasks-container`);

const createTaskBtn = document.querySelector(`.create-task-btn`);
createTaskBtn.addEventListener(`click`, handleNewTaskCreate);

const taskFilter = document.querySelector(`#task-filter`);
taskFilter.addEventListener("change", filterTasks);

const taskTemplate = document.querySelector(`.task-template`);

function modifyTask(event) {
  const target = event.target;
  if (target.tagName != "BUTTON") return;

  const currentTime = new Date();
  const formattedDate = currentTime.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const userData = JSON.parse(localStorage.getItem(currentSessionUser));
  const action = target.getAttribute(`data-name`);
  const currentTask = target.closest(`.task`);
  const taskId = +currentTask.getAttribute(`data-taskId`);

  switch (action) {
    case "complete":
      userData.tasks = userData.tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, state: "done", time: formattedDate };
        }
        return task;
      });
      break;
    case "delete":
      userData.tasks = userData.tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, state: "deleted", time: formattedDate };
        }
        return task;
      });
      break;
  }
  renderTasks(userData.tasks);
  localStorage.setItem(currentSessionUser, JSON.stringify(userData));
}

function filterTasks(event) {
  const selectedFilter = event.target.value;

  const userData = JSON.parse(localStorage.getItem(currentSessionUser));
  const userTasks = userData.tasks;

  switch (selectedFilter) {
    case "all":
      renderTasks(userTasks);
      break;
    default:
      const filteredTasks = userTasks.filter(
        (task) => task.state === selectedFilter
      );
      renderTasks(filteredTasks);
      break;
  }
}

function handleNewTaskCreate() {
  if (!currentSessionUser) {
    showInfoMessage(`You have to login to create a task!`);
    return;
  }

  let currentUserData = JSON.parse(localStorage.getItem(currentSessionUser));
  if (!currentUserData.tasks) {
    currentUserData.tasks = [];
  }

  if (!taskInput.value.trim()) {
    showInfoMessage(`Task text can't be empty!`);
    return;
  }

  const taskId = +new Date();
  const taskState = "in-progress";
  const taskText = taskInput.value;

  currentUserData.tasks.push({ id: taskId, state: taskState, text: taskText });
  localStorage.setItem(currentSessionUser, JSON.stringify(currentUserData));
  renderTasks(currentUserData.tasks);
  taskFilter.value = "all";
  taskInput.value = ``;
  showInfoMessage(`New task created!`);
}

function createTask(currentTask) {
  const taskId = currentTask.id;
  const taskState = currentTask.state;
  const taskText = currentTask.text;

  const taskClone = taskTemplate.content.cloneNode(true);
  const taskBody = taskClone.querySelector(`.task`);
  taskBody.setAttribute(`data-taskId`, taskId);

  const taskContent = taskClone.querySelector(`.existing-task-text`);
  taskContent.textContent = taskText;

  const taskControls = taskClone.querySelector(`.task-controls`);

  switch (taskState) {
    case "in-progress":
      taskBody.addEventListener(`click`, modifyTask);
      tasksContainer.insertBefore(taskClone, tasksContainer.firstChild);
      break;
    case "deleted":
      taskContent.style.textDecoration = `line-through`;
      taskControls.innerHTML = `<p>Deleted</p><br>
      ${currentTask.time}`;
      tasksContainer.appendChild(taskClone);
      break;
    case "done":
      taskControls.innerHTML = `<p>Done</p><br>
      ${currentTask.time}`;
      tasksContainer.appendChild(taskClone);
      break;
  }
}

function renderTasks(tasksToRender) {
  if (!tasksToRender) return;

  if (tasksContainer.children) {
    Array.from(tasksContainer.children).forEach((element) => element.remove());
  }

  tasksToRender.forEach((task) => {
    createTask(task);
  });
}

//CONTACT US

const validators = {
  fullname: {
    validate: (value) => /^[A-Za-zА-Яа-яІіЇїЄєҐґ\s]{5,}$/.test(value),
    message: 'Будь ласка, введіть коректне ПІБ (мінімум 5 символів).'
  },
  phone: {
    validate: (value) => /^(\+380\d{9}|0\d{9})$/.test(value),
    message: 'Будь ласка, введіть коректний номер телефону.'
  },
  email: {
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Будь ласка, введіть коректну адресу електронної пошти.'
  },
  theme: {
    validate: (value) => value.length >= 4,
    message: 'Будь ласка, введіть тему (мінімум 4 символи).'
  },
  description: {
    validate: (value) => value.length >= 10,
    message: 'Будь ласка, опишіть звернення детальніше (мінімум 10 символів).'
  }
};

const contactForm = document.querySelector(`.contact-form`);

const contactBtn = document.querySelector(`.contact-btn`);
contactBtn.addEventListener(`click`, sendMessageHandler);

function sendMessageHandler(event) {
  event.preventDefault();

  const formData = new FormData(contactForm);
  let isFormValid = true;

  for (const [key, value] of formData.entries()) {
    const currentInputField = document.getElementById(key);
    const validator = validators[key];

    if (!value.trim() || !validator.validate(value.trim())) {
      throwErrorMessage(currentInputField, validator.message);
      isFormValid = false;
    }
  }

  if (isFormValid) {
    contactForm.reset();
    showInfoMessage('Форма успішно відправлена!');
  }
}
