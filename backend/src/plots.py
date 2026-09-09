import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import numpy as np

def plot_time_series_forecast(y_true: np.ndarray, fl_pred: np.ndarray, cent_pred: np.ndarray, site_id: str, sample_limit: int = 192) -> go.Figure:
    """Plots actual vs predicted solar power output for a specific site over a sample window (e.g. 48 hours)."""
    limit = min(sample_limit, len(y_true))
    x_axis = np.arange(limit)
    
    fig = go.Figure()
    
    # Actual Solar Power
    fig.add_trace(go.Scatter(
        x=x_axis, y=y_true[:limit].flatten(),
        mode='lines', name='Actual Solar Output (MW)',
        line=dict(color='#2E7D32', width=3)
    ))
    
    # Federated Forecast
    fig.add_trace(go.Scatter(
        x=x_axis, y=fl_pred[:limit].flatten(),
        mode='lines', name='Federated Model (FedAvg)',
        line=dict(color='#0288D1', width=2, dash='dash')
    ))
    
    # Centralized Forecast
    fig.add_trace(go.Scatter(
        x=x_axis, y=cent_pred[:limit].flatten(),
        mode='lines', name='Centralized Model Baseline',
        line=dict(color='#E65100', width=2, dash='dot')
    ))
    
    fig.update_layout(
        title=f"Solar Power Forecasting Comparison - {site_id} (Sample Window)",
        xaxis_title="Time Steps (15-min intervals)",
        yaxis_title="Power Generation (MW)",
        hovermode="x unified",
        template="plotly_white",
        legend=dict(orient="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )
    return fig

def plot_training_loss(fl_losses: list, cent_losses: list) -> go.Figure:
    """Plots convergence loss curves over FL rounds and Centralized epochs."""
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=list(range(1, len(fl_losses) + 1)), y=fl_losses,
        mode='lines+markers', name='Federated Averaging Loss',
        line=dict(color='#0288D1', width=3),
        marker=dict(size=6)
    ))
    
    fig.add_trace(go.Scatter(
        x=list(range(1, len(cent_losses) + 1)), y=cent_losses,
        mode='lines+markers', name='Centralized Model Loss',
        line=dict(color='#E65100', width=3),
        marker=dict(size=6)
    ))
    
    fig.update_layout(
        title="Training Loss Convergence over Iteration Rounds / Epochs",
        xaxis_title="FL Communication Round / Training Epoch",
        yaxis_title="Mean Squared Error (MSE Loss)",
        template="plotly_white",
        hovermode="x unified"
    )
    return fig

def plot_metrics_comparison(summary_df: pd.DataFrame) -> go.Figure:
    """Bar chart comparing MAE across all solar farms."""
    fig = go.Figure()
    
    fig.add_trace(go.Bar(
        x=summary_df['Solar Farm'],
        y=summary_df['FL MAE (MW)'],
        name='Federated (FedAvg) MAE',
        marker_color='#0288D1'
    ))
    
    fig.add_trace(go.Bar(
        x=summary_df['Solar Farm'],
        y=summary_df['Cent MAE (MW)'],
        name='Centralized MAE',
        marker_color='#E65100'
    ))
    
    fig.update_layout(
        title="Mean Absolute Error (MAE) Comparison across Solar Farms",
        xaxis_title="Solar Site",
        yaxis_title="MAE (MW)",
        barmode='group',
        template="plotly_white"
    )
    return fig

def plot_communication_cost(cum_fl_comm_mb: float, raw_data_size_mb: float, num_rounds: int) -> go.Figure:
    """Bar chart comparing privacy-preserving weight transfer vs uploading raw datasets."""
    fig = go.Figure()
    
    fig.add_trace(go.Bar(
        x=['Centralized Data Transfer', f'Federated FL ({num_rounds} Rounds)'],
        y=[raw_data_size_mb, cum_fl_comm_mb],
        marker_color=['#E53935', '#43A047'],
        text=[f"{raw_data_size_mb:.2f} MB", f"{cum_fl_comm_mb:.2f} MB"],
        textposition='auto'
    ))
    
    fig.update_layout(
        title="Communication Bandwidth & Data Privacy Footprint",
        yaxis_title="Total Data Transferred over Network (MB)",
        template="plotly_white"
    )
    return fig
