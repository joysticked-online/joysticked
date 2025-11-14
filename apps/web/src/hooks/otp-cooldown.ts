import { useEffect, useState } from 'react';

const OTP_RESEND_COOLDOWN = 45;

export function useOtpCooldown() {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((value) => {
        if (value <= 1) {
          clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const startCooldown = () => setCooldown(OTP_RESEND_COOLDOWN);
  const isActive = cooldown > 0;

  return { cooldown, startCooldown, isActive };
}

