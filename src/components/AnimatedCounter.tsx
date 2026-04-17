import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  /** Target number to count up to */
  target: number;
  /** Label displayed below the number */
  label: string;
  /** Optional suffix after the number (default: "+") */
  suffix?: string;
  /** Animation duration in ms (default: 1500) */
  duration?: number;
}

/**
 * Animated counter that counts up from 0 to target when scrolled into view.
 * Uses IntersectionObserver for performant scroll detection.
 */
const AnimatedCounter = ({
  target,
  label,
  suffix = "+",
  duration = 1500,
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          if (prefersReducedMotion) {
            setCount(target);
            return;
          }
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer!);
              timer = null;
            } else {
              setCount(Math.round(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [target, duration]);

  return (
    <div ref={ref} className="text-center" role="figure" aria-label={`${target}${suffix} ${label}`}>
      <p className="text-3xl md:text-4xl font-heading font-bold text-gold" aria-hidden="true">
        {count}
        {suffix}
      </p>
      <p className="text-sm font-body text-muted-foreground mt-1">{label}</p>
    </div>
  );
};

export default AnimatedCounter;
