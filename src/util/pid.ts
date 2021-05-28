interface PidConfig {
  kp: number;
  ki: number;
  kd: number;
  dt: number;
}

export interface PidState {
  integral: number;
  error: number;
  output: number;
}

export function createComputeNextPidState(pidConfig: PidConfig): (pidState: PidState, error: number) => PidState {
  const {kp, ki, kd, dt} = pidConfig;

  return (pidState: PidState, error: number): PidState => {
    const {integral: previousIntegral, error: previousError} = pidState;

    const integral = previousIntegral + error * dt;
    const derivative = (error - previousError) / dt;
    const output = kp * error + ki * integral + kd * derivative;

    return {
      integral,
      error,
      output
    };
  };
}
