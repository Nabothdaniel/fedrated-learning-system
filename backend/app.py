import streamlit as st
import pandas as pd
import numpy as np
import torch
import time
import os

# Import local modules
from src.data_generator import generate_site_data, TimeSeriesDataPreprocessor, create_dataloaders
from src.models import SolarLSTM, count_parameters, get_model_payload_size_mb
from src.federated import FederatedClient, FederatedServer
from src.centralized import CentralizedTrainer
from src.metrics import calculate_metrics, build_comparison_summary
from src.plots import (
    plot_time_series_forecast,
    plot_training_loss,
    plot_metrics_comparison,
    plot_communication_cost
)

st.set_page_config(
    page_title="Federated Solar Forecasting FYP Simulation",
    page_icon="☀️",
    layout="wide"
)

# Custom Styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.3rem;
        font-weight: 700;
        color: #1E88E5;
        text-align: center;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #555;
        text-align: center;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #f8f9fa;
        border-left: 4px solid #1E88E5;
        padding: 12px;
        border-radius: 4px;
        margin-bottom: 10px;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-header">☀️ Federated Learning for Privacy-Preserving Solar Power Forecasting</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Final Year Project (FYP) Interactive Simulation & Benchmark Platform</div>', unsafe_allow_html=True)

# Sidebar Parameters
st.sidebar.header("⚙️ Simulation Settings")

num_sites = st.sidebar.slider("Number of Solar Sites (Clients)", min_value=2, max_value=8, value=4, step=1)
sim_days = st.sidebar.slider("Simulation Data (Days)", min_value=15, max_value=60, value=30, step=5)
fl_rounds = st.sidebar.slider("FL Communication Rounds", min_value=3, max_value=25, value=10, step=1)
local_epochs = st.sidebar.slider("Local Epochs per Round", min_value=1, max_value=5, value=2, step=1)
seq_length = st.sidebar.slider("Input Sequence Length (15-min steps)", min_value=12, max_value=48, value=24, step=4)
learning_rate = st.sidebar.select_slider("Learning Rate", options=[0.0005, 0.001, 0.002, 0.005], value=0.001)

run_button = st.sidebar.button("🚀 Run FL Simulation", type="primary", use_container_width=True)

# Main Simulation Execution
if run_button or 'sim_results' not in st.session_state:
    with st.spinner("Initializing Multi-Site Solar Generation Data & Deep Learning Models..."):
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        # Step 1: Data Generation & Preprocessing
        status_text.text("Step 1/4: Generating multi-site solar time-series datasets...")
        site_dfs = []
        site_preprocessors = {}
        client_dataloaders = {}
        all_X_train, all_y_train = [], []
        client_samples = {}
        raw_data_bytes = 0
        
        for i in range(num_sites):
            df_site = generate_site_data(site_id=i, num_days=sim_days, freq_mins=15, seed=42)
            site_dfs.append(df_site)
            raw_data_bytes += df_site.memory_usage(deep=True).sum()
            
            prep = TimeSeriesDataPreprocessor(sequence_length=seq_length, forecast_horizon=1)
            X, y = prep.fit_transform(df_site)
            site_preprocessors[f"Solar_Farm_{i}"] = prep
            
            train_loader, test_loader, (X_tr, y_tr, X_te, y_te) = create_dataloaders(X, y, train_ratio=0.8, batch_size=32)
            
            client_dataloaders[f"Solar_Farm_{i}"] = {
                'train': train_loader,
                'test': test_loader,
                'X_test': X_te,
                'y_test': y_te,
                'num_samples': len(X_tr)
            }
            
            all_X_train.append(X_tr)
            all_y_train.append(y_tr)
            client_samples[f"Solar_Farm_{i}"] = len(X_tr)
            
        progress_bar.progress(20)
        
        # Step 2: Initialize Federated Server & Clients
        status_text.text("Step 2/4: Training Federated Learning (FedAvg) across distributed solar sites...")
        server = FederatedServer(input_dim=5, hidden_dim=64, num_layers=2, output_dim=1)
        clients = {}
        for site_id, loaders in client_dataloaders.items():
            clients[site_id] = FederatedClient(
                client_id=site_id,
                train_loader=loaders['train'],
                test_loader=loaders['test'],
                num_samples=loaders['num_samples']
            )
            
        fl_round_losses = []
        round_comm_mbs = []
        
        for r in range(fl_rounds):
            global_weights = server.get_global_weights()
            client_updates = []
            round_client_losses = []
            
            for site_id, client in clients.items():
                updated_weights, n_samples, train_loss = client.train_local(
                    global_weights=global_weights,
                    local_epochs=local_epochs,
                    lr=learning_rate
                )
                client_updates.append((updated_weights, n_samples))
                round_client_losses.append(train_loss)
                
            agg_weights, round_comm_mb = server.federated_averaging(client_updates)
            avg_fl_loss = float(np.mean(round_client_losses))
            fl_round_losses.append(avg_fl_loss)
            round_comm_mbs.append(round_comm_mb)
            
            pct = 20 + int(50 * (r + 1) / fl_rounds)
            progress_bar.progress(pct)
            status_text.text(f"Step 2/4: Executing FL Round {r+1}/{fl_rounds} (Avg Loss: {avg_fl_loss:.5f})...")
            
        final_fl_weights = server.get_global_weights()
        
        # Step 3: Centralized Model Baseline
        status_text.text("Step 3/4: Training Centralized Model Baseline for comparative evaluation...")
        centralized_trainer = CentralizedTrainer(input_dim=5, hidden_dim=64, num_layers=2, output_dim=1)
        cent_losses = centralized_trainer.train_centralized(
            all_X_train, all_y_train,
            epochs=fl_rounds * local_epochs,
            batch_size=32,
            lr=learning_rate
        )
        progress_bar.progress(90)
        
        # Step 4: Evaluate Models & Calculate Metrics
        status_text.text("Step 4/4: Computing accuracy metrics (MAE, RMSE, MAPE, R²) and payload cost...")
        fl_site_results = {}
        cent_site_results = {}
        
        for site_id, loaders in client_dataloaders.items():
            prep = site_preprocessors[site_id]
            client = clients[site_id]
            
            # FL Predictions
            _, y_t_scaled, fl_p_scaled = client.evaluate(final_fl_weights)
            y_t_unscaled = prep.inverse_transform_target(y_t_scaled).flatten()
            fl_p_unscaled = prep.inverse_transform_target(fl_p_scaled).flatten()
            
            # Centralized Predictions
            _, _, cent_p_scaled = centralized_trainer.evaluate(loaders['test'])
            cent_p_unscaled = prep.inverse_transform_target(cent_p_scaled).flatten()
            
            fl_metrics = calculate_metrics(y_t_unscaled, fl_p_unscaled)
            cent_metrics = calculate_metrics(y_t_unscaled, cent_p_unscaled)
            
            fl_site_results[site_id] = {
                'metrics': fl_metrics,
                'y_true': y_t_unscaled,
                'y_pred': fl_p_unscaled
            }
            cent_site_results[site_id] = {
                'metrics': cent_metrics,
                'y_pred': cent_p_unscaled
            }
            
        summary_df = build_comparison_summary(
            {k: v['metrics'] for k, v in fl_site_results.items()},
            {k: v['metrics'] for k, v in cent_site_results.items()}
        )
        
        progress_bar.progress(100)
        status_text.empty()
        progress_bar.empty()
        
        # Save results in session state
        st.session_state['sim_results'] = {
            'summary_df': summary_df,
            'fl_site_results': fl_site_results,
            'cent_site_results': cent_site_results,
            'fl_round_losses': fl_round_losses,
            'cent_losses': cent_losses,
            'cum_fl_comm_mb': server.cum_comm_mb,
            'raw_data_size_mb': raw_data_bytes / (1024 ** 2),
            'model_params': count_parameters(server.global_model),
            'model_size_mb': server.model_size_mb,
            'fl_rounds': fl_rounds,
            'num_sites': num_sites
        }

# Retrieve Session Data
res = st.session_state['sim_results']
summary_df = res['summary_df']
fl_results = res['fl_site_results']
cent_results = res['cent_site_results']

# Display Key Metric Cards
col1, col2, col3, col4 = st.columns(4)

avg_fl_mae = summary_df['FL MAE (MW)'].mean()
avg_cent_mae = summary_df['Cent MAE (MW)'].mean()
avg_fl_r2 = summary_df['FL R²'].mean()
comm_saving = max(0, 100.0 * (1.0 - res['cum_fl_comm_mb'] / max(0.01, res['raw_data_size_mb'])))

col1.metric("Federated Avg MAE", f"{avg_fl_mae:.3f} MW", delta=f"{avg_fl_mae - avg_cent_mae:+.3f} vs Baseline", delta_color="inverse")
col2.metric("Centralized Baseline MAE", f"{avg_cent_mae:.3f} MW")
col3.metric("Federated Avg R² Score", f"{avg_fl_r2:.4f}")
col4.metric("Network Privacy Payload", f"{res['cum_fl_comm_mb']:.2f} MB", help="Total weight parameters exchanged over FL rounds")

st.markdown("---")

# Tabbed Interface
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📉 Solar Forecast Curves",
    "📊 Error Metrics & Comparisons",
    "🔄 Training Convergence",
    "🔒 Privacy & Bandwidth Cost",
    "📄 FYP Report Export"
])

with tab1:
    st.subheader("Solar Power Generation Forecast vs Actuals")
    selected_site = st.selectbox("Select Solar Farm Site:", options=list(fl_results.keys()))
    sample_steps = st.slider("Forecast Window Size (15-min intervals):", min_value=48, max_value=384, value=192, step=24)
    
    y_tr = fl_results[selected_site]['y_true']
    fl_p = fl_results[selected_site]['y_pred']
    cent_p = cent_results[selected_site]['y_pred']
    
    fig_ts = plot_time_series_forecast(y_tr, fl_p, cent_p, selected_site, sample_limit=sample_steps)
    st.plotly_chart(fig_ts, use_container_width=True)
    
    st.info("💡 **Insight for FYP Defense:** The Federated model matches the generation peaks and diurnal curves closely while keeping raw operational data 100% local to each site.")

with tab2:
    st.subheader("Performance Evaluation Across Solar Sites")
    st.dataframe(summary_df, use_container_width=True)
    
    fig_bar = plot_metrics_comparison(summary_df)
    st.plotly_chart(fig_bar, use_container_width=True)

with tab3:
    st.subheader("Loss Convergence Profile (FedAvg vs Centralized Baseline)")
    fig_loss = plot_training_loss(res['fl_round_losses'], res['cent_losses'])
    st.plotly_chart(fig_loss, use_container_width=True)

with tab4:
    st.subheader("Privacy Preservation & Communication Overhead Analysis")
    c1, c2 = st.columns(2)
    
    with c1:
        st.markdown(f"""
        **Federated Learning Security & Communication Profile:**
        - **Total Client Solar Farms:** {res['num_sites']}
        - **LSTM Model Parameters:** {res['model_params']:,} weights
        - **Payload per Model Copy:** {res['model_size_mb']:.3f} MB
        - **Communication Rounds:** {res['fl_rounds']} rounds
        - **Total Weight Data Exchanged:** `{res['cum_fl_comm_mb']:.2f} MB`
        
        🔒 **Privacy Guarantee:** Zero raw time-series records, sensor readings, or operational variables were transmitted outside the local solar sites.
        """)
        
    with c2:
        fig_comm = plot_communication_cost(res['cum_fl_comm_mb'], res['raw_data_size_mb'], res['fl_rounds'])
        st.plotly_chart(fig_comm, use_container_width=True)

with tab5:
    st.subheader("LaTeX & Markdown Table Export for Project Report")
    st.markdown("Copy the markdown table below directly into your thesis draft or slides:")
    st.code(summary_df.to_markdown(index=False), language="markdown")
    
    st.download_button(
        label="📥 Download Results Summary (CSV)",
        data=summary_df.to_csv(index=False),
        file_name="federated_solar_forecasting_fyp_results.csv",
        mime="text/csv"
    )
