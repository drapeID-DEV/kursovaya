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
  } else {
    index = 0;
  }
  update();
}

function goPrev() {
  if (index > 0) {
    index--;
  } else {
    index = slideList.length - 1;
  }
  update();
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

hidePasswordBtns.forEach((btn) =>
  btn.addEventListener(`click`, (event) => {
    event.preventDefault();

    const passBlock = event.target.closest(".password-block");
    const passInput = passBlock.querySelector("input");
    passInput.type = passInput.type === "password" ? "text" : "password";
  })
);

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

function removeErrorMessage(event) {
  const input = event.target;
  const error = input.nextElementSibling;

  if (error && error.classList.contains("error-message")) {
    error.remove();
  }

  input.removeEventListener("focus", removeErrorMessage);
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function submitRegistration(event) {
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

    const passwordInput = document.getElementById("password");
    const password = passwordInput.value.trim();
    const repeatPasswordInput = document.getElementById("repeat-password");
    const repeatPassword = repeatPasswordInput.value.trim();

    if (
      !/^(?=.*[A-Z])[A-Za-z\d@#$%()_+\-=\[\]{}|;:'",.<>\/?]{8,16}$/.test(
        password
      )
    ) {
      throwErrorMessage(
        passwordInput,
        "Має містити мінімум 1 велику\nлітеру та 8-16 символів"
      );
      return;
    }

    if (password !== repeatPassword) {
      throwErrorMessage(repeatPasswordInput, "Паролі не співпадають");
      return;
    }

    userData.id = +new Date();
    userData.username = username;
    userData.password = await hashPassword(password);

    localStorage.setItem(userData.username, JSON.stringify(userData));
    registrationForm.reset();
    hideElement(modalContainer);

    showInfoMessage(`Ви успішно зареєструвались!`);
  }
}

async function submitLogin(event) {
  event.preventDefault();

  const formData = new FormData(loginForm);
  let formIsValid = validateForm(formData);

  if (formIsValid) {
    const loginUsername = formData.get(`login-username`);
    const loginPassword = await hashPassword(formData.get(`login-password`));

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
const weatherBlock = document.querySelector(`.weather-block`);

const actionsList = document.querySelector(`.actions_list`);
actionsList.addEventListener(`click`, switchTabs);

const tabsContainer = document.querySelector(`.info-tabs-container`);

function switchTabs(event) {
  const target = event.target;

  if (target.tagName != `BUTTON`) return;

  Array.from(tabsContainer.children).forEach((block) => hideElement(block));
  const targetTab = target.getAttribute(`data-name`);

  switch (targetTab) {
    case "tasks":
      showElement(tasksBlock);
      break;
    case "exchange":
      showElement(exchangeBlock);
      break;
    case "weather":
      showElement(weatherBlock);
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
const currencySelect = document.getElementById("currency-select");

const today = new Date();
const formattedDate = today.toLocaleDateString("uk-UA").replaceAll("/", ".");
const privatUrl = `http://localhost:7777/proxy?url=https://api.privatbank.ua/p24api/exchange_rates?date=${formattedDate}`;

async function getRate() {
  try {
    const response = await fetch(privatUrl);
    const data = await response.json();
    const rates = data.exchangeRate;

    rates.forEach((rate) => {
      if (rate.saleRate && rate.purchaseRate) {
        const currencyOption = document.createElement("option");
        currencyOption.value = rate.currency;
        currencyOption.textContent = rate.currency;
        currencySelect.appendChild(currencyOption);
      }
    });

    currencySelect.addEventListener("change", () => {
      const prevRate = document.querySelector(`.currency-row`);
      if (prevRate) prevRate.remove();

      const rate = rates.find(
        (currentRate) => currentRate.currency === currencySelect.value
      );

      if (rate) {
        const exchangeClone = exchangeTemplate.content.cloneNode(true);
        const currencyRow = exchangeClone.querySelector(`.currency-row`);

        const buyRate = currencyRow.querySelector(`.buy-rate`);
        buyRate.textContent = `${parseFloat(rate.purchaseRate).toFixed(2)}₴`;

        const sellRate = currencyRow.querySelector(`.sell-rate`);
        sellRate.textContent = `${parseFloat(rate.saleRate).toFixed(2)}₴`;

        const currencyName = currencyRow.querySelector(`.currency-name`);
        currencyName.textContent = rate.currency;

        exchangeTable.appendChild(exchangeClone);
      }
    });

    currencySelect.value = "USD";
    currencySelect.dispatchEvent(new Event("change"));
  } catch (err) {
    console.log("Помилка завантаження курсів валют!", err);
  }
}

getRate();

// WEATHER TAB

const weatherApiKey = "63991adcc0b6438c1d46d015771abc79";
const lat = 46.4825;
const lon = 30.7233;

async function getWeather() {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&units=metric&lang=ua&appid=${weatherApiKey}`
    );
    const data = await res.json();
    console.log(data)
    const iconData = data.current.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconData}@2x.png`;
    const descriptionData = data.current.weather[0].description;
    const tempData = data.current.temp;
    const humidityData = data.current.humidity;
    const windData = data.current.wind_speed;

    const iconBlock = weatherBlock.querySelector(`.weather-icon`);
    iconBlock.src = iconUrl;

    const descriptionBlock = weatherBlock.querySelector(`.weather-description`);
    descriptionBlock.textContent = descriptionData;

    const temperatureBlock = weatherBlock.querySelector(`.temperature`);
    temperatureBlock.textContent = `${tempData.toFixed(1)}°С`;

    const humidityBlock = weatherBlock.querySelector(`.humidity`);
    humidityBlock.textContent = `Вологість: ${humidityData}%`;

    const speedBlock = weatherBlock.querySelector(`.wind-speed`);
    speedBlock.textContent = `Швидкість вітру: ${windData}м/с`
  } catch (err) {
    console.log("Помилка завантаження погоди!", err);
  }
}

getWeather();

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

const BOT_TOKEN = "8026405556:AAFUvr0C6Gj_emy24bAgp7ujmIxY-1z7B4o";
const CHAT_ID = "431893485";

async function sendMessageToTelegram(message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "HTML"
    })
  });
}

async function sendMessageHandler(event) {
  event.preventDefault();

  const formData = new FormData(contactForm);
  let isFormValid = true;
  let message = "<b>Нове повідомлення з форми:</b>\n";

  for (const [key, value] of formData.entries()) {
    const currentInputField = document.getElementById(key);
    const validator = validators[key];

    if (!value.trim() || !validator.validate(value.trim())) {
      throwErrorMessage(currentInputField, validator.message);
      isFormValid = false;
    } else {
      message += `<b>${key}:</b> ${value.trim()}\n`;
    }
  }

  if (isFormValid) {
    try {
      await sendMessageToTelegram(message);
      contactForm.reset();
      showInfoMessage("Форма успішно відправлена!");
    } catch (error) {
      console.error("Помилка надсилання до Telegram:", error);
      showInfoMessage("Сталася помилка при надсиланні повідомлення.");
    }
  }
}

// PRODUCT SYSTEM

const userCart = [];

const catalog = [
  {
    name: "Crypto Start",
    description:
      "Базовий курс для тих, хто тільки починає вивчати криптовалюту. Ви дізнаєтесь про блокчейн, біткоїн, ефіріум, криптогаманці та безпечні методи купівлі активів. Ідеально підходить для новачків без технічного досвіду.",
    price: 1500,
    image: "./images/publication1.webp",
  },
  {
    name: "Crypto Pro",
    description:
      "Поглиблений курс для тих, хто вже знайомий з основами. Містить аналіз ринку, DeFi, стейкінг, ICO та побудову інвестиційного портфеля. Допоможе приймати обґрунтовані рішення на практиці.",
    price: 3200,
    image: "./images/publication2.webp",
  },
  {
    name: "Crypto Mindset",
    description:
      "Курс про те, як контролювати емоції при роботі з криптовалютою. Ви дізнаєтесь, як уникати паніки, FOMO і помилок на тлі стресу. Підійде всім, хто хоче інвестувати з холодною головою.",
    price: 950,
    image: "./images/publication3.webp",
  },
  {
    name: "Webinar Pack",
    description:
      "Щомісячний доступ до вебінарів з аналізом ринку, нових монет та інсайдів. Вебінари проводять практики та запрошені експерти. Актуальна інформація завжди під рукою.",
    price: 500,
    image: "./images/publication1.webp",
  },
  {
    name: "Individual",
    description:
      "Один-на-один з аналітиком ви сформуєте власну інвестиційну стратегію. Враховуються ваші цілі, бюджет і рівень ризику. Після консультації ви отримаєте готовий покроковий план.",
    price: 2800,
    image: "./images/publication2.webp",
  },
  {
    name: "Crypto Mastery",
    description:
      "Комплексний курс, що охоплює усі ключові теми — від технологій до оподаткування. Тривалість — 6 тижнів, є тести та сертифікат. Після завершення ви зможете впевнено працювати на ринку.",
    price: 6500,
    image: "./images/publication3.webp",
  },
];

const prodTemplate = document.querySelector(`.product-template`);
const productsContainer = document.querySelector(`.product-cards-container`);

catalog.forEach((product, index) => {
  const productClone = prodTemplate.content.cloneNode(true);
  const productCard = productClone.querySelector(`.product-card`);
  productCard.setAttribute(`data-id`, index);

  const productImage = productCard.querySelector(`.prod-image-container`);
  productImage.style.backgroundImage = `url("${product.image}")`;

  const productName = productCard.querySelector(`.prod-name`);
  productName.textContent = product.name;

  const productPrice = productCard.querySelector(`.prod-price`);
  productPrice.textContent = `₴${product.price}`;

  const productDescription = productCard.querySelector(`.prod-description`);
  productDescription.textContent = product.description;

  const addToCartBtn = productCard.querySelector(`.add-to-cart`);
  addToCartBtn.addEventListener(`click`, addToCartHandler);

  productsContainer.appendChild(productCard);
});

// CART

const cartContainer = document.querySelector(`.cart-container`);
cartContainer.addEventListener(`click`, (event) => {
  const target = event.target;
  if (target.className !== "cart-container") return;
  hideElement(cartContainer);
});

const openCartBtn = document.querySelector(`.open-cart-btn`);
openCartBtn.addEventListener(`click`, () => {
  if (userCart.length == 0) {
    showInfoMessage(`Ви нічого не додали до свого кошику!`);
    return;
  }
  showElement(cartContainer);
});

const cartContent = document.querySelector(`.cart-content`);
const cartTotal = cartContent.querySelector(`.cart-total`);
const cartProducts = cartContent.querySelector(`.cart-products-container`);
const cartProdTemplate = document.querySelector(`.cart-product-template`);

function calculateCartTotal() {
  const totalPrice = userCart.reduce((total, productId) => {
    const product = catalog[productId];
    return total + product.price;
  }, 0);
  cartTotal.textContent = `Усього до сплати: ₴${totalPrice}`;
  return totalPrice;
}

function addToCartHandler(event) {
  const target = event.target;
  const currentProduct = target.closest(`.product-card`);
  const productId = currentProduct.getAttribute(`data-id`);

  if (userCart.includes(productId)) {
    showInfoMessage(`Цей продукт вже в кошику!`);
    return;
  }

  userCart.push(productId);
  renderProductInCart(productId);
  calculateCartTotal();
  showInfoMessage(`Продукт додано!`);
}

function renderProductInCart(productId) {
  const productData = catalog[productId];

  const cartProdClone = cartProdTemplate.content.cloneNode(true);
  const cartProduct = cartProdClone.querySelector(`.cart-product`);
  cartProduct.setAttribute(`data-id`, productId);

  const prodName = cartProduct.querySelector(`.cart-product-name`);
  prodName.textContent = productData.name;

  const prodPrice = cartProduct.querySelector(`.cart-product-price`);
  prodPrice.textContent = `₴${productData.price}`;

  const removeProdBtn = cartProduct.querySelector(`.remove-product`);
  removeProdBtn.addEventListener(`click`, removeFromCart);

  cartProducts.appendChild(cartProduct);
}

function removeFromCart(event) {
  const target = event.target;
  const currentProduct = target.closest(`.cart-product`);
  const productId = currentProduct.getAttribute(`data-id`);

  const idToRemove = userCart.indexOf(productId);
  if (idToRemove !== -1) {
    userCart.splice(idToRemove, 1);
  }
  if (userCart.length == 0) {
    hideElement(cartContainer);
    showInfoMessage(`Ви видалили все з кошику!`);
  }
  calculateCartTotal();
  currentProduct.remove();
}
