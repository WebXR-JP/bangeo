const TOAST_VISIBLE_MS = 3000;

export class OverlayController {
	private readonly root = document.getElementById("overlay-root");
	private readonly meshStatus = document.getElementById("status-meshes");
	private readonly planeStatus = document.getElementById("status-planes");
	private readonly stateStatus = document.getElementById("status-state");
	private readonly toast = document.getElementById("toast");
	private toastTimer: number | undefined;

	activate(): void {
		this.root?.classList.add("active");
	}

	deactivate(): void {
		this.root?.classList.remove("active");
	}

	updateStatus(meshCount: number, planeCount: number, state: string): void {
		if (this.meshStatus) this.meshStatus.textContent = `Meshes: ${meshCount}`;
		if (this.planeStatus)
			this.planeStatus.textContent = `Planes: ${planeCount}`;
		if (this.stateStatus) this.stateStatus.textContent = `Status: ${state}`;
	}

	showToast(message: string): void {
		if (!this.toast) return;

		this.toast.textContent = message;
		this.toast.classList.add("visible");

		if (this.toastTimer !== undefined) {
			window.clearTimeout(this.toastTimer);
		}

		this.toastTimer = window.setTimeout(() => {
			this.toast?.classList.remove("visible");
			this.toastTimer = undefined;
		}, TOAST_VISIBLE_MS);
	}
}
