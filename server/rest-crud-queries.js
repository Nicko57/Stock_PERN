/*
REST API query functions

------------------- Users -----------------------
GET    /api/users/        getUsers()
POST   /api/users/        addUsers()
GET     /api/users/:id     getUserByName()

------------------- Portfolio -------------------
GET     /api/portfolio/     getPortfolios()
GET     /api/portfolio/:id  getPortfolioById()

---------- Stock Info (External API) ------------
GET     /api/search/:ticker    searchStockbyTicker()

------------------- Buy -------------------------
POST     /api/holdings/:symbol    buyStockbySymbol()

------------------- Sell ------------------------
UPDATE     /api/holdings/:symbol    sellStockBySymbol()
DELETE     /api/holdings/:symbol    sellAllStockBySymbol()

------------------- History ---------------------
GET     /api/history/:id        getHistoryById()
POST    /api/history            addHistory()

*/

// Connect to Heroku PostgreSQL DB
const { Pool } = require('pg');

// To send requests to RapidAPI
const http = require("https")

const { spawn } = require('child_process');

// Get api key
const { STOCK_API_KEY } = require('./config')

const pool = new Pool({
    //   connectionString: process.env.DATABASE_URL,
    connectionString: "postgres://iioxcfyrutgczy:80f3200be4abf011168dbef178c5049a1682df9944e1e2eabc45c58a4947312c@ec2-52-44-139-108.compute-1.amazonaws.com:5432/dek0oshg3gkfo4",
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect();


// ----------------------------------------------------------------------------
// IMPLEMENT API HERE
// ----------------------------------------------------------------------------
// User API
const getUsers = (request, response) => {
    pool.query('SELECT * FROM users', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
        console.log("Server: Successfuly get users");
    });
}

// Get a single user by their username
const getUserByName = (request, response) => {
    const username = request.params.id
    console.log(username)
    pool.query('SELECT * FROM users WHERE username = $1',
        [username], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        })
}

const addUsers = (request, response) => {
    console.log("Server: Received adduser data as", request.body)

    const { username, hash_password, cash } = request.body
    pool.query("INSERT INTO users (username, hash_password, cash) VALUES($1, $2, $3)",
        [username, hash_password, cash],
        (error) => {
            if (error) {
                throw error
            }
            response.status(201).json({ status: 'success', message: 'User added.' })
        }
    )
}

// const updateCashById = (request, response) => {
//     const { user_id, cash } = request.body
//     pool.query("UPDATE users SET cash = $2 WHERE user_id = $1",
//         [user_id, cash],
//         (error) => {
//             if (error) {
//                 throw error
//             }
//             response.status(201).json({ status: 'success', message: `Updated cash to ${cash} for UserID ${user_id}.` })
//         }
//     )
// }

const addCashById = (request, response) => {
    const id = request.params.id
    const addCash = request.params.addCash
    pool.query("UPDATE users SET cash = cash + $2 WHERE id = $1",
        [id, addCash],
        (error) => {
            if (error) {
                throw error
            }
            response.status(201).json({ status: 'success', message: `Added cash to ${addCash} for UserID ${id}.` })
        }
    )
}

// ----------------------------------------------------------------------------
// Portfolio API
const getPortfolios = (request, response) => {
    pool.query('SELECT * FROM portfolio', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
        console.log("Server: Successfuly get portfolios");
    });
}

const getPortfolioById = (request, response) => {
    const id = request.params.id
    console.log(id)
    pool.query('SELECT * FROM portfolio WHERE user_id = $1',
        [id], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        })
}

const getPortfolioByStock = (request, response) => {
    const id = request.params.id
    const stock = request.params.stock
    console.log(id)
    pool.query('SELECT * FROM portfolio WHERE user_id = $1 AND ticker = $2',
        [id, stock], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        })
}

const addToPortfolioById = (request, response) => {
    const { user_id, ticker, n_holding, current_price, current_total } = request.body
    pool.query("INSERT INTO portfolio (user_id, ticker, n_holding, current_price, current_total) VALUES($1, $2, $3, $4, $5)",
        [user_id, ticker, n_holding, current_price, current_total],
        (error) => {
            if (error) {
                throw error
            }
            response.status(201).json({ status: 'success', message: `Bought ${n_holding}$ shares of ${ticker}$ to portfolio.` })
        }
    )
}

const deleteFromPortfolioById = (request, response) => {
    const user_id = request.params.id;
    const stock = request.params.stock;
    pool.query("DELETE FROM portfolio WHERE user_id = $1 AND ticker = $2",
        [user_id, stock],
        (error) => {
            if (error) {
                throw error
            }
            response.status(201).json({ status: 'success', message: `Sold all shares of ${stock}$ from portfolio.` })
        }
    )
}

const updatePortfolioByStock = (request, response) => {
    const { user_id, ticker, n_holding, current_price, current_total } = request.body;

    pool.query("UPDATE portfolio SET n_holding = $3, current_price = $4, current_total = $5 WHERE user_id = $1 AND ticker = $2",
        [user_id, ticker, n_holding, current_price, current_total],
        (error) => {
            if (error) {
                throw error
            }
            response.status(201).json({ status: 'success', message: `Updated portfolio for UserID ${user_id}.` })
        }
    )
}

// ----------------------------------------------------------------------------
// Transaction history API
const getHistoryById = (request, response) => {
    const userId = request.params.id
    console.log(userId)
    pool.query('SELECT * FROM trade_history WHERE user_id = $1',
        [userId], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        })
}

const addHistory = (request, response) => {
    console.log("Server: Received addHistory data as", request.body)

    const { user_id, ticker, trade_type, trade_n, price, date } = request.body
    pool.query("INSERT INTO trade_history (user_id, ticker, trade_type, trade_n, price, date) VALUES($1, $2, $3, $4, $5, $6)",
        [user_id, ticker, trade_type, trade_n, price, date],
        (error) => {
            if (error) {
                throw error
            }
            response.status(201).json({ status: 'success', message: 'Transaction successfully recorded.' })
        }
    )
}
// ----------------------------------------------------------------------------
// Stock querying API
// Use APIs provided by RapidAPI, such as their unofficial Yahoo Finance API
const getStockInfo = (request, response) => {

    const requestedTicker = request.params.ticker

    const options = {
        "method": "GET",
        "hostname": "apidojo-yahoo-finance-v1.p.rapidapi.com",
        "port": null,
        "path": `/stock/v2/get-summary?symbol=${requestedTicker}`,
        "headers": {
            "x-rapidapi-key": STOCK_API_KEY,
            "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
            "useQueryString": true
        }
    };

    const req = http.request(options, function (res) {
        const chunks = [];

        res.on("error", function () {
            console.log("Server error")
            response.status(200).json({ empty: true })
        }).on("data", function (chunk) {
            chunks.push(chunk);
        }).on("end", function () {
            const body = Buffer.concat(chunks);

            if (body.length !== 0) {
                // Success
                const data = JSON.parse(body)
                response.status(200).json(data)
            } else {
                // Stock not found
                response.status(200).json({ empty: true })
            }


        });
    });

    req.end();
}

const getYFinance = (request, response) => {
    var ticker = request.params.stock
    var requestType = request.params.type
    console.log(ticker)
    var dataset = []
    // spawn new child process to call the python script
    const python = spawn('python3', ['server/get-yfinance-stock-data.py', ticker, requestType]);
    // collect data from script
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        dataset.push(data)
        
    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        response.send(dataset.join(""))
        console.log(dataset.join(""))
    });

}


module.exports = {
    getUsers,
    getUserByName,
    addUsers,
    addCashById,

    getPortfolios,
    getPortfolioById,
    getPortfolioByStock,
    addToPortfolioById,
    updatePortfolioByStock,

    deleteFromPortfolioById,

    getHistoryById,
    addHistory,

    getStockInfo,

    getYFinance,
}