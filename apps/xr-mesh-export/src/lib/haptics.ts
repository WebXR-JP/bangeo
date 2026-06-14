type GamepadWithHaptics = Gamepad & {
	hapticActuators?: Array<{
		pulse?: (value: number, duration: number) => Promise<boolean>;
	}>;
};

export function pulseHapticFeedback(): void {
	try {
		const gamepads = navigator.getGamepads?.() ?? [];
		for (const gamepad of gamepads) {
			if (!gamepad) continue;

			const actuator = (gamepad as GamepadWithHaptics).hapticActuators?.[0];
			if (actuator?.pulse) {
				actuator.pulse(0.5, 100).catch(() => {});
				break;
			}
		}
	} catch {
		// Ignore unsupported haptics implementations.
	}
}
