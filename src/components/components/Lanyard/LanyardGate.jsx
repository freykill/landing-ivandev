// Gate del Lanyard: solo importa three.js + física en desktop (>= lg).
// El import dinámico hace que Vite separe el chunk pesado — en móvil no se descarga.
import { lazy, Suspense, useEffect, useState } from 'react';

const Lanyard = lazy(() => import('./Lanyard.jsx'));

export default function LanyardGate(props) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // 1024 = breakpoint lg de Tailwind, mismo corte que el wrapper en Hero.astro
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (!enabled) return null;

  return (
    <Suspense fallback={null}>
      <Lanyard {...props} />
    </Suspense>
  );
}
