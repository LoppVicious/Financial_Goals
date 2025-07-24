// frontend/src/components/GoalCard.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function GoalCard({
  icon,
  title,
  progressPercent,
  statusText,
  statusColor,
  onViewDetail
}) {
  // Elegimos color de relleno
  const fillColor =
    progressPercent >= 80
      ? 'var(--green)'
      : progressPercent >= 50
      ? 'var(--orange)'
      : 'var(--red)';

  return (
    <div
      className="card"
      style={{
        background: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Icono + Contenido */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Icono */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </div>

        {/* Título, barra y texto */}
        <div style={{ flex: 1 }}>
          {/* Título */}
          <h3
            style={{
              margin: 0,
              marginBottom: '0.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)'
            }}
          >
            {title}
          </h3>

          {/* Barra de progreso */}
          <div
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '999px',
              height: '12px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: fillColor,
                transition: 'width 300ms ease'
              }}
            />
          </div>

          {/* Estado y porcentaje */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.5rem'
            }}
          >
            <small
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color:
                  statusColor === 'green'
                    ? 'var(--green)'
                    : statusColor === 'orange'
                    ? 'var(--orange)'
                    : 'var(--red)'
              }}
            >
              {statusText}
            </small>
            <small
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap'
              }}
            >
              {progressPercent}%
            </small>
          </div>
        </div>
      </div>

      {/* Botón Ver detalle */}
      <button
        onClick={onViewDetail}
        style={{
          width: '100%',
          marginTop: '1rem',
          padding: '0.75rem',
          border: 'none',
          borderRadius: '1.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          background: 'var(--bg-input)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'filter 150ms ease'
        }}
        onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.9)')}
        onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
      >
        Ver detalle
      </button>
    </div>
  );
}

GoalCard.propTypes = {
  icon: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  progressPercent: PropTypes.number.isRequired,
  statusText: PropTypes.string.isRequired,
  statusColor: PropTypes.oneOf(['green', 'orange', 'red']).isRequired,
  onViewDetail: PropTypes.func.isRequired
};
