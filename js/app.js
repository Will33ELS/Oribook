"use strict";

const hostAPI = "http://localhost:3000"; // A MODIFIER LORS DE L'INSTALLATION

/* AFFICHAGES DES ITEMS DEPUIS L'API*/
const showItems = async () => {
    fetch(`${hostAPI}/api/teddies/`).then(response => {
        const jsonReponse = response.json(); //RECUPERATION DU JSON
        jsonReponse.then(json => {
            const data = Object.values(json); //CONVERSION DU JSON EN ARRAY
            const items = data.map(({_id, name, price, description, imageUrl}) => ({
                _id, name, price, description, imageUrl
            }));
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
        })
    }).catch(function (err){
        sendAlert("danger", "<i class=\"fas fa-exclamation-triangle\"></i> Un incident lors de la connexion à l'API a eu lieu.");
    });
}


/* AFFICHAGE DES INFORMATIONS DE L'ARTICLE */
const showItem = async (item_id) => {
    fetch(hostAPI + "/api/teddies").then(response => {
        const responseJson = response.json(); //RECUPERATION DU JSON
        responseJson.then(json => {
            const data = Object.values(json); //CONVERSION DU JSON EN ARRAY
            let item = null;
            //RECUPERATION DE L'ARTICLE A PARTIR DE L'ID FOURNIS
            data.forEach(itemData => {
                if (item_id == itemData._id)
                    item = itemData;
            });

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
                if (countArticleInBasket(item_id) > 0) {
                    refreshBadgeButton(item_id);
                }
            }
        });
    }).catch(function (err){
        sendAlert("danger", "<i class=\"fas fa-exclamation-triangle\"></i> Un incident lors de la connexion à l'API a eu lieu.");
    });
}

/* RAFRAICHIR LA BADGE PRESENT DANS LE BOUTON SUR LA PAGE PRODUIT */
const refreshBadgeButton = (item_id) => {
    let badge = document.getElementById("button-badge");
    if (badge == null) {
        badge = document.createElement("span");
        badge.id = "button-badge";
        badge.classList.add("mx-1", "badge", "rounded-pill", "bg-secondary");
        document.getElementById("product-add").append(badge);
    }
    badge.textContent = countArticleInBasket(item_id);
}

/* AJOUT D'UN ARTICLE DANS LE PANIER */
const addArticle = (item_id) => {
    fetch(hostAPI + "/api/teddies").then(response => {
        const responseJson = response.json(); //RECUPERATION DU JSON
        responseJson.then(json => {
            const data = Object.values(json); //CONVERSION DU JSON EN ARRAY
            let item = null;
            //RECUPERATION DE L'ARTICLE A PARTIR DE L'ID FOURNIS
            data.forEach(itemData => {
                if (item_id == itemData._id)
                    item = itemData;
            });
            if (item == null) {
                console.error("L'ID renseigné ne correspond à aucun produit.");
            } else {
                const basket = localStorage.getItem('basket') == null ? [] : JSON.parse(localStorage.getItem('basket'));
                item = basket.find(item => item.id == item_id);
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
                refreshBadgeButton(item_id);
            }
        });
    }).catch(function (err){
        console.error("Un incident lors de la connexion à l'API a eu lieu.");
    });
}

/* SUPPRESSION DU PANIER */
const clearBasket = () => {
    localStorage.removeItem("basket");
    //SUPPRESSION DU CONTENU DU PANIER
    const tbody = document.getElementById("panier");
    if (tbody != null)
        tbody.remove();
    document.getElementById("panier-total").textContent = 0;
    sendAlert("info", "<i class='fas fa-info-circle'></i> Votre panier est vide");
}

/* QUANTITE DUN MEME ARTICLE DANS LE PANIER */
const countArticleInBasket = (item_id) => {
    let count = 0;
    const basket = localStorage.getItem('basket') == null ? [] : JSON.parse(localStorage.getItem('basket'));
    basket.forEach(item => {
        if (item.id == item_id) {
            count = item.quantity;
        }
    });
    return count;
}

/* AFFICHAGE DU CONTENU DU PANIER */
const showBasket = () => {
    const basket = localStorage.getItem('basket') == null ? [] : JSON.parse(localStorage.getItem('basket'));
    if (basket.length == 0) {
        sendAlert("info", "<i class='fas fa-info-circle'></i> Votre panier est vide");
        document.getElementById("button_command").setAttribute("disabled", true); //Le panier est vide, on désactive le bouton commander
    } else {
        const tbody = $(document.getElementById("panier"));
        let total = 0;
        basket.forEach(item => {
            fetch(hostAPI + "/api/teddies").then(response => {
                const responseJson = response.json(); //RECUPERATION DU JSON
                responseJson.then(json => {
                    const data = Object.values(json); //CONVERSION DU JSON EN ARRAY
                    data.forEach(itemData => {
                        if (itemData._id == item.id) {
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
                        }
                    });
                    document.getElementById("panier-total").textContent = total;
                });
            }).catch(function (err){
                sendAlert("danger", "<i class=\"fas fa-exclamation-triangle\"></i> Un incident lors de la connexion à l'API a eu lieu.");
            });
        });
    }
}

/* Validation du formulaire de contact */
const validateFormulaire = () => {
    if (localStorage.getItem('basket') == null) {
        sendAlert("info", "<i class='fas fa-info-circle'></i> Votre panier est vide");
    } else {
        const basket = JSON.parse(localStorage.getItem('basket'));
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

            //DEFINITION DE LA REQUETE
            const init = {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "contact": {
                        "firstName": firstNameInput,
                        "lastName": lastNameInput,
                        "address": addressInput,
                        "city": cityInput,
                        "email": emailInput,
                    },
                    "products": productsID,
                })
            }

            //ENVOIE DE LA REQUETE A L'API
            fetch(hostAPI + "/api/teddies/order", init)
                .then(response => {
                    response.json().then(data => {
                        let price = 0;
                        data.products.forEach(product => price += product.price);
                        clearBasket(); //SUPPRESSION DU PANIER
                        window.location.replace("confirm.html?orderId=" + data.orderId + "&price=" + price); //REDIRECTION VERS LA PAGE DE CONFIRMATION
                    });
                }).catch(function (err){
                    console.error(err);
                sendAlert("danger", "Une erreur a eu lieu lors de l'envoie du formulaire.");
            });
        } else {
            sendAlert("danger", "<i class=\"fas fa-exclamation-triangle\"></i> Tous les champs sont requis.");
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
};

/* Affichage d'alerte */
const sendAlert = (alertType, message) => {
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
        alert.innerHTML = message;
        alertDiv.append(alert);
    }
};