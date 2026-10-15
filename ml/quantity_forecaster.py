"""
Waste Quantity Forecasting Module with Strict Data Sufficiency Guardrails.
Requires sequential dated observations (minimum 6 periodic points).
If historical points are insufficient, returns structured diagnostic information
instead of generating inaccurate fabricated predictions.
"""

from datetime import datetime
from typing import Any
import numpy as np
from sklearn.linear_model import LinearRegression

MIN_REQUIRED_OBSERVATIONS = 6

def forecast_waste_quantity(
    historical_observations: list[dict[str, Any]],
    material_category: str,
    source_sector: str = "Manufacturing"
) -> dict[str, Any]:
    """
    Evaluates input data sufficiency for time-series quantity forecasting.
    Returns forecasted value if sufficient, or an explicit warning response.
    """
    valid_points = []
    for obs in historical_observations:
        qty = obs.get("quantity_tonnes")
        date_str = obs.get("date")
        if qty is not None and date_str:
            try:
                val = float(qty)
                if val >= 0:
                    valid_points.append({"date": str(date_str), "val": val})
            except (ValueError, TypeError):
                continue

    count = len(valid_points)
    if count < MIN_REQUIRED_OBSERVATIONS:
        return {
            "status": "insufficient_data",
            "message": (
                f"Insufficient historical observations: Found {count} data point(s), "
                f"but a minimum of {MIN_REQUIRED_OBSERVATIONS} dated monthly records are required "
                f"to construct a defensible time-series forecasting model."
            ),
            "provided_points_count": count,
            "minimum_required_points": MIN_REQUIRED_OBSERVATIONS,
            "forecasted_quantity_tonnes": None,
            "trend_direction": None,
            "confidence_interval": None,
            "data_limitation_note": (
                "The starter synthetic dataset contains point-in-time cross-sectional listings "
                "rather than longitudinal time-series data. Real historical production logs "
                "must be collected before running operational production forecasts."
            )
        }

    # Data is sufficient: Fit linear trend and estimate variance
    y = np.array([p["val"] for p in valid_points], dtype=float)
    X = np.arange(count).reshape(-1, 1)

    reg = LinearRegression()
    reg.fit(X, y)

    next_step = np.array([[count]])
    pred_val = float(reg.predict(next_step)[0])
    pred_val = max(0.1, round(pred_val, 2))

    slope = float(reg.coef_[0])
    if slope > 0.5:
        trend = "Increasing"
    elif slope < -0.5:
        trend = "Decreasing"
    else:
        trend = "Stable"

    residuals = y - reg.predict(X)
    std_err = float(np.std(residuals))
    ci_low = max(0.0, round(pred_val - 1.96 * std_err, 2))
    ci_high = round(pred_val + 1.96 * std_err, 2)

    return {
        "status": "sufficient",
        "message": f"Successfully calculated future 1-month quantity forecast based on {count} historical observations.",
        "provided_points_count": count,
        "minimum_required_points": MIN_REQUIRED_OBSERVATIONS,
        "forecasted_quantity_tonnes": pred_val,
        "trend_direction": trend,
        "confidence_interval": {
            "low": ci_low,
            "high": ci_high
        },
        "data_limitation_note": (
            "Model fitted using linear trend projection. Real production forecasting requires "
            "integration with ERP/MRP production volumes for seasonal decomposition."
        )
    }
