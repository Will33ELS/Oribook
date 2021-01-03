"use strict";

const hostAPI = "http://localhost:3000"; // A MODIFIER LORS DE L'INSTALLATION

/* AFFICHAGES DES ITEMS DEPUIS L'API*/
const showItems = () => {
    $.get(hostAPI+"/api/teddies").done(function(data){
        let items = [];
        data.forEach(item => items.push({
            "id": item._id,
            "name": item.name,
            "price": item.price,
            "description": item.description,
            "imageUrl": item.imageUrl
        }));
        items.forEach(item => {
            console.log(item);
            const card = $(document.createElement("div"));
            card.addClass("m-2 card").css("width", "18rem");
            const img = $(document.createElement("img"));
            img.addClass("card-img-top").attr("src", item.imageUrl).attr("alt", item.name).appendTo(card);
            const cardBody = $(document.createElement("div"));
            cardBody.addClass("card-body").appendTo(card);
            const cardTitle = $(document.createElement("h5"));
            cardTitle.addClass("card-title").html(item.name).appendTo(cardBody);
            const cardDescription = $(document.createElement("p"));
            cardDescription.addClass("card-text").html(item.description).appendTo(cardBody);
            const cardPrice = $(document.createElement("p"));
            cardPrice.addClass("card-text").html(item.price+"€").appendTo(cardBody);
            const cardLink = $(document.createElement("a"));
            cardLink.addClass("btn btn-primary").html("Voir le produit").attr("href", "produit.html?id="+item.id).appendTo(cardBody);

            $("#items").append(card);
        });

    }).catch(function (err){
        sendAlert("danger", "<i class=\"fas fa-exclamation-triangle\"></i> Un incident lors de la connexion à l'API a eu lieu.");
    });
};

/* AFFICHAGE DES INFORMATIONS DE L'ARTICLE */
const showItem = (item_id) => {
    $.get(hostAPI+"/api/teddies").done(function(data){
        let item = null;
        //RECUPERATION DE L'ARTICLE A PARTIR DE L'ID FOURNIS
        data.forEach(itemData => {
            if(item_id == itemData._id)
                item = itemData;
        });

        if(item == null) //AUCUN ARTICLE TROUVE SUR L'ID FOURNIS, REDIRECTION DE L'UTILISATEUR
            window.location.href = "index.html";
        else{
            //ARTICLE TROUVE, INSERTION DES INFORMATIONS
            $("#product-name").html(item.name);
            $("#product-description").html(item.description);
            $("#product-price").html(item.price);
            const select = $("#product-options");
            item.colors.forEach(color =>  select.append(new Option(color, color)));
            const img = $(document.createElement("img"));
            img.addClass("img-fluid").attr("src", item.imageUrl).attr("alt", item.name).appendTo($("#product-img"));
            if(countArticleInBasket(item_id) > 0){
                refreshBadgeButton(item_id);
            }
        }
    }).catch(function (err){
        sendAlert("danger", "<i class=\"fas fa-exclamation-triangle\"></i> Un incident lors de la connexion à l'API a eu lieu.");
    });
}

/* RAFRAICHIR LA BADGE PRESENT DANS LE BOUTON SUR LA PAGE PRODUIT */
const refreshBadgeButton = (item_id) => {
    let badge = $(document.getElementById("button-badge"));
    if(document.getElementById("button-badge")  == null){
        badge = $(document.createElement("span"));
        badge.attr("id", "button-badge").addClass("mx-1 badge rounded-pill bg-secondary");
        $("#product-add").append($(badge));
    }
    badge.html(countArticleInBasket(item_id));
}

/* AJOUT D'UN ARTICLE DANS LE PANIER */
const addArticle = (item_id) => {
    $.get(hostAPI+"/api/teddies").done(function(data) {
        let item = null;
        //RECUPERATION DE L'ARTICLE A PARTIR DE L'ID FOURNIS
        data.forEach(itemData => {
            if (item_id == itemData._id)
                item = itemData;
        });
        if(item == null){
            console.error("L'ID renseigné ne correspond à aucun produit.");
        }else {
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
    }).catch(function (err){
        console.error("Un incident lors de la connexion à l'API a eu lieu.");
    });

}

/* SUPPRESSION DU PANIER */
const clearBasket = () => {
    localStorage.removeItem("basket");
    //SUPPRESSION DU CONTENU DU PANIER
    const tbody = document.getElementById("panier");
    if(tbody != null)
        tbody.remove();
    $("#panier-total").html(0);
    sendAlert("info","<i class='fas fa-info-circle'></i> Votre panier est vide");
}

/* QUANTITE DUN MEME ARTICLE DANS LE PANIER */
const countArticleInBasket = (item_id) => {
    let count = 0;
    const basket = localStorage.getItem('basket') == null ? [] : JSON.parse(localStorage.getItem('basket'));
    basket.forEach(item => {
        if(item.id == item_id){
            count = item.quantity;
        }
    });
    return count;
}

/* AFFICHAGE DU CONTENU DU PANIER */
const showBasket = () => {
    const basket = localStorage.getItem('basket') == null ? [] : JSON.parse(localStorage.getItem('basket'));
    if(basket.length == 0){
        sendAlert("info", "<i class='fas fa-info-circle'></i> Votre panier est vide");
        document.getElementById("button_command").setAttribute("disabled", true); //Le panier est vide, on désactive le bouton commander
    }else{
        const tbody = $(document.getElementById("panier"));
        let total = 0;
        basket.forEach(item => {
            $.get(hostAPI+"/api/teddies").done(function(data){
                data.forEach(itemData => {
                    if(itemData._id == item.id){
                        const tr = $(document.createElement("tr"));
                        const articleName = $(document.createElement("td"));
                        articleName.html("<a href='produit.html?id="+itemData._id+"'>"+itemData.name+"</a>");
                        tr.append(articleName);
                        const priceunit = $(document.createElement("td"));
                        priceunit.html(itemData.price+" €");
                        tr.append(priceunit);
                        const quantity = $(document.createElement("td"));
                        quantity.html(item.quantity);
                        tr.append(quantity);
                        const pricetotal = $(document.createElement("td"));
                        pricetotal.html(item.quantity*itemData.price+" €");
                        tr.append(pricetotal);
                        tbody.append(tr);
                        total += item.quantity*itemData.price;
                    }
                });
                $("#panier-total").html(total);
            }).catch(function (){
                sendAlert("danger", "<i class=\"fas fa-exclamation-triangle\"></i> Un incident lors de la connexion à l'API a eu lieu.");
            });
        });
    }
}

/* Validation du formulaire de contact */
const validateFormulaire = () => {
    if(localStorage.getItem('basket') == null ){
        sendAlert("info", "<i class='fas fa-info-circle'></i> Votre panier est vide");
    }else{
        const basket = JSON.parse(localStorage.getItem('basket'));
        const productsID = [];
        basket.forEach(item => {
            for(let i = 1; i <= item.quantity; i++) {
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
        if(lastNameInput.length > 0 && firstNameInput.length > 0 && emailInput.length > 0 && addressInput.length > 0 && cityInput.length > 0 && codePostalInput.length > 0){
            //ENVOIE DE LA REQUETE A L'API
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                //RECUPERATION DE LA REPONSE DE L'API
                if (this.status == 201) {
                    let data = JSON.parse(this.responseText);
                    let price = 0;
                    data.products.forEach(product => price += product.price);
                    clearBasket(); //SUPPRESSION DU PANIER
                    window.location.replace("confirm.html?orderId="+data.orderId+"&price="+price); //REDIRECTION VERS LA PAGE DE CONFIRMATION
                }else if(this.status >= 400 && this.status < 600){ //L'API A RETOURNE UNE ERREUR
                    sendAlert("danger", "Une erreur a eu lieu lors de l'envoie du formulaire.")
                }
            };
            xhr.open("POST", hostAPI+"/api/teddies/order", true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            //DEFINITION DU BODY
            xhr.send(JSON.stringify({
                    "contact": {
                        "firstName": firstNameInput,
                        "lastName": lastNameInput,
                        "address": addressInput,
                        "city": cityInput,
                        "email": emailInput,
                    },
                    "products": productsID,
                }
            ));
        }else{
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
    $("#command_number").html(orderId);
    $("#command_total").html(price);
};

/* Affichage d'alerte */
const sendAlert = (alertType, message) => {
    if(alertType !== "primary" && alertType !== "secondary" && alertType !== "success" && alertType !== "danger" && alertType !== "warning" && alertType !== "info" && alertType !== "light" && alertType !== "dark"){
        console.error("Le type d'alerte renseigné n'est pas correct.")
    }else {
        const alertDiv = $(document.getElementById("alert"));
        if(alertDiv.length > 0) {
            alertDiv.children(0).remove();
        }
        const alert = $(document.createElement("div"));
        alert.addClass("alert alert-" + alertType).attr("role", "alert").html(message);
        alertDiv.append(alert);
    }
};