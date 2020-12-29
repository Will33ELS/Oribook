const hostAPI = "http://localhost:3000"; // A MODIFIER LORS DE L'INSTALLATION

/* AFFICHAGES DES ITEMS DEPUIS L'API*/
const showItems = () => {
    $.get(hostAPI+"/api/teddies").done(function(data){
        let items = [];
        data.forEach(item => items.push(new Item(item.name, item.price, item.description, item.imageUrl)));
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
            $(cardLink).addClass("btn btn-primary").html("Voir le produit").attr("href", "#").appendTo($(cardBody));

            $("#items").append($(card));
        });

    });
};

/* CLASSE QUI CORRESPOND A L'ARTICLE */
class Item{
    constructor(name, price, description, imageUrl) {
        this.name = name;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
    }
}