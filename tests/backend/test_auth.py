import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from backend.app.core import security


class FakeAuth:
    def get_user(self, token: str) -> object:
        assert token == 'valid-token'
        return type(
            'UserResponse',
            (),
            {
                'user': type(
                    'User',
                    (),
                    {'id': 'user-123', 'email': 'student@example.com'},
                )(),
            },
        )()


class FakeClient:
    auth = FakeAuth()


def test_current_user_validates_supabase_token(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        security,
        'get_supabase_admin_client',
        lambda: FakeClient(),
    )

    credentials = HTTPAuthorizationCredentials(
        scheme='Bearer',
        credentials='valid-token',
    )
    user = security.get_current_user(credentials)

    assert user.id == 'user-123'
    assert user.email == 'student@example.com'


def test_current_user_rejects_missing_token() -> None:
    with pytest.raises(HTTPException) as error:
        security.get_current_user(None)

    assert error.value.status_code == 401


def test_current_user_rejects_invalid_token(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class InvalidAuth:
        def get_user(self, token: str) -> object:
            raise ValueError('invalid token')

    monkeypatch.setattr(
        security,
        'get_supabase_admin_client',
        lambda: type('Client', (), {'auth': InvalidAuth()})(),
    )

    credentials = HTTPAuthorizationCredentials(
        scheme='Bearer',
        credentials='invalid-token',
    )
    with pytest.raises(HTTPException) as error:
        security.get_current_user(credentials)

    assert error.value.status_code == 401
