import express, { json, urlencoded } from 'express';
import bodyParser from 'body-parser';
import { register_player, return_balance, return_user, update_balance, update_portfolio, create_game, return_portfolio, add_transaction, returnTransactions } from './section.mjs';
import { connectToDB, closeDBConnection } from './utils/db.mjs';
import https from 'https'
import { log } from 'console';

const app = express();

app.use(json());
app.use(bodyParser.json())
app.use(urlencoded({extended: true}));
// const apikey = 'KvGHDkRqxseWWQH7FK9VHQinFzh3y2EG', 'v44oh9BF7VRo5U9AqvYaOFfCR0lHqFWZ'
const apikey = 'WvxlymfENmtpJJauR90mIe04vAlyruPg'


async function getStockPrice(stock){
    const options = {
        hostname: 'financialmodelingprep.com',
        port: 443,
        path: `https://financialmodelingprep.com/api/v3/quote/${stock}?apikey=${apikey}`,
        method: 'GET'
    }
                
    let p = new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let response = null
            res.on('data', (d) => {
                //converts bytes --> string --> JSON
                response = JSON.parse(String.fromCharCode(...d))            
            })

            res.on('end', () => {
                resolve(response[0].price)
            })
            
        })
    
        req.on('error', (error) => {
            reject(error)
        })
        req.end()
    })
    return await p
}


async function createServer(){
    try {
        await connectToDB();

        app.post("/register", async function postSection(req, res){
            let uname = req.body.username;
            let passw = req.body.password;
            let code = 400;
            try {
                await register_player(uname, passw);
                code = 201;
            } catch (err) {
                console.log(err)
            }
            res.status(code).send()
        });

        app.post("/buy", async function buyStock(req, res){
            let username = req.body.username;
            let stock = req.body.stock;
            let amount = req.body.amount;

            try{
                let balance = await return_balance(username);
                if (balance >= amount){
                    let stock_price = await getStockPrice(stock);
                    let no_of_shares = amount/stock_price;
                    let user = await return_user(username);
                    if (user.portfolio[stock] !== undefined){
                        no_of_shares = no_of_shares + user.portfolio[stock]
                    }
                    let newBalance = balance - amount;
                    await update_balance(username, newBalance);
                    await update_portfolio(username, stock, no_of_shares);
                    await add_transaction(username, 'buy', stock, no_of_shares, amount, new Date());
                    res.status(201).send('Success')
                }else{
                    res.status(400).send('Inadequate Balance')
                }
            } catch (error) {
                res.status(400).send()
                console.error(error)
            }
        })

        app.post("/sell", async function sellStock(req, res){
            let username = req.body.username;
            let stock = req.body.stock;
            let amount = req.body.amount;

            try{
                let balance = await return_balance(username);
                let user = await return_user(username);
                let stock_price = await getStockPrice(stock);
                let no_of_shares = amount/stock_price;
                let user_shares = user.portfolio[stock];
                if(user_shares === undefined || user_shares === 0){
                    res.status(400).send('Not Enough shares to sell')
                }else if(user_shares*stock_price < amount){
                    res.status(400).send('Not Enough shares to sell')
                }else if(user_shares*stock_price >= amount){
                    user_shares = user_shares - no_of_shares;
                    balance = balance + amount;
                    await update_balance(username, balance);
                    await update_portfolio(username, stock, user_shares);
                    await add_transaction(username, 'sell', stock, no_of_shares, amount, new Date());
                    res.status(201).send('Success')
                }
            } catch (error) {
                res.status(400).send()
                console.log(error)
            }
        })


        app.get("/get-portfolio-value/:username", async function getPortfolioValue(req, res){
            let username = req.params.username;
            let user = await return_user(username);
            let porfolio = user.portfolio;
            let balance = user.balance;
            let total = 0
            for(let stock of Object.keys(porfolio)){
                let price = await getStockPrice(stock)
                total += (price * porfolio[stock])
            }
            total = total + balance;
            res.status(200).json({total: total.toString()});
        })


        app.get("/declare-winner", async function getWinner(req, res){
            let player_one = parseFloat(req.query.one);
            let player_two = parseFloat(req.query.two);

            //1 if player1 wins, 2 if player2 wins, 3 if they draw, 4 if anything else is wrong such as invalid input
            if(player_one > player_two){ res.status(200).json({winner: "1"})}
            else if (player_one < player_two){ res.status(200).json({winner: "2"}) }
            else if (player_one === player_two){ res.status(200).json({winner: "3"})}
            else { res.status(200).json({winner: "4"})}

        })

        app.post("/create-game", async function createGame(req, res){
            let isAdmin = req.body.isAdmin;
            let player_one = req.body.player_one_username;
            let player_two = req.body.player_two_username;
            let goal_amount = req.body.goal_amount;
            let game_name = req.body.game_name

            if(isAdmin){
                let isCreated = await create_game(player_one, player_two, goal_amount, game_name);
                console.log(isCreated)
                if(isCreated){ res.status(201).json({message: 'Success', isSucessful: true}) }
                else{ res.status(201).json({message: 'Choose another game name', isSucessful: false}); }
            } else { 
                res.status(400).json({message: 'Admin permission required', isSucessful: false});
            }

        })

        //------------ADDITIONAL FEATURES-------------

        app.get('/get-opponent-portfolio', async function getOpponentPortfolio(req, res){
            let username = req.query.username;
            let user_portfolio = await return_portfolio(username);
            console.log(req.query)
            if(username !== ''){
                res.status(200).json({portfolio: user_portfolio})
            }else{
                res.status(404).send()
            }
        })

        app.get('get-transaction-history', async function getMatchHistory(req, res){
            let username = req.query.username;

            try{
                let user_transactions = await returnTransactions(username);
                if (transactions == null){ res.status(404).json({message: "Player not found"})}
                else{res.status(200).json({message: "Success", transactions: user_transactions})}
            }catch(error){
                console.error(error)
            }
            

            res.status(200).json(transactions)
            

        })
        
        
        app.listen(8820, function(){
            console.log(" Server started at port 8820 ...");
        })
    } catch(error){
        console.log(error)
    }
}

createServer();

process.on('SIGINT', () => {
    console.info('SIGINT signal received.');
    console.log('Closing Mongo Client.');
    server.close(async function(){
      let msg = await closeDBConnection()   ;
      console.log(msg);
    });
  });