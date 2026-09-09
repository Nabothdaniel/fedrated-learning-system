import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import numpy as np

from src.models import SolarLSTM, get_model_weights, set_model_weights

class CentralizedTrainer:
    def __init__(self, input_dim: int = 5, hidden_dim: int = 64, num_layers: int = 2, output_dim: int = 1, device: str = 'cpu'):
        self.device = torch.device(device)
        self.model = SolarLSTM(input_dim, hidden_dim, num_layers, output_dim).to(self.device)
        self.criterion = nn.MSELoss()

    def train_centralized(self, all_X_train: list, all_y_train: list, epochs: int = 15, batch_size: int = 32, lr: float = 0.001) -> list:
        """Combines all client data into one central dataset and trains the global baseline model."""
        combined_X = np.vstack(all_X_train)
        combined_y = np.concatenate(all_y_train)
        
        train_ds = TensorDataset(torch.tensor(combined_X), torch.tensor(combined_y))
        loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
        
        self.model.train()
        optimizer = optim.Adam(self.model.parameters(), lr=lr)
        history_losses = []
        
        for epoch in range(epochs):
            batch_losses = []
            for X_batch, y_batch in loader:
                X_batch, y_batch = X_batch.to(self.device), y_batch.to(self.device)
                optimizer.zero_grad()
                pred = self.model(X_batch)
                loss = self.criterion(pred.view(-1), y_batch.view(-1))
                loss.backward()
                optimizer.step()
                batch_losses.append(loss.item())
            history_losses.append(np.mean(batch_losses))
            
        return history_losses

    def evaluate(self, test_loader: DataLoader) -> tuple:
        self.model.eval()
        test_loss = 0.0
        y_trues, y_preds = [], []
        
        with torch.no_grad():
            for X_batch, y_batch in test_loader:
                X_batch, y_batch = X_batch.to(self.device), y_batch.to(self.device)
                preds = self.model(X_batch)
                loss = self.criterion(preds.view(-1), y_batch.view(-1))
                test_loss += loss.item() * len(y_batch)
                y_trues.extend(y_batch.cpu().numpy())
                y_preds.extend(preds.view(-1).cpu().numpy())
                
        avg_test_loss = test_loss / len(test_loader.dataset)
        return avg_test_loss, np.array(y_trues), np.array(y_preds)
