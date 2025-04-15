// SLIDEER

const prevBtn = document.querySelector(`.prev-slide-btn`);
const nextBtn = document.querySelector(`.next-slide-btn`);
const sliderContainer = document.querySelector(`.team`);
const slideList = document.querySelectorAll(`.slide`);
const slideImages = document.querySelectorAll(`.face_image`);

slideImages.forEach((element, index) => {
  element.style.backgroundImage = `url("./images/Team-${index + 1}.png")`;
});

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

let autoPlay;

function startAutoplay() {
  autoPlay = setInterval(function () {
    nextBtn.click();
  }, 6000);
}

startAutoplay();

function stopAutoplay() {
  clearInterval(autoPlay);
}

sliderContainer.addEventListener(`mouseout`, startAutoplay);
sliderContainer.addEventListener(`mouseover`, stopAutoplay);

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

const hidePasswordBtns = document.querySelectorAll(`.hide-password`);

hidePasswordBtns.forEach(btn => btn.addEventListener(`click`, (event) => {
  event.preventDefault();

  const passBlock = event.target.closest('.password-block');
  const passInput = passBlock.querySelector('input');
  passInput.type = passInput.type === "password" ? "text" : "password";
}));

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
  showInfoMessage(`Ви вийшли за акаунту!`);
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

    if (!input.value.trim()) {
      throwErrorMessage(input);
      formState = false;
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
      showInfoMessage(`Таке ім'я вже зайнято!`);
      return;
    }

    const password = formData.get(`password`);
    const repeatPassword = formData.get(`repeat-password`);

    if (password !== repeatPassword) {
      showInfoMessage(`Паролі не співпадають!`);
      return;
    }

    userData.id = +new Date();
    userData.username = username;
    userData.password = password;

    localStorage.setItem(userData.username, JSON.stringify(userData));
    registrationForm.reset();
    hideElement(modalContainer);

    showInfoMessage(`Ви успішно зареєструвались!`);
  }
}

function submitLogin(event) {
  event.preventDefault();

  const formData = new FormData(loginForm);
  let formIsValid = validateForm(formData);

  if (formIsValid) {
    const loginUsername = formData.get(`login-username`);
    const loginPassword = formData.get(`login-password`);
    console.log(loginPassword)

    if (loginUsername in localStorage) {
      const existingUser = JSON.parse(localStorage.getItem(loginUsername));

      if (existingUser.password === loginPassword) {
        currentSessionUser = loginUsername;
        loginForm.reset();
        hideElement(modalContainer);
        hideElement(signInBtn);
        showElement(accountControls);
        renderTasks(existingUser.tasks);

        showInfoMessage(`Ви увійшли в акаунт!`);
      } else {
        showInfoMessage(`Невірний логін або пароль!`);
      }
    } else {
      showInfoMessage(`Користувача не знайдено!`);
    }
  }
}

//SWITCH INFO TABS

const tasksBlock = document.querySelector(`.tasks-block`);
const exchangeBlock = document.querySelector(`.exchange-block`);

const actionsList = document.querySelector(`.actions_list`);
actionsList.addEventListener(`click`, switchTabs)

const tabsContainer = document.querySelector(`.info-tabs-container`);

function switchTabs(event) {
  const target = event.target;

  if(target.tagName != `BUTTON`) return;

  Array.from(tabsContainer.children).forEach(block => hideElement(block));
  const targetTab = target.getAttribute(`data-name`);

  switch(targetTab) {
    case "tasks":
      showElement(tasksBlock);
      break;
    case "exchange":
      showElement(exchangeBlock);
      break;
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
    showInfoMessage(`Спочатку увійдіть, щоб створити завдання!`);
    return;
  }

  let currentUserData = JSON.parse(localStorage.getItem(currentSessionUser));
  if (!currentUserData.tasks) {
    currentUserData.tasks = [];
  }

  if (!taskInput.value.trim()) {
    showInfoMessage(`Текст завдання не може бути порожнім!`);
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
  showInfoMessage(`Нове завдання створено!`);
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
      taskControls.innerHTML = `<p>Видалено</p><br>
      ${currentTask.time}`;
      tasksContainer.appendChild(taskClone);
      break;
    case "done":
      taskControls.innerHTML = `<p>Виконано</p><br>
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

// PRIVAT

const exchangeTable = document.querySelector(`.exchange-table`);
const exchangeTemplate = document.querySelector(`.exchange-row`);
const privatUrl = 'http://localhost:7777/proxy?url=https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5';

    async function getRates() {
      try {
        const response = await fetch(privatUrl);
        const data = await response.json();

        data.forEach(rate => {
          const exchangeClone = exchangeTemplate.content.cloneNode(true);
          const currencyRow = exchangeClone.querySelector(`.currency-row`);

          const buyRate = currencyRow.querySelector(`.buy-rate`);
          buyRate.textContent = `${parseFloat(rate.buy).toFixed(2)}₴`;

          const sellRate = currencyRow.querySelector(`.sell-rate`);
          sellRate.textContent = `${parseFloat(rate.sale).toFixed(2)}₴`;

          const currencyName = currencyRow.querySelector(`.currency-name`);
          currencyName.textContent = rate.ccy;

          exchangeTable.appendChild(exchangeClone);
        });

      } catch (err) {
        console.error('Помилка завантаження курсу валюти:', err);
      }
    }

    getRates();


//CONTACT US

const validators = {
  fullname: {
    validate: (value) => /^[A-Za-zА-Яа-яІіЇїЄєҐґ\s]{5,}$/.test(value),
    message: "Будь ласка, введіть коректне ПІБ (мінімум 5 символів).",
  },
  phone: {
    validate: (value) => /^(\+380\d{9}|0\d{9})$/.test(value),
    message: "Будь ласка, введіть коректний номер телефону.",
  },
  email: {
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: "Будь ласка, введіть коректну адресу електронної пошти.",
  },
  theme: {
    validate: (value) => value.length >= 4,
    message: "Будь ласка, введіть тему (мінімум 4 символи).",
  },
  description: {
    validate: (value) => value.length >= 10,
    message: "Будь ласка, опишіть звернення детальніше (мінімум 10 символів).",
  },
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
    showInfoMessage("Форма успішно відправлена!");
  }
}