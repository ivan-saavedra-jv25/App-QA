import React, { useEffect, useState } from 'react';

const CircularProgress = ({ percentage, size = 150 }) => {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const done = percentage === 100;

  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 400);
    return () => clearTimeout(t);
  }, [percentage]);

  return (
    <>
      <style>{`
      .progress-card{
        width:${size + 50}px;
        display:flex;
        flex-direction:column;
        align-items:center;
        position:relative;
        transition:.4s;
      }


      .pulse{
        animation:pulse .4s ease;
      }

      @keyframes pulse{
        0%{transform:scale(1)}
        50%{transform:scale(1.05)}
        100%{transform:scale(1)}
      }

      .ring{
        position:relative;
        width:${size}px;
        height:${size}px;
      }

      .ring svg{ transform:rotate(-90deg); }

      .ring.done svg{
        animation:coinFlip 1s cubic-bezier(.68,-0.55,.27,1.55);
      }

      @keyframes coinFlip{
        0%{transform:rotateY(0) rotate(-90deg)}
        50%{transform:rotateY(180deg) rotate(-90deg) scale(1.15)}
        100%{transform:rotateY(360deg) rotate(-90deg) scale(1)}
      }

      .center{
        position:absolute;
        inset:0;
        display:flex;
        align-items:center;
        justify-content:center;
        flex-direction:column;
        font-weight:700;
        color:var(--primary);
      }

      .percent{ font-size:1.5rem; }
      .center small{ font-size:1rem; color:var(--gray-500); }

      .check{
        font-size:3.5rem;
        color:var(--success);
        animation:pop .4s ease forwards;
      }

      @keyframes pop{
        from{transform:scale(0);opacity:0}
        to{transform:scale(1);opacity:1}
      }
      `}</style>

      <div className={`progress-card ${pulse?'pulse':''} ${done?'glow':''}`}>
        <div className={`ring ${done?'done':''}`}>
          <svg width={size} height={size}>
            <circle r={radius} cx={size/2} cy={size/2} fill="none"
              stroke="var(--gray-200)" strokeWidth={stroke} />
            <circle r={radius} cx={size/2} cy={size/2} fill="none"
              stroke="var(--primary)" strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"/>
          </svg>

          <div className="center">
            {!done ? (
              <>
                <div className="percent">{percentage}%</div>
                <small>Avance</small>
              </>
            ) : (
              <div className="check">✔</div>
            )}
          </div>
        </div>
        <div className="mt-2 fw-semibold text-muted">
          {done ? 'PLAN COMPLETADO' : 'En progreso'}
        </div>
      </div>
    </>
  );
};

export default CircularProgress;
