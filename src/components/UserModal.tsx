import { useEffect } from 'react'
import type { User } from '../types/user'

interface UserModalProps {
  user: User
  onClose: () => void
}

export function UserModal({ user, onClose }: UserModalProps) {
  const fullName = [user.lastName, user.firstName, user.maidenName || ''].filter(Boolean).join(' ')
  const address = user.address

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal">
        <button
          type="button"
          className="modal__close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
        <h2 id="modal-title" className="modal__title">
          Подробная информация
        </h2>
        <div className="modal__content">
          <div className="modal__avatar-wrap">
            {user.image ? (
              <img src={user.image} alt={fullName} className="modal__avatar" />
            ) : (
              <div className="modal__avatar-placeholder">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            )}
          </div>
          <dl className="modal__dl">
            <div className="modal__row">
              <dt>ФИО</dt>
              <dd>{fullName}</dd>
            </div>
            <div className="modal__row">
              <dt>Возраст</dt>
              <dd>{user.age}</dd>
            </div>
            <div className="modal__row">
              <dt>Адрес</dt>
              <dd>
                {address
                  ? [
                      address.address,
                      address.city,
                      address.state,
                      address.postalCode,
                      address.country,
                    ]
                    .filter(Boolean)
                    .join(', ') || '-'
                  : '-'}
              </dd>
            </div>
            <div className="modal__row">
              <dt>Рост</dt>
              <dd>{user.height != null ? `${user.height} см` : '-'}</dd>
            </div>
            <div className="modal__row">
              <dt>Вес</dt>
              <dd>{user.weight != null ? `${user.weight} кг` : '-'}</dd>
            </div>
            <div className="modal__row">
              <dt>Телефон</dt>
              <dd>{user.phone || '-'}</dd>
            </div>
            <div className="modal__row">
              <dt>Email</dt>
              <dd>{user.email || '-'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
