import yfinance as yf
import json
import sys
import pandas
ticker =  sys.argv[1]
requestType = sys.argv[2]
stockData = yf.Ticker(ticker)

if requestType == "info":
    try:
        print(json.dumps(stockData.info))
    except ValueError:
        print("{empty: true}")
elif requestType == "recommendations":
    try:
        rec = stockData.recommendations
        if rec.empty:
            print("{empty:true}")
        else:
            print(rec['To Grade'].tail(5).mode()[0])

    except ValueError:
        print("{empty:true}")

elif requestType == "timeseries":
    try:
        hist = stockData.history(period="1mo")
        if hist.empty:
            print("{empty:true}")
        else:
            print(hist[['Close']].to_json(orient="index"))

    except ValueError:
        print("{empty:true}")

elif requestType == "bulkPrice":
    prices = []
    # Decode json string into Python list
    tickers = json.loads(sys.argv[1])
    for tick in tickers:
        # print("TICK IS", tick)
        # Get price data
         prices.append({"ticker": tick, "price": yf.Ticker(tick).info['regularMarketPrice']})
    print(prices)
sys.stdout.flush()