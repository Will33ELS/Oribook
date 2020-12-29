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
        }
    });
}

/* AJOUT D'UN ARTICLE DANS LE PANIER */
const addArticle = () => {

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