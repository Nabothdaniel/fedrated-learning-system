import copy
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import numpy as np

from src.models import SolarLSTM, get_model_weights, set_model_weights, get_model_payload_size_mb

class FederatedClient:
    def __init__(self, client_id: str, train_loader: DataLoader, test_loader: DataLoader, num_samples: int, device: str = 'cpu'):
        self.client_id = client_id
        self.train_loader = train_loader
        self.test_loader = test_loader
        self.num_samples = num_samples
        self.device = torch.device(device)
        self.local_model = SolarLSTM().to(self.device)
        self.criterion = nn.MSELoss()

    def train_local(self, global_weights: dict, local_epochs: int = 3, lr: float = 0.001) -> tuple:
        """Loads global weights, trains locally for local_epochs, returns updated weights and metrics."""
        set_model_weights(self.local_model, global_weights)
        self.local_model.train()
        
        optimizer = optim.Adam(self.local_model.parameters(), lr=lr)
        epoch_losses = []
        
        for epoch in range(local_epochs):
            batch_losses = []
            for X_batch, y_batch in self.train_loader:
                X_batch, y_batch = X_batch.to(self.device), y_batch.to(self.device)
                
                optimizer.zero_grad()
                y_pred = self.local_model(X_batch)
                loss = self.criterion(y_pred.view(-1), y_batch.view(-1))
                loss.backward()
                optimizer.step()
                
                batch_losses.append(loss.item())
            epoch_losses.append(np.mean(batch_losses))
            
        updated_weights = get_model_weights(self.local_model)
        avg_train_loss = float(np.mean(epoch_losses))
        
        return updated_weights, self.num_samples, avg_train_loss

    def evaluate(self, weights: dict = None) -> tuple:
        """Evaluates model on client local test dataset."""
        eval_model = copy.deepcopy(self.local_model)
        if weights is not None:
            set_model_weights(eval_model, weights)
        
        eval_model.eval()
        test_loss = 0.0
        y_trues, y_preds = [], []
        
        with torch.no_grad():
            for X_batch, y_batch in self.test_loader:
                X_batch, y_batch = X_batch.to(self.device), y_batch.to(self.device)
                preds = eval_model(X_batch)
                loss = self.criterion(preds.view(-1), y_batch.view(-1))
                test_loss += loss.item() * len(y_batch)
                
                y_trues.extend(y_batch.cpu().numpy())
                y_preds.extend(preds.view(-1).cpu().numpy())
                
        avg_test_loss = test_loss / len(self.test_loader.dataset)
        return avg_test_loss, np.array(y_trues), np.array(y_preds)

class FederatedServer:
    def __init__(self, input_dim: int = 5, hidden_dim: int = 64, num_layers: int = 2, output_dim: int = 1, device: str = 'cpu'):
        self.device = torch.device(device)
        self.global_model = SolarLSTM(input_dim, hidden_dim, num_layers, output_dim).to(self.device)
        self.model_size_mb = get_model_payload_size_mb(self.global_model)
        self.cum_comm_mb = 0.0

    def get_global_weights(self) -> dict:
        return get_model_weights(self.global_model)

    def federated_averaging(self, client_updates: list) -> dict:
        """
        FedAvg Aggregation algorithm:
        Weighted average of client weight parameters by local dataset sizes.
        client_updates: list of tuples (client_weights_dict, num_samples)
        """
        total_samples = sum(num_samples for _, num_samples in client_updates)
        first_weights, _ = client_updates[0]
        
        aggregated_weights = {}
        for key in first_weights.keys():
            # Weighted average across clients
            weighted_sum = sum(
                weights[key].float() * (num_samples / total_samples)
                for weights, num_samples in client_updates
            )
            aggregated_weights[key] = weighted_sum
            
        set_model_weights(self.global_model, aggregated_weights)
        
        # Track communication cost: downlink (global -> clients) + uplink (clients -> server)
        num_clients = len(client_updates)
        round_comm_mb = 2 * num_clients * self.model_size_mb
        self.cum_comm_mb += round_comm_mb
        
        return aggregated_weights, round_comm_mb
