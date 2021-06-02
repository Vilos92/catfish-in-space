/**
 * Fundamental PID configuration parameters.
 */
interface PidConfig {
  kp: number;
  ki: number;
  kd: number;
  dt: number;
}

/**
 * State of a PID controller at a single moment.
 */
export interface PidState {
  integral: number;
  error: number;
  output: number;
}

type ComputeNextPidState = (pidState: PidState, error: number) => PidState;

/**
 * Create a pre-configured function which computes a PID state given
 * the previous PID state and the current error.
 */
export function createComputeNextPidState(pidConfig: PidConfig): ComputeNextPidState {
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
