import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import torch
from torch.utils.data import TensorDataset, DataLoader

def generate_site_data(site_id: int, num_days: int = 60, freq_mins: int = 15, seed: int = 42) -> pd.DataFrame:
    """
    Generates realistic synthetic multi-site solar power time-series data.
    Each site has distinct geographical capacity, weather variations, and cloud noise.
    """
    np.random.seed(seed + site_id * 100)
    
    steps_per_day = 24 * (60 // freq_mins)
    total_steps = num_days * steps_per_day
    
    start_date = pd.Timestamp("2026-01-01 00:00:00")
    timestamps = pd.date_range(start=start_date, periods=total_steps, freq=f"{freq_mins}min")
    
    # Site characteristics
    site_capacity_mw = 10.0 + (site_id * 5.5) % 35.0  # 10 to 45 MW solar capacity
    longitude_shift_hours = (site_id * 0.4) - 1.0     # Solar noon variation across sites
    efficiency = 0.85 + np.random.uniform(-0.05, 0.05)
    
    hours = (timestamps.hour + timestamps.minute / 60.0 + longitude_shift_hours).to_numpy()
    day_of_year = timestamps.dayofyear.to_numpy()
    
    # Solar irradiance curve (W/m2)
    # Seasonal variation factor
    seasonal_factor = 0.8 + 0.2 * np.sin(2 * np.pi * (day_of_year - 80) / 365.25)
    
    # Solar elevation profile during day (6am to 6pm)
    solar_angle = np.maximum(0, np.sin(np.pi * (hours - 6.0) / 12.0))
    irradiance = 1000.0 * solar_angle * seasonal_factor
    
    # Cloud cover noise (smooth random walk between 0 and 1)
    raw_cloud = np.random.normal(0, 0.15, size=total_steps)
    cloud_cover = np.clip(pd.Series(raw_cloud).ewm(span=12).mean().values + 0.3, 0.0, 0.95)
    
    # Effective irradiance considering clouds
    effective_irradiance = irradiance * (1.0 - 0.75 * cloud_cover)
    
    # Temperature profile (°C)
    temp_base = 18.0 + 8.0 * np.sin(2 * np.pi * (day_of_year - 100) / 365.25)
    temp_daily = 6.0 * np.sin(np.pi * (hours - 9.0) / 12.0)
    temperature = temp_base + temp_daily + np.random.normal(0, 0.8, size=total_steps)
    
    # Temperature loss coefficient (panels lose ~0.4% efficiency per °C above 25°C)
    temp_coef = 1.0 - 0.004 * (temperature - 25.0)
    
    # Solar Power Output (MW)
    power_mw = (effective_irradiance / 1000.0) * site_capacity_mw * efficiency * temp_coef
    power_mw = np.maximum(0.0, power_mw + np.random.normal(0, 0.02 * site_capacity_mw, size=total_steps))
    
    # Nighttime zero force
    night_mask = (hours < 5.5) | (hours > 18.5)
    power_mw[night_mask] = 0.0
    irradiance[night_mask] = 0.0
    
    df = pd.DataFrame({
        'timestamp': timestamps,
        'site_id': f"Solar_Farm_{site_id}",
        'solar_power': np.round(power_mw, 4),
        'irradiance': np.round(irradiance, 2),
        'temperature': np.round(temperature, 2),
        'cloud_cover': np.round(cloud_cover, 3),
        'hour': hours % 24.0,
        'day_of_week': timestamps.dayofweek
    })
    
    return df

class TimeSeriesDataPreprocessor:
    def __init__(self, sequence_length: int = 24, forecast_horizon: int = 1):
        self.seq_len = sequence_length
        self.horizon = forecast_horizon
        self.feature_scaler = MinMaxScaler()
        self.target_scaler = MinMaxScaler()
        self.feature_cols = ['solar_power', 'irradiance', 'temperature', 'cloud_cover', 'hour']
        self.target_col = 'solar_power'
        
    def fit_transform(self, df: pd.DataFrame):
        features = df[self.feature_cols].values
        target = df[[self.target_col]].values
        
        scaled_features = self.feature_scaler.fit_transform(features)
        scaled_target = self.target_scaler.fit_transform(target)
        
        X, y = [], []
        for i in range(len(scaled_features) - self.seq_len - self.horizon + 1):
            X.append(scaled_features[i : i + self.seq_len])
            y.append(scaled_target[i + self.seq_len : i + self.seq_len + self.horizon, 0])
            
        X = np.array(X, dtype=np.float32)
        y = np.array(y, dtype=np.float32)
        return X, y

    def transform(self, df: pd.DataFrame):
        features = df[self.feature_cols].values
        target = df[[self.target_col]].values
        
        scaled_features = self.feature_scaler.transform(features)
        scaled_target = self.target_scaler.transform(target)
        
        X, y = [], []
        for i in range(len(scaled_features) - self.seq_len - self.horizon + 1):
            X.append(scaled_features[i : i + self.seq_len])
            y.append(scaled_target[i + self.seq_len : i + self.seq_len + self.horizon, 0])
            
        X = np.array(X, dtype=np.float32)
        y = np.array(y, dtype=np.float32)
        return X, y

    def inverse_transform_target(self, y_scaled: np.ndarray) -> np.ndarray:
        if y_scaled.ndim == 1:
            y_scaled = y_scaled.reshape(-1, 1)
        return self.target_scaler.inverse_transform(y_scaled)

def create_dataloaders(X: np.ndarray, y: np.ndarray, train_ratio: float = 0.8, batch_size: int = 32):
    split_idx = int(len(X) * train_ratio)
    
    X_train, y_train = X[:split_idx], y[:split_idx]
    X_test, y_test = X[split_idx:], y[split_idx:]
    
    train_ds = TensorDataset(torch.tensor(X_train), torch.tensor(y_train))
    test_ds = TensorDataset(torch.tensor(X_test), torch.tensor(y_test))
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False)
    
    return train_loader, test_loader, (X_train, y_train, X_test, y_test)
