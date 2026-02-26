"""Custom exception classes for the LIMS application."""

class LIMSException(Exception):
    """Base exception for all LIMS related errors."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class EntityNotFoundException(LIMSException):
    """Raised when an entity is not found in the database."""
    def __init__(self, entity_name: str, entity_id: any):
        super().__init__(f"{entity_name} with ID {entity_id} not found.", status_code=404)

class InsufficientStockException(LIMSException):
    """Raised when there is not enough stock for an operation."""
    def __init__(self, item_name: str):
        super().__init__(f"No hay suficiente stock disponible para: {item_name}.", status_code=400)

class BusinessRuleViolationException(LIMSException):
    """Raised when a business rule is violated."""
    def __init__(self, message: str):
        super().__init__(message, status_code=422)

class AuthenticationException(LIMSException):
    """Raised when authentication fails."""
    def __init__(self, message: str = "Credenciales inválidas"):
        super().__init__(message, status_code=401)
