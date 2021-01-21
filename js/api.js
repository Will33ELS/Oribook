const hostAPI = "http://localhost:3000"; // A MODIFIER LORS DE L'INSTALLATION

const API = {


    //RECUPERER LA LISTE DES ARTICLES
    async getItems(){
        let data = await fetch(`${hostAPI}/api/teddies/`)
            .then(response => {
                return response;
            }).catch(error => console.warn(error));
        let json = await data.json().then(json => { return json });
        return json;
    },


    //RECUPERER LES INFORMATIONS D'UN ARTICLE
    async getItem(item_id){
        //RECUPERATION DEPUIS L'API
        let data = await fetch(`${hostAPI}/api/teddies`).then(response => { return response;})
            .catch(error => { console.warn(error); });
        //CONVERSION EN JSON
        let json = await data.json().then(json => { return json; });

        const array = Object.values(json); //CONVERSION DU JSON EN ARRAY
        let item = null;
        //RECUPERATION DE L'ARTICLE A PARTIR DE L'ID FOURNIS
        array.forEach(itemData => {
            if (item_id === itemData._id)
                item = itemData;
        });
        return item;
    },


    //CREER UN ORDRE D'ACHAT
    async createOrder(contact, productsID){

        //DEFINITION DE LA REQUETE
        const init = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "contact": contact,
                "products": productsID,
            })
        }

        //ENVOIE DE LA REQUETE A L'API ET RECUPERATION DE LA REPONSE
        let data = await fetch(hostAPI + "/api/teddies/order", init)
            .then(response => { return response; })
            .catch(function (err){ console.error(err);});
        let json = await data.json().then(json => { return json; });

        return json;
    }
}
