# backend/src/email_otp/ports/email_service_port.py
from abc import ABC, abstractmethod

class EmailServicePort(ABC):
    @abstractmethod
    def send_otp_email(self, to_email: str, otp_code: str) -> bool:
        """Envía un código OTP por email"""
        pass