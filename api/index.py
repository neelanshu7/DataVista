from flask import Flask, render_template, request, jsonify
import pandas as pd
import os

app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../static"
)

df = None

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    global df
    file = request.files["file"]
    df = pd.read_csv(file)
    return jsonify({"columns": list(df.columns)})

@app.route("/data", methods=["POST"])
def data():
    global df
    payload = request.json
    x = payload["x"]
    y = payload["y"]
    agg = payload["agg"]

    if agg == "SUM":
        grouped = df.groupby(x)[y].sum()
    elif agg == "AVG":
        grouped = df.groupby(x)[y].mean()
    else:
        grouped = df.groupby(x)[y].count()

    grouped = grouped.reset_index()

    return jsonify({
        "labels": grouped[x].astype(str).tolist(),
        "values": grouped[y].round(2).tolist()
    })

# Required for Vercel
app = app
