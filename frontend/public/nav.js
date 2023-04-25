const buttonComponent = (id, text) => `<button id="${id}">${text.charAt(0).toUpperCase() + text.slice(1)}</button>`;
const divCreator = (id, text) => `<div id="${id}">${text}</div> `
const goBackButton = `<button onclick="history.back()">Go Back</button>`

let buttons = ["about", "story", "contact", "order", "list", "welcome"]

const rootElement = document.getElementById("root");
rootElement.insertAdjacentHTML("afterbegin", divCreator("container", ""))
// rootElement.insertAdjacentHTML("afterend", divCreator("animate-charcter", 'PizzaBoyz'))
rootElement.insertAdjacentHTML("afterend", divCreator("animate-area", ""))

const container = document.getElementById("container")
container.insertAdjacentHTML("afterbegin", goBackButton)
buttons.forEach((item) => container.insertAdjacentHTML("afterbegin", buttonComponent(item, item)))

document.getElementById("list").innerText = "Menu";


const loadEvent = _ => {

    const clickEvent = event => {
        const rootURL = window.location.origin;
        if (buttons.includes(event.target.id)) {

            window.location.replace(`${rootURL}/pizza/${event.target.id}`)

        }



    }
    window.addEventListener("click", clickEvent);
}


window.addEventListener("load", loadEvent)