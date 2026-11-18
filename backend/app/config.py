from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: str = "http://localhost:5173"

    # used only by app/seed_admin.py
    admin_name: str = "HR Admin"
    admin_email: str = "admin@company.com"
    admin_password: str = "ChangeMe123!"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
