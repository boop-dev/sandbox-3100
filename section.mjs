
import { MongoClient } from 'mongodb';
import { connectToDB, getDb, closeDBConnection } from './utils/db.mjs';
const client = new MongoClient('mongodb://127.0.0.1:27017');
var database_ = await getDb();



export async function register_player(username, password){
    try {
        await connectToDB();
        database_ = await getDb()
        let collection = database_.collection('users');
        await collection.insertOne({username: username,
                                    password: password, 
                                    balance: 10000,
                                    portfolio: {},
                                    transactions: []})
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}

export async function return_balance(username){
    try {
        await connectToDB();
        database_ = await getDb()
        let collection = database_.collection('users');
        let user = await collection.findOne({username: username})
        return user.balance;
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}

export async function update_balance(username, newAmount){
    try {
        await connectToDB();
        database_ = await getDb()
        let collection = database_.collection('users');
        await collection.updateOne({username: username}, {$set: {balance: newAmount}})
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}



export async function update_portfolio(username, stock, noOfShares){
    // TODO: test for ones where the stocks do and don't exist in the portfolio
    try {
        await connectToDB();
        database_ = await getDb()
        let collection = database_.collection('users');
        let user = await collection.findOne({username: username})
        let user_portfolio = user.portfolio;
        
        // if player does not already have some shares of the stock
        if(user.portfolio[stock] === undefined){
            user_portfolio[stock] = noOfShares;
            await collection.updateOne({username: username}, {$set: {portfolio: user_portfolio}});
            console.log('init buying-----')
            console.log(user)
        }else{ //if they already have the stock
            user_portfolio[stock] = noOfShares;
            await collection.updateOne({username: username}, {$set: {portfolio: user_portfolio}});
        }
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}

export async function return_portfolio(username){
    try {
        await connectToDB();
        database_ = await getDb()
        let collection = database_.collection('users');
        let user = await collection.findOne({username: username})
        return user.portfolio;
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}

export async function return_user(username){
    try {
        await connectToDB();
        database_ = await getDb()
        let collection = database_.collection('users');
        let user = await collection.findOne({username: username})
        return user
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}

export async function create_game(player_one, player_two, goal_amount, name){
    try {
        await connectToDB();
        database_ = await getDb()
        let collection = database_.collection('games');
        let doesExist = await collection.count({game_name: name}, {limit: 1});

        // check if game is already in database
        if(doesExist != 1){
            console.log('foo')
            await collection.insertOne({P1: player_one, P2: player_two, goal_amount: goal_amount, game_name: name});
            return true;
        } else { 
            console.log('bar'); 
            return false; 
        }
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}

export async function add_transaction(username, type, stock, quantity, amount, time){
    try {
        await connectToDB();
        database_ = await getDb()
        let collection = database_.collection('users');
        let user = await collection.findOne({username: username})
        console.log(user)
        let new_transaction = {
            type: type,
            stock: stock,
            quantity: quantity,
            amount: amount,
            time: time
        }
        user.transactions.push(new_transaction)
        await collection.updateOne({username: username}, {$set: {transactions: user.transactions}})
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}

export async function returnTransactions(username){
    try {
        await connectToDB();
        database_ = await getDb();
        let collection = database_.collection('users');
        let user = await collection.findOne({username: username});
        if(user == undefined){return null} else { return user.transactions; }
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}

export async function remove_user(username){
    try {
        await connectToDB();
        database_ = await getDb();
        let collection = database_.collection('users');
        await collection.deleteOne({username: username});
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}

export async function delete_game(game_name){
    try {
        await connectToDB();
        database_ = await getDb();
        let collection = database_.collection('games');
        await collection.deleteOne({game_name: game_name});
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}

export async function delete_games(){
    try {
        await connectToDB();
        database_ = await getDb();
        let collection = database_.collection('games');
        await collection.deleteMany({});
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}

export default { register_player, return_balance, update_balance, 
    update_portfolio, return_user, return_portfolio, create_game,
    add_transaction, returnTransactions };
