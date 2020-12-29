const hostAPI = "http://localhost:3000"; // A MODIFIER LORS DE L'INSTALLATION

/* AFFICHAGES DES ITEMS DEPUIS L'API*/
const showItems = () => {
    $.get(hostAPI+"/api/teddies").done(function(data){
        let items = [];
        data.forEach(item => items.push(new Item(item._id, item.name, item.price, item.description, item.imageUrl)));
        items.forEach(item => {
            console.log(item);
            const card = document.createElement("div");
            $(card).addClass("m-2 card").css("width", "18rem");
            const img = document.createElement("img");
            $(img).addClass("card-img-top").attr("src", item.imageUrl).attr("alt", item.name).appendTo($(card));
            const cardBody = document.createElement("div");
            $(cardBody).addClass("card-body").appendTo($(card));
            const cardTitle = document.createElement("h5");
            $(cardTitle).addClass("card-title").html(item.name).appendTo($(cardBody));
            const cardDescription = document.createElement("p");
            $(cardDescription).addClass("card-text").html(item.description).appendTo($(cardBody));
            const cardPrice = document.createElement("p");
            $(cardPrice).addClass("card-text").html(item.price+"€").appendTo($(cardBody));
            const cardLink = document.createElement("a");
            $(cardLink).addClass("btn btn-primary").html("Voir le produit").attr("href", "produit.html?id="+item.id).appendTo($(cardBody));

            $("#items").append($(card));
        });

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
            const img = document.createElement("img");
            $(img).addClass("img-fluid").attr("src", item.imageUrl).attr("alt", item.name).appendTo($("#product-img"));
            if(countArticleInBasket(item_id) > 0){
                refreshBadgeButton(item_id);
            }
        }
    });
}

/* RAFRAICHIR LA BADGE PRESENT DANS LE BOUTON SUR LA PAGE PRODUIT */
const refreshBadgeButton = (item_id) => {
    let badge = document.getElementById("button-badge") ;
    if(document.getElementById("button-badge")  == null){
        badge = document.createElement("span");
        $(badge).attr("id", "button-badge").addClass("mx-1 badge rounded-pill bg-secondary");
        $("#product-add").append($(badge));
    }
    $(badge).html(countArticleInBasket(item_id));
}

/* AJOUT D'UN ARTICLE DANS LE PANIER */
const addArticle = (item_id) => {
    const basket = localStorage.getItem('basket') == null ? [] : JSON.parse(localStorage.getItem('basket'));
    let item = basket.find(item => item.id == item_id);
    if(item == null){
        item = {
            id: item_id,
            quantity: 1
        };
        basket.push(item);
    }else{
        item.quantity += 1;
    }
    localStorage.setItem('basket', JSON.stringify(basket));
    refreshBadgeButton(item_id);
}

/* SUPPRESSION DU PANIER */
const clearBasket = () => {
    localStorage.removeItem("basket");
    //SUPPRESSION DU CONTENU DU PANIER
    const tbody = document.getElementById("panier");
    tbody.remove();
    $("#panier-total").html(0);
    const panierAlert = document.getElementById("panier-alert");
    const alert = document.createElement("div");
    $(alert).addClass("alert alert-info").attr("role", "alert").html("<i class='fas fa-info-circle'></i> Votre panier est vide");
    $(panierAlert).append(alert);
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
        const panierAlert = document.getElementById("panier-alert");
        const alert = document.createElement("div");
        $(alert).addClass("alert alert-info").attr("role", "alert").html("<i class='fas fa-info-circle'></i> Votre panier est vide");
        $(panierAlert).append(alert);
    }else{
        const tbody = document.getElementById("panier");
        let total = 0;
        basket.forEach(item => {
            $.get(hostAPI+"/api/teddies").done(function(data){
                data.forEach(itemData => {
                    if(itemData._id == item.id){
                        const tr = document.createElement("tr");
                        const articleName = document.createElement("td");
                        $(articleName).html("<a href='produit.html?id="+itemData._id+"'>"+itemData.name+"</a>");
                        $(tr).append(articleName);
                        const priceunit = document.createElement("td");
                        $(priceunit).html(itemData.price+" €");
                        $(tr).append(priceunit);
                        const quantity = document.createElement("td");
                        $(quantity).html(item.quantity);
                        $(tr).append(quantity);
                        const pricetotal = document.createElement("td");
                        $(pricetotal).html(item.quantity*itemData.price+" €");
                        $(tr).append(pricetotal);
                        $(tbody).append(tr);
                        total += item.quantity*itemData.price;
                    }
                });
                $("#panier-total").html(total);
            });
        });
    }
}

/* CLASSE QUI CORRESPOND A L'ARTICLE */
class Item{
    constructor(id, name, price, description, imageUrl) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
    }
}