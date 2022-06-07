
// linked jquery to get document object model to display
$(document).ready(function () {
    main();

    function main() {
        get_latest_prices();
        get_valr_account_balance();
        get_valr_market_summary().then((result)=>{
            console.log(result);
        });
        load_table();
    }

    // call nodejs rest api backend and receive data to display
    function get_latest_prices() {
        $.get("/getLatestPrices", function(data, status){
            // console.log(data.BTC);
    
            // convert USD to ZAR, EURO to ZAR
            let arr = []
            // console.log(data)
    
            for (item in data) {
                for(item2 in data[item]) {
                    if(item == "BTC") {
                        $("#btc_zar").append(item2 + " : " + data[item][item2] + "<br />");
                    } else if(item == "ETH") {
                        $("#eth_zar").append(item2 + " : " + data[item][item2] + "<br />");
                    } else if(item == "SOL") {
                        $("#sol_zar").append(item2 + " : " + data[item][item2] + "<br />");
                    }
                }
            }
    
        });
    }


    // call nodejs rest api backend and receive data to display
    function get_valr_account_balance() {
        $.get("/valrAccountBalance", function(data, status){
            // console.log(data);

            // $("#valr_account").html(JSON.stringify(data[0]) + ', ' + JSON.stringify(data[1]) + ', ' + JSON.stringify(data[2]));

            let arr = [];

            arr.push("<br/>" + data[0].currency + " : " + data[0].available + "<br/>")
            arr.push(data[1].currency + " : " + data[1].available + "<br/>")
            arr.push(data[2].currency + " : " + data[2].available + "<br/>")
            
            $("#valr_account").html(arr.join(''));

            //valr_account
          });
    } 

    $("#valr_buy_btn").click(function(event) {
        let amount = $("#crypto_amount").val()
        let currency = $("#currency").val()

        post_valr_sell_order(amount, currency, "BUY");
    });

    $("#valr_sell_btn").click(function(event) {
        let amount = $("#crypto_amount").val()
        let currency = $("#currency").val()

        post_valr_sell_order(amount, currency, "SELL");
    });
    
    // call nodejs rest api backend and receive data to display
    function post_valr_sell_order(amount, currency, sell_or_buy) {

        // todo: get currency pair selected
        $.post("/postValrOrder", { currency: currency, amount: amount, sell_or_buy: sell_or_buy }, function(data, status){
            console.log(data);
          });
    }
    
    // call nodejs rest api backend and receive data to display
    async function get_valr_market_summary(res, erro) {
        let valr_ask_price = 0;
        // get valr askprice
        await $.post("/getValrMarketSummary", { currency_pair: "BTCZAR" }, function(data, status){
            valr_ask_price = data.askPrice;
          });

        return valr_ask_price;
    }
    
    function load_table() {
        var $table = $('#table');

        let columns = [{
            title: 'ID',
            field: 'id'
        }, {
            title: 'Item Name',
            field: 'name'
        }, {
            title: 'Item Price',
            field: 'price'
        }];

        var data = [
            {
                'id': 0,
                'name': 'Item 0',
                'price': '$0'
            },
            {
                'id': 1,
                'name': 'Item 1',
                'price': '$1'
            },
            {
                'id': 2,
                'name': 'Item 2',
                'price': '$2'
            },
            {
                'id': 3,
                'name': 'Item 3',
                'price': '$3'
            },
            {
                'id': 4,
                'name': 'Item 4',
                'price': '$4'
            },
            {
                'id': 5,
                'name': 'Item 5',
                'price': '$5'
            }
        ];

        $table.bootstrapTable({
            columns: columns,
            data: data
        });
    }
    
})