import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    """Calculates MAE, RMSE, MAPE, and R2 score."""
    y_true = np.array(y_true).flatten()
    y_pred = np.array(y_pred).flatten()
    
    # Avoid zero division in MAPE by masking zero/near-zero actual power values
    non_zero_mask = y_true > 0.05
    if np.sum(non_zero_mask) > 0:
        mape = np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])) * 100.0
    else:
        mape = 0.0
        
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    
    return {
        'MAE': round(float(mae), 4),
        'RMSE': round(float(rmse), 4),
        'MAPE (%)': round(float(mape), 2),
        'R² Score': round(float(r2), 4)
    }

def build_comparison_summary(fl_site_metrics: dict, cent_site_metrics: dict) -> pd.DataFrame:
    """Builds a formatted pandas DataFrame comparing FL vs Centralized per solar farm."""
    rows = []
    for site_id in fl_site_metrics.keys():
        fl_m = fl_site_metrics[site_id]
        cent_m = cent_site_metrics[site_id]
        
        rows.append({
            'Solar Farm': site_id,
            'FL MAE (MW)': fl_m['MAE'],
            'Cent MAE (MW)': cent_m['MAE'],
            'FL RMSE (MW)': fl_m['RMSE'],
            'Cent RMSE (MW)': cent_m['RMSE'],
            'FL MAPE (%)': fl_m['MAPE (%)'],
            'Cent MAPE (%)': cent_m['MAPE (%)'],
            'FL R²': fl_m['R² Score'],
            'Cent R²': cent_m['R² Score']
        })
        
    df = pd.DataFrame(rows)
    return df
