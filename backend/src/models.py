import copy
import torch
import torch.nn as nn

class SolarLSTM(nn.Module):
    def __init__(self, input_dim: int = 5, hidden_dim: int = 64, num_layers: int = 2, output_dim: int = 1, dropout: float = 0.2):
        super(SolarLSTM, self).__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0
        )
        
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(32, output_dim)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (batch_size, seq_len, input_dim)
        lstm_out, _ = self.lstm(x)
        # Use last timestep hidden state output
        last_out = lstm_out[:, -1, :]
        out = self.fc(last_out)
        return out

def get_model_weights(model: nn.Module) -> dict:
    """Returns a deepcopy state dict of model parameters."""
    return copy.deepcopy(model.state_dict())

def set_model_weights(model: nn.Module, weights: dict):
    """Loads weights state dict into model."""
    model.load_state_dict(copy.deepcopy(weights))

def count_parameters(model: nn.Module) -> int:
    """Counts total trainable parameters in the model."""
    return sum(p.numel() for p in model.parameters() if p.requires_grad)

def get_model_payload_size_mb(model: nn.Module) -> float:
    """Calculates model size in Megabytes for communication bandwidth evaluation."""
    param_size = 0
    for param in model.parameters():
        param_size += param.nelement() * param.element_size()
    buffer_size = 0
    for buffer in model.buffers():
        buffer_size += buffer.nelement() * buffer.element_size()
    size_all_mb = (param_size + buffer_size) / (1024 ** 2)
    return size_all_mb
