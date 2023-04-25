const divComponent = ({ className, innerContent, idName }) => `
<div class="${className}" id="${
  idName === undefined ? "" : idName
}">${innerContent}</div>`;

const addEventListenerForInputs = async (event) => {
  const formInputs = document.querySelectorAll("input");
  formInputs.forEach((element) =>
    element.addEventListener("click", async function (event) {
      await handleInputFocus(event);
    })
  );
  formInputs.forEach((element) =>
    element.addEventListener("blur", async function (event) {
      await handleInputBlur(event);
    })
  );
};

const handleInputBlur = function (event) {
  if (!event.target.value) {
    event.target.previousSibling.classList.remove("focusLabel");
  }
};

const handleInputFocus = function (event) {
  event.target.previousSibling.classList.add("focusLabel");
};

const createMainContainer = (currentOrders) => {
  const allPizza = createAllPizzasComponent(currentOrders);
  const form = createForm("form", createFormElements());
  const mainContainer = divComponent({
    className: "mainContainer",
    innerContent: `${allPizza} ${form}`,
    idName: "maincontainer",
  });
  return mainContainer;
};

const inputCreate = (id, className) =>
  `<label for="${id}">${
    id.split("I")[0]
  }</label><input id="${id}" class="${className}"></input> `;

const createSubmitButton = (id, className, innerText) =>
  ` <button id="${id}" class="${className}">${innerText}</button>`;

const createFormElements = () => {
  const dataList = ["nameInput", "emailInput", "cityInput", "streetInput"];
  const datalistHTML = dataList.map((element) => inputCreate(element, element));
  datalistHTML.push(createSubmitButton("submit", "submit", "Confirm Order"));
  return datalistHTML.join("");
};

const createForm = (id, content) => {
  return `<form id="${id}">${content}</form>`;
};

const createSinglePizzaComponent = (pizza) => {
  if (pizza.pcs > 0) {
    const pizzaNameAndSize = divComponent({
      className: "sinlgePizza",
      innerContent: `${pizza.name.toUpperCase()} ${pizza.size}`,
    });
    const pieces = divComponent({
      className: "pieces",
      innerContent: `<img id = "-" src = "/public/images/minus.png"><div class="pieceNumber">${pizza.pcs}</div><img id="+" src="/public/images/plus.png">`,
    });
    const containerDiv = divComponent({
      className: "singlePizzaContainer",
      innerContent: `${pizzaNameAndSize} ${pieces}`,
    });
    return containerDiv;
  }
};

const createAllPizzasComponent = (currentOrders) => {
  const allPizzas = Object.keys(currentOrders).map((element) =>
    currentOrders[element].sizes.map((pizza) => {
      return createSinglePizzaComponent({
        name: element,
        size: Object.keys(pizza)[0],
        pcs: Object.values(pizza)[0],
      });
    })
  );
  const allPizzasContainer = divComponent({
    className: "allPizzasContainer",
    innerContent: allPizzas.flat(2).join(""),
    idName: "allPizzasContainer",
  });
  return allPizzasContainer;
};

const getCurrentOrder = async () => {
  const url = new URL(`${window.location.origin}/api/current_order`);
  const response = await fetch(url);
  const data = await response.json();
  return await data;
};

const updateDisplay = (currentOrders) => {
  document.querySelector("#maincontainer").remove();
  const root = document.querySelector("#root");
  root.insertAdjacentHTML("afterend", createMainContainer(currentOrders));
  addEventListenerForInputs();
};

const updateCurrentOrdersJson = async (event, currentOrders) => {
  event.target.classList.add("listen");
  response = await fetch(`${document.location.origin}/pizza/order`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(currentOrders),
  });
};

const handlePcsUpdate = (event, currentOrders) => {
  const container =
    event.target.parentElement.parentElement.children[0].innerText.split(" ");
  const pizzaTypeToUpdate = Object.entries(currentOrders).find(
    (element) => element[0].toLowerCase() === container[0].toLowerCase()
  );
  currentOrders[pizzaTypeToUpdate[0]].sizes.map((element, index) => {
    if (element.hasOwnProperty(container[1])) {
      element[container[1]] =
        parseInt(element[container[1]]) + parseInt(`${event.target.id}1`);
      element[container[1]] < 1
        ? currentOrders[pizzaTypeToUpdate[0]].sizes.splice(index, 1)
        : "";
    }
  });
  updateDisplay(currentOrders);
};

const padTo2Digits = (num) => {
  return num.toString().padStart(2, "0");
};

const getAllOrders = async () => {
  const url = new URL(`${window.location.origin}/api/order`);
  const response = await fetch(url);
  const data = await response.json();
  return await data;
};

const createNewId = async () => {
  try {
    const newId = Object.keys(await getAllOrders())?.reduce(
      (prev, curr) =>
        parseInt(prev) > parseInt(curr)
          ? parseInt(prev) + 1
          : parseInt(curr) + 1,
      1
    );
    return newId;
  } catch (err) {
    const newId = 1;
    return newId;
  }
};

const createOrder = async (currentOrder) => {
  // Init costumer object.
  const costumer = {
    name: document.querySelector("#nameInput").value,
    email: document.querySelector("#emailInput").value,
    address: {
      city: document.querySelector("#cityInput").value,
      street: document.querySelector("#streetInput").value,
    },
  };
  //Init date of order.
  const newDate = new Date();
  const date = {
    year: newDate.getFullYear().toString(),
    month: padTo2Digits(newDate.getMonth() + 1),
    day: padTo2Digits(newDate.getDate()),
    hour: padTo2Digits(newDate.getHours()),
    minute: padTo2Digits(newDate.getMinutes()),
  };
  //Copy order details
  const newId = await createNewId();
  //Assemble confirmed order
  const confirmedOrder = {};
  confirmedOrder[newId] = {
    pizzas: { ...currentOrder },
    date: { ...date },
    costumer: { ...costumer },
  };

  return confirmedOrder;
};

const createOrderConfirmationCard = () => {
  const confirmationText = divComponent({
    className: "confrimationText",
    innerContent: "Thank you for your order!",
  });
  const closeConfirmationButton = createSubmitButton(
    "closeConfirmation",
    "closeConfirmation",
    "Ok"
  );
  const container = divComponent({
    className: "confirmationContainer",
    innerContent: `${confirmationText}${closeConfirmationButton}`,
    id: "confirmationContainer",
  });
  return container;
};

const handleClosingConfirmationButton = function () {
  return document
    .querySelector("#closeConfirmation")
    .addEventListener("click", function () {
      this.parentElement.remove();
    });
};

const stopRenderingConfirmedOrderContent = () =>
  document
    .querySelectorAll(".singlePizzaContainer")
    .forEach((element) => element.remove());

const resetCurrentOrder = async (event, currentOrder) => {
  const url = new URL(`${window.location.origin}/api/current_order`);
  response = await fetch(url, {
    method: "DELETE",
  });
  Object.keys(currentOrder).forEach((element) => {
    delete currentOrder[element];
  });
};

const handleSubmit = async (event, currentOrder, root) => {
  console.log(currentOrder);
  const confirmedOrder = await createOrder(currentOrder);
  const url = new URL(`${window.location.origin}/api/order`);
  response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(confirmedOrder),
  });
  stopRenderingConfirmedOrderContent();
  resetCurrentOrder(event, currentOrder);
  root.insertAdjacentHTML("afterbegin", createOrderConfirmationCard());
  //Eventlistener for closing order confirmation button
  handleClosingConfirmationButton();
};

const orderLoadEvent = async (_) => {
  const root = document.querySelector("#root");
  const currentOrders = await getCurrentOrder();

  root.insertAdjacentHTML("afterend", createMainContainer(await currentOrders));
  window.addEventListener("click", async (event) => {
    switch (event.target.id) {
      case "+":
      case "-":
        handlePcsUpdate(event, currentOrders);
        if (![...event.target.classList].includes("listen")) {
          window.addEventListener(
            "mousemove",
            async function (event) {
              if (![...event.target.classList].includes("listen")) {
                updateCurrentOrdersJson(event, await currentOrders);
              }
            },
            { once: true }
          );
        }
        event.target.classList.remove("listen");
        break;
      case "submit":
        event.preventDefault();
        if (Object.keys(currentOrders).length > 0) {
          handleSubmit(event, currentOrders, root);
        }
      default:
        break;
    }
  });
  addEventListenerForInputs();
};

window.addEventListener("load", orderLoadEvent);
