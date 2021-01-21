"use strict";

/* AFFICHAGES DES ITEMS DEPUIS L'API*/
const showItems = async () => { //getItems
    API.getItems().then(itemsResponse => {
        const data = Object.values(itemsResponse); //CONVERSION DU JSON EN ARRAY
        const items = data.map(({_id, name, price, description, imageUrl}) => ({
            _id, name, price, description, imageUrl
        }));
        /* Séparer dans une autre fonction showItem */
        items.forEach(item => {
            const card = document.createElement("div");
            card.classList.add("m-2", "card");
            card.style.width = "18rem";
            const img = document.createElement("img");
            img.classList.add("card-img-top");
            img.setAttribute("src", item.imageUrl);
            img.setAttribute("alt", item.name);
            card.append(img);
            const cardBody = document.createElement("div");
            cardBody.classList.add("card-body");
            card.append(cardBody);
            const cardTitle = document.createElement("h5");
            cardTitle.classList.add("card-title");
            cardTitle.textContent = item.name;
            cardBody.append(cardTitle);
            const cardDescription = document.createElement("p");
            cardDescription.classList.add("card-text");
            cardDescription.textContent = item.description;
            cardBody.append(cardDescription);
            const cardPrice = document.createElement("p");
            cardPrice.classList.add("card-text");
            cardPrice.textContent = item.price+"€";
            cardBody.append(cardPrice);
            const cardLink = document.createElement("a");
            cardLink.classList.add("btn", "btn-primary");
            cardLink.textContent = "Voir le produit";
            cardLink.setAttribute("href", "produit.html?id=" + item._id);
            cardBody.append(cardLink);
            document.getElementById("items").append(card);
        });
        hideLoader(); //SUPPRESSION DU LOADER
    });
}


/* AFFICHAGE DES INFORMATIONS DE L'ARTICLE */
const showItem = (item_id) => {
    API.getItem(item_id).then(item => {
        if (item == null) //AUCUN ARTICLE TROUVE SUR L'ID FOURNIS, REDIRECTION DE L'UTILISATEUR
            window.location.href = "index.html";
        else {
            //ARTICLE TROUVE, INSERTION DES INFORMATIONS
            document.getElementById("product-name").textContent = item.name;
            document.getElementById("product-description").textContent = item.description;
            document.getElementById("product-price").textContent = item.price;
            const select = document.getElementById("product-options");
            item.colors.forEach(color => select.append(new Option(color, color)));
            const img = document.createElement("img");
            img.classList.add("img-fluid");
            img.setAttribute("src", item.imageUrl);
            img.setAttribute("alt", item.name);
            document.getElementById("product-img").append(img);
        }
        hideLoader(); //SUPPRESSION DU LOADER
    });
}

/* RAFRAICHIR LA BADGE PRESENT DANS LA NAVBAR (Articles totaux) */
const refreshBadgeButton = () => {
    let badge = document.getElementById("basket-badge");
    if (badge == null) {
        badge = document.createElement("span");
        badge.id = "basket-badge";
        badge.classList.add("mx-1", "badge", "rounded-pill", "bg-warning");
        document.getElementById("basket").append(badge);
    }
    badge.textContent = countAllArticlesInBasket();
}

/* AJOUT D'UN ARTICLE DANS LE PANIER */
const addArticle = (item_id) => {
    API.getItem(item_id).then(item => {
        if (item == null) {
            console.error("L'ID renseigné ne correspond à aucun produit.");
        } else {
            const basket = getBasket();
            item = basket.find(item => item.id === item_id);
            if (item == null) {
                item = {
                    id: item_id,
                    quantity: 1
                };
                basket.push(item);
            } else {
                item.quantity += 1;
            }
            localStorage.setItem('basket', JSON.stringify(basket));
            refreshBadgeButton();
        }
    });
}

/* RECUPERATION DU PANIER */
const getBasket = () => {
    return localStorage.getItem('basket') == null ? [] : JSON.parse(localStorage.getItem('basket'))
};

/* SUPPRESSION DU PANIER OK */
const clearBasket = () => {
    localStorage.removeItem("basket");
    //SUPPRESSION DU CONTENU DU PANIER
    const tbody = document.getElementById("panier");
    if (tbody != null)
        tbody.remove();
    document.getElementById("panier-total").textContent = 0;
    sendAlert("info", "fa-info-circle", "Votre panier est vide");
}

/* RECUPERER LE NOMBRE TOTAL D'ARTICLE DANS LE PANIER */
const countAllArticlesInBasket = () => {
    let count = 0;
    const basket = getBasket();
    basket.forEach(item => {
        count += item.quantity;
    });
    return count;
}

/* AFFICHAGE DU CONTENU DU PANIER */
const showBasket = () => {
    const basket = getBasket();
    if (basket.length === 0) {
        sendAlert("info", "fa-info-circle", "Votre panier est vide");
        document.getElementById("button_command").setAttribute("disabled", true); //Le panier est vide, on désactive le bouton commander
    } else {
        const tbody = document.getElementById("panier");
        let total = 0;
        basket.forEach(item => {
            API.getItem(item.id).then(itemData => {
                const tr = document.createElement("tr");
                const articleName = document.createElement("td");
                articleName.innerHTML = "<a href='produit.html?id=" + itemData._id + "'>" + itemData.name + "</a>";
                tr.append(articleName);
                const priceunit = document.createElement("td");
                priceunit.textContent = itemData.price+"€";
                tr.append(priceunit);
                const quantity = document.createElement("td");
                quantity.textContent = item.quantity;
                tr.append(quantity);
                const pricetotal = document.createElement("td");
                pricetotal.textContent = item.quantity * itemData.price + " €";
                tr.append(pricetotal);
                tbody.append(tr);
                total += item.quantity * itemData.price;
                document.getElementById("panier-total").textContent = total;
            });
        });
    }
    hideLoader(); //SUPPRESSION DU LOADER
}

/* Validation du formulaire de contact */
const validateFormulaire = () => {
    const basket = getBasket();
    if (basket.length === 0) {
        sendAlert("info", "fa-info-circle", "Votre panier est vide");
    } else {
        const productsID = [];
        basket.forEach(item => {
            for (let i = 1; i <= item.quantity; i++) {
                productsID.push(item.id);
            }
        });
        const lastNameInput = document.getElementById("nom").value; //Input Nom
        const firstNameInput = document.getElementById("prenom").value; //Input Prénom
        const emailInput = document.getElementById("email").value; //Input Email
        const addressInput = document.getElementById("address").value; //Input Adresse
        const cityInput = document.getElementById("city").value; //Input Ville
        const codePostalInput = document.getElementById("code_postal").value; //Input Code postal
        //VERIFICATION QUE LES VALEURS NE SONT PAS VIDE
        if (lastNameInput.length > 0 && firstNameInput.length > 0 && emailInput.length > 0 && addressInput.length > 0 && cityInput.length > 0 && codePostalInput.length > 0) {

            const contact = {
                "firstName": firstNameInput,
                "lastName": lastNameInput,
                "address": addressInput,
                "city": cityInput,
                "email": emailInput,
            };

            API.createOrder(contact, productsID).then(order => {
                let price = 0;
                order.products.forEach(product => price += product.price);
                clearBasket(); //SUPPRESSION DU PANIER
                window.location.replace("confirm.html?orderId=" + order.orderId + "&price=" + price); //REDIRECTION VERS LA PAGE DE CONFIRMATION
            });
        } else {
            sendAlert("danger", "fa-exclamation-triangle", "Tous les champs sont requis.");
        }
    }
};

/* Affichage de la page de confirmation */
const showConfirm = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString); //Récupération des paramétres dans l'URL
    const orderId = urlParams.get("orderId");
    const price = urlParams.get("price");
    document.getElementById("command_number").textContent = orderId;
    document.getElementById("command_total").textContent = price;
    hideLoader(); //SUPPRESSION DU LOADER
};

/* Affichage d'alerte */
const sendAlert = (alertType, iconName, message) => {
    if (alertType !== "primary" && alertType !== "secondary" && alertType !== "success" && alertType !== "danger" && alertType !== "warning" && alertType !== "info" && alertType !== "light" && alertType !== "dark") {
        console.error("Le type d'alerte renseigné n'est pas correct.")
    } else {
        const alertDiv = document.getElementById("alert");
        while( alertDiv.firstChild) { //RECUPERATION DE TOUS LES ENFANTS
            alertDiv.removeChild( alertDiv.firstChild); // SUPPRESSION DE L'ENFANT
        }
        const alert = document.createElement("div");
        alert.classList.add("alert", "alert-"+alertType);
        alert.setAttribute("role", "alert");
        if(iconName !== null){
            const icon = document.createElement("i");
            icon.classList.add("fas", iconName);
            alert.append(icon);
        }
        const textContent = document.createElement("span");
        textContent.classList.add("mx-2")
        textContent.textContent = message;
        alert.append(textContent);
        alertDiv.append(alert);
    }
};

/* SUPPRESSION DU LOADER SUR LA PAGE */
const hideLoader = () => {
    const loaderDiv = document.getElementById("loader");
    loaderDiv.classList.add("d-none");
}
