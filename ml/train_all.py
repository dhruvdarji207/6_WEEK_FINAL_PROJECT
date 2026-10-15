"""
Model Training and Benchmark Script for Waste2Worth AI
Trains price regression and match classification models from synthetic starter data.
Evaluates metrics (MAE, RMSE, R2, ROC-AUC, Accuracy) and serializes joblib artifacts.
"""

from pathlib import Path
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, roc_auc_score, f1_score,
    mean_absolute_error, root_mean_squared_error, r2_score
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent.parent
DATASETS_DIR = BASE_DIR / "datasets"
ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

def train_price_model():
    print("Training Indicative Price Regressor...")
    csv_path = DATASETS_DIR / "synthetic_demo_transactions.csv"
    if not csv_path.exists():
        print(f"Dataset not found at {csv_path}")
        return

    df = pd.read_csv(csv_path)
    df = df.dropna(subset=["price_inr_per_kg", "material_category", "quality_score_0_100"])
    df["distance_km"] = df["distance_km"].fillna(100.0)

    feature_cols = ["material_category", "quality_score_0_100", "contamination_pct", "quantity_tonnes", "distance_km"]
    X = df[feature_cols]
    y = df["price_inr_per_kg"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), ["material_category"]),
            ("num", StandardScaler(), ["quality_score_0_100", "contamination_pct", "quantity_tonnes", "distance_km"])
        ]
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42))
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    metrics = {"mae": round(mae, 4), "rmse": round(rmse, 4), "r2": round(r2, 4)}
    joblib.dump({"pipeline": pipeline, "metrics": metrics}, ARTIFACTS_DIR / "price_regressor.joblib")
    print(f"Price Model Saved: {metrics}")
    return metrics

def train_match_ranking_model():
    print("Training Match Ranking Classifier...")
    csv_path = DATASETS_DIR / "synthetic_demo_transactions.csv"
    if not csv_path.exists():
        return

    df = pd.read_csv(csv_path)
    df = df.dropna(subset=["match_completed", "material_category", "quality_score_0_100"])
    df["distance_km"] = df["distance_km"].fillna(100.0)

    feature_cols = ["material_category", "source_sector", "buyer_sector", "quantity_tonnes", "quality_score_0_100", "contamination_pct", "price_inr_per_kg", "distance_km"]
    X = df[feature_cols]
    y = df["match_completed"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), ["material_category", "source_sector", "buyer_sector"]),
            ("num", StandardScaler(), ["quantity_tonnes", "quality_score_0_100", "contamination_pct", "price_inr_per_kg", "distance_km"])
        ]
    )

    # Baseline: Logistic Regression
    pipe_baseline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("clf", LogisticRegression(random_state=42))
    ])
    pipe_baseline.fit(X_train, y_train)
    base_pred = pipe_baseline.predict(X_test)
    base_proba = pipe_baseline.predict_proba(X_test)[:, 1]
    base_acc = float(accuracy_score(y_test, base_pred))
    base_auc = float(roc_auc_score(y_test, base_proba))

    # Advanced: Gradient Boosting Classifier
    pipe_advanced = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("clf", GradientBoostingClassifier(n_estimators=80, max_depth=3, random_state=42))
    ])
    pipe_advanced.fit(X_train, y_train)
    adv_pred = pipe_advanced.predict(X_test)
    adv_proba = pipe_advanced.predict_proba(X_test)[:, 1]
    adv_acc = float(accuracy_score(y_test, adv_pred))
    adv_auc = float(roc_auc_score(y_test, adv_proba))
    adv_f1 = float(f1_score(y_test, adv_pred))

    benchmark = {
        "baseline_logistic_regression": {
            "accuracy": round(base_acc, 4),
            "roc_auc": round(base_auc, 4)
        },
        "gradient_boosting_ranker": {
            "accuracy": round(adv_acc, 4),
            "roc_auc": round(adv_auc, 4),
            "f1_score": round(adv_f1, 4)
        }
    }

    joblib.dump({"pipeline": pipe_advanced, "benchmark": benchmark}, ARTIFACTS_DIR / "match_ranker.joblib")
    print(f"Match Ranking Model Saved: {benchmark}")
    return benchmark

if __name__ == "__main__":
    train_price_model()
    train_match_ranking_model()
