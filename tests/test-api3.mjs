import assert from 'assert'
import supertest from 'supertest'
import { dbClean, dbCount, dbClose } from "./apiHack.mjs"
import { register_player, return_portfolio, remove_user, delete_games, returnTransactions } from '../section.mjs';

var request = supertest("http://127.0.0.1:8820")

after(async () => { 
    await delete_games()
    await dbClose()
})



describe('POST /register', function() {
    var tests = [{ name: "attempt1", username: 'player1', password: 'staedler', expected: 201},
                 { name: "attempt2", username: 'player2', password: 'staedler', expected: 201},
                 { name: "attempt3", username: 'player3', password: 'staedler', expected: 201},
                 { name: "attempt4", username: 'player4', password: 'staedler', expected: 201},
                 { name: "attempt5", username: 'player5', password: 'staedler', expected: 201},
                 { name: "attempt6", username: 'player6', password: 'staedler', expected: 201},
                 { name: "attempt7", username: 'player7', password: 'staedler', expected: 201},
                 { name: "attempt8", username: 'player8', password: 'staedler', expected: 201},
                ];

    tests.forEach(function(test){
        it(`POST /register ${test.name}`, async function() {
            
            let response = await request.post('/register')
                                        .send({ username: test.username,
                                                password: test.password,
                                                portfolio: test.porfolio,
                                                transaction: test.transactions
                                            })
                                        .set('Content-Type', 'application/json');   

            
            assert.equal(test.expected, response.status)
            

        });
    });
})

describe('POST /buy', function() {
    var tests = [{name: 'attempt1', username: 'player1', stock: 'AAPL', amount: 500, expected: 201},
                //  {name: 'attempt2', username: 'player2', stock: 'AAPL', amount: 500, expected: 201},
                //  {name: 'attempt3', username: 'player3', stock: 'AAPL', amount: 500, expected: 201},
                //  {name: 'attempt4', username: 'player4', stock: 'AAPL', amount: 500, expected: 201},
                //  {name: 'attempt5', username: 'player5', stock: 'AAPL', amount: 500, expected: 201},
                //  {name: 'attempt6', username: 'player6', stock: 'AAPL', amount: 500, expected: 201},
                //  {name: 'attempt7', username: 'player7', stock: 'AAPL', amount: 500, expected: 201},
                //  {name: 'attempt8', username: 'player8', stock: 'AAPL', amount: 500, expected: 201},
                ];

    tests.forEach(function(test){
        it(`POST /buy ${test.name}`, async function() {
            
            let response = await request.post('/buy')
                                        .send({ stock: test.stock,
                                                username: test.username,
                                                amount: test.amount
                                            })
                                        .set('Content-Type', 'application/json');   

            assert.equal(test.expected, response.status)
            if( response.status >= 400 ) return

              
        });
    });
})


describe('POST /sell', function() {
    var tests = [{name: 'attempt1', username: 'player1', stock: 'AAPL', amount: 200, expected: 201},
                //  {name: 'attempt2', username: 'player2', stock: 'AAPL', amount: 200, expected: 201},
                //  {name: 'attempt3', username: 'player3', stock: 'AAPL', amount: 200, expected: 201},
                //  {name: 'attempt4', username: 'player4', stock: 'AAPL', amount: 200, expected: 201},
                //  {name: 'attempt5', username: 'player5', stock: 'AAPL', amount: 200, expected: 201},
                //  {name: 'attempt6', username: 'player6', stock: 'AAPL', amount: 200, expected: 201},
                //  {name: 'attempt7', username: 'player7', stock: 'AAPL', amount: 200, expected: 201},
                //  {name: 'attempt8', username: 'player8', stock: 'AAPL', amount: 200, expected: 201},
                ];

    tests.forEach(function(test){
        it(`POST /sell ${test.name}`, async function() {
            
            let response = await request.post('/sell')
                                        .send({ stock: test.stock,
                                                username: test.username,
                                                amount: test.amount
                                            })
                                        .set('Content-Type', 'application/json');   

            assert.equal(test.expected, response.status)
            if( response.status >= 400 ) return

              
        });
    });
})


// after the first three tests are run, there should be some stocks and cash left
//and their totsl value should roughly equal the initial value of 10000 since buying and selling stocks close to each other 
//shouldn't bring about any significant gains or losses
describe('GET /get-portfolio-value', function() {
    var tests = [{ name: 'attempt1', username: 'player1', value: 10000, expect: 200 },
                 { name: 'attempt2', username: 'player2', value: 10000, expect: 200 },
                 { name: 'attempt3', username: 'player3', value: 10000, expect: 200 }]
    tests.forEach(function(test){
        it(`GET /get-portfolio-value/${test.username}`, async function() {

            let response = await request.get(`/get-portfolio-value/${test.username}`)
            // console.log(response.status, test.username)
            // if( response.status >= 400 ){
            //     assert(test.expect >= 400, "should not give an error code response" )
            //     return
            // }
            // console.log(response['total'])

            //in my testing some times the value fluctuates, after buying and selling, the 
            // total value should be around 9900 to 10100
            assert.equal((test.value - 100 < response.body['total'] < test.value + 100), true) 
            
        });
    });
})


describe('GET /declare-winner', function() {
    var tests = [{ name: "attempt 1", one: [ 1000 ], two: [ 2600 ], result: "2", status: 200},
                 { name: "attempt 2", one: [ 1050 ], two: [ 1001 ], result: "1", status: 200},
                 { name: "attempt 3", one: [ 2055 ], two: [ 1001 ], result: "1", status: 200},
                 { name: "attempt 4", one: [ 2302 ], two: [ 1050 ], result: "1", status: 200},
                 { name: "attempt 5", one: [ 4212 ], two: [ 4133 ], result: "1", status: 200},
                 { name: "attempt 6", one: [ 2031 ], two: [ 4212 ], result: "2", status: 200},
                 { name: "attempt 7", one: [ 1001 ], two: [ 6390 ], result: "2", status: 200},
                 { name: "attempt 8", one: [ 6990 ], two: [ 1000 ], result: "1", status: 200},
                 { name: "attempt 9", one: [ 2425 ], two: [ 4900 ], result: "2", status: 200},
                 { name: "attempt10", one: [ 1001 ], two: [ 1000 ], result: "1", status: 200},
                ];

    tests.forEach(function(test){
        it(`GET /declare-winner ${test.name}`, async function() {
            
            let response = await request.get(`/declare-winner?one=${test.one[0]}&two=${test.two[0]}`)
            
            assert.equal(test.status, response.status)
            if( response.status < 400 ) assert.equal(test.result, response.body['winner'])
        });
    });
})


describe('POST /create-game', async function() {
    var tests = [{ name: 'attempt1', args: ['game1' ,'player1', 'player2', true, 10200 ], expected: 201 , message: 'Success'},   
                 { name: 'attempt2', args: ['game2' ,'player3', 'player4', true, 10200 ], expected: 201 , message: 'Success'},
                 { name: 'attempt3', args: ['game3' ,'player5', 'player6', true, 10200 ], expected: 201 , message: 'Success'},
                 { name: 'attempt4', args: ['game4' ,'player7', 'player8', true, 10200 ], expected: 201 , message: 'Success'},
                 { name: 'attempt5', args: ['game4' ,'player9', 'player10', true, 10200 ], expected: 201 , message: 'Choose another game name'},
                 { name: 'attempt6', args: ['game5' ,'player11', 'player12', false, 10200 ], expected: 400, message: 'Admin permission required'},
                 { name: 'attempt7', args: ['game2' ,'player13', 'player14', true, 10200 ], expected: 201, message: 'Choose another game name'},
                 { name: 'attempt8', args: ['game6' ,'player15', 'player16', false, 10200 ], expected: 400, message: 'Admin permission required'},
                ];

    tests.forEach(function(test){
        it(`POST /create-game ${test.name}`, async function() {
            
            let response = await request.post('/create-game')
                                        .send({ isAdmin: test.args[3],
                                                player_one_username: test.args[1],
                                                player_two_username: test.args[2],
                                                goal_amount: test.args[4],
                                                game_name: test.args[0]
                                            })
                                        .set('Content-Type', 'application/json');   

            assert.equal(test.expected, response.status);
            assert.equal(test.message, response.body.message);
        });
    });
})


describe('GET /get-opponent-portfolio', function() {
        var tests = [{ name: "attempt 1", opponent: 'player1', status: 200},
                     { name: "attempt 2", opponent: 'player2', status: 200},
                     { name: "attempt 3", opponent: 'player3', status: 200},
                     { name: "attempt 4", opponent: 'player4', status: 200},
                     { name: "attempt 5", opponent: 'player5', status: 200},
                     { name: "attempt 6", opponent: '', status: 404},
                     { name: "attempt 7", opponent: 'player7', status: 200},
                     { name: "attempt 8", opponent: '', status: 404}
                    ];
    
        tests.forEach(function(test){
            it(`GET /get-opponent-portfolio ${test.name}`, async function() {
                
                let response = await request.get(`/get-opponent-portfolio?username=${test.opponent}`)
                

                assert.equal(test.status, response.status )
                await register_player(test.opponent, test.opponent)
                let portfolio = await return_portfolio(test.opponent)
                await remove_user(test.opponent)
                if( response.status < 400 ) assert.equal((JSON.stringify(portfolio) == JSON.stringify(response.body['portfolio'])), true)
            });
        });
    })


    describe('GET /get-transaction-history', function() {
        var tests = [{ name: "attempt 1", opponent: 'player1', status: 200},
                     { name: "attempt 2", opponent: 'player2', status: 200},
                     { name: "attempt 3", opponent: 'player3', status: 200},
                     { name: "attempt 4", opponent: 'player4', status: 200},
                     { name: "attempt 5", opponent: 'player5', status: 200},
                     { name: "attempt 6", opponent: '', status: 404},
                     { name: "attempt 7", opponent: 'player7', status: 200},
                     { name: "attempt 8", opponent: '', status: 404}
                    ];
    
        tests.forEach(function(test){
            it(`GET /get-opponent-portfolio ${test.name}`, async function() {
                
                let response = await request.get(`/get-transaction-history?username=${test.opponent}`)
                

                assert.equal(test.status, response.status )
                await register_player(test.opponent, test.opponent)
                let transactions = await returnTransactions(test.opponent)
                await remove_user(test.opponent)
                if( response.status < 400 ) assert.equal((JSON.stringify(transactions) == JSON.stringify(response.body['transactions'])), true)
            });
        });
    })
