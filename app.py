from flask import Flask, render_template, request, jsonify
import pandas as pd

app = Flask(__name__)
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
    x = request.json["x"]
    y = request.json["y"]
    agg = request.json["agg"]

    if agg == "SUM":
        grouped = df.groupby(x)[y].sum()
    elif agg == "AVG":
        grouped = df.groupby(x)[y].mean()
    else:  # COUNT
        grouped = df.groupby(x)[y].count()

    grouped = grouped.reset_index()

    return jsonify({
        "labels": grouped[x].astype(str).tolist(),
        "values": grouped[y].round(2).tolist()
    })

if __name__ == "__main__":
    app.run(debug=True)
