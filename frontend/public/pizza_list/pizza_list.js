const rootURL = window.location.origin;
let pizzaList = null;

let currentOrder = { };

let allPizzaData = null;
let allAllergensData = null;

let defaultFilterOptionBackgroundColor = "green";

async function onLoad() {
    const response = await fetch(`${rootURL}/api/allergens`);
    const data = await response.json();
    allAllergensData = data;
    initCurrentOrder();
    getAllPizzas();
}

async function initCurrentOrder() {
    const response = await fetch(`${rootURL}/pizza/current_order`);
    try {
        const data = await response.json();
        currentOrder = data;
    } catch (e) {
        console.error(e);
    }
    
}

function getAllPizzas() {
    fetch(`${rootURL}/api/pizza`)
        .then(response => response.json())
        .then(data => {
            allPizzaData = data;
            createPizzaListDiv();
            insertPizzasToList();
            insertBasketReferenceToList();
            insertFilterDiv();
            addEventListenersToForms();
        });
}

function createPizzaListDiv() {
    const pizzaListDiv = document.createElement("div");
    pizzaListDiv.id = "pizza-list";
    rootElement.insertAdjacentElement("beforeend", pizzaListDiv);
    pizzaList = document.getElementById("pizza-list");
}

function insertPizzasToList() {
    allPizzaData.forEach(pizza => {
        pizzaList.insertAdjacentHTML("beforeend", generatePizzaDiv(pizza));
    });
}

function generatePizzaDiv(pizza) {
    const pizzaAllergens = allAllergensData.filter(allergen => pizza.allergens.includes(allergen.id)).map(allergen => allergen.name);
    return `<div id="${pizza.name.toLowerCase()}-pizza" class="pizza list-member" data-pizza-id="${pizza.id}">
        <h2 class="pizza-name-price"><span>${pizza.name}</span> - <span class="pizza-price">${pizza.price}</span> Ft</h2>
        <h3 class="pizza-ingredients">Ingredients: ${pizza.ingredients.map(ingredient => ingredient.toLowerCase()).join(", ")}</h3>
        <h4 class="pizza-allergens">Allergens: ${pizzaAllergens.join(", ")}</h4>
        <div style="text-align: center;">
            <form class="add-to-basket-form">
                <span>32cm: </span>
                <input style="width: 2.5rem;" type="number" min="0" max="99">
                <button>Add to Basket</button>
            </form>
            <form class="add-to-basket-form">
                <span>45cm: </span>
                <input style="width: 2.5rem;" type="number" min="0" max="99">
                <button>Add to Basket</button>
            </form>
        </div>
    </div>`;
}

function insertBasketReferenceToList() {
    pizzaList.insertAdjacentHTML("beforeend", generateBasketReferenceDiv());
    const goToBasketBtn = document.getElementById("go-to-basket-button");
    goToBasketBtn.addEventListener("click", () => window.location = `${rootURL}/pizza/order`);
}

function generateBasketReferenceDiv() {
    return `<div class="list-member" id="go-to-basket">
            <button id="go-to-basket-button">
                <h2>Go to my basket</h2>

                <span class="material-symbols-outlined">
                shopping_basket
                </span>
            </button>
            <h5>You'll still be able to edit your order</h5>
            </div>`
}

function insertFilterDiv() {
    document.getElementById("container").insertAdjacentHTML("afterend", generateFilterDiv());

    const filterOptionSpans = Array.from(document.getElementsByClassName("filter-option"));
    filterOptionSpans.forEach(filterOption => filterOption.addEventListener("click", handleFilterOptionClick));
}

function handleFilterOptionClick(event) {
    if (event.target.style.backgroundColor !== "red") {
        event.target.style.backgroundColor = "red";
        removeFromPizzaList(event.target.innerText);
    } else {
        event.target.style.backgroundColor = defaultFilterOptionBackgroundColor;
        addToPizzaList(event.target.innerText);
    }
}

function removeFromPizzaList(allergen) {
    const allergenIndex = 2;
    const pizzaDivs = Array.from(document.getElementsByClassName("pizza"));
    const divsToRemove = pizzaDivs.filter(pizzaDiv => pizzaDiv.children[allergenIndex].innerText.includes(allergen));
    divsToRemove.forEach(div => div.remove());
}

function addToPizzaList() {
    const goToBasketDiv = document.getElementById("go-to-basket");
    const pizzaDivs = Array.from(document.getElementsByClassName("pizza"));
    pizzaDivs.forEach(div => div.remove());

    allPizzaData.forEach(pizza => {
        goToBasketDiv.insertAdjacentHTML("beforebegin", generatePizzaDiv(pizza));
    });

    const redAllergens = Array.from(document.getElementsByClassName("filter-option")).filter(option => option.style.backgroundColor === "red").map(div => div.innerText);
    redAllergens.forEach(allergen => removeFromPizzaList(allergen));
}

function generateFilterDiv() {
    const allergensSpans = allAllergensData.map(allergen => {
        allergen = allergen.name;
        return `<span class="filter-option" id="filter-option-${allergen}" style="background-color: ${defaultFilterOptionBackgroundColor};">${allergen}</span>`;
    });

    return `<div id="filter-by-allergens">
        <h5>Please click on the allergens that you want to be filtered out from the menu: </h5>
        ${allergensSpans.join("\n")}
    </div>`;
}

function addEventListenersToForms() {
    const orderForms = Array.from(document.getElementsByClassName("add-to-basket-form"));
    orderForms.forEach(form => form.addEventListener("submit", (event) => {
        try {
            handleSubmitForm(event);
        } catch(error) {
            console.error(error);
        }
}));
}

function handleSubmitForm(event) {
    event.preventDefault();
    const pizzaType = event.target.parentElement.parentElement.children[0].children[0].innerText;
    const pizzaId = event.target.parentElement.parentElement.dataset.pizzaId;
    const size = event.target.children[0].innerText.replace(/:/g, "").replace(/ /g, "");
    const amount = event.target.children[1].value;
    if (!amount.match(/[0-9]/g)) throw("You need to enter an amount in order to add your order to the basket.");

    if (currentOrder[pizzaType] === undefined) {
        currentOrder[pizzaType] = {
            "pizzaId": pizzaId,
            "sizes": [{"32cm": 0}, {"45cm": 0}]
        };
    }

    if (size === "32cm") {
        currentOrder[pizzaType].sizes[0]["32cm"] = Number(currentOrder[pizzaType].sizes[0]["32cm"]) + Number(amount);
    } else if (size === "45cm") {
        currentOrder[pizzaType].sizes[1]["45cm"] = Number(currentOrder[pizzaType].sizes[1]["45cm"]) + Number(amount);
    }
    
    event.target.children[1].value = "";
    console.log(currentOrder);

    postCurrentOrder();
}

function postCurrentOrder() {
    fetch(`${rootURL}/pizza/list`, {
        method: 'POST',
        headers : {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(currentOrder)
    })
        .then(response => response.text())
        .then(data => console.log(data));
}

window.addEventListener("load", onLoad);




// If you click out of the menu, save the current order details to a json. This way it will be available for the orders page.

// const handleOrder = async (event)=> {
//     const response = await fetch(`${document.location.href}pizza/order`, {
//         method: 'POST',
//         headers : {
//             'Content-type': 'application/json'
//         },
//         body: JSON.stringify({order: 'pizza'})
//     })
//  document.location.assign(`${document.location.href}pizza/order`)
// }