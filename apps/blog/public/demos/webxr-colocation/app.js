import Peer from "https://esm.sh/peerjs@1.5.2?bundle";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ARButton } from "three/addons/webxr/ARButton.js";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";

const hudSpace = document.getElementById("space-id");
const hudPeer = document.getElementById("peer-id");
const hudPeers = document.getElementById("peer-count");
const hudRoom = document.getElementById("room-id");
const hudMode = document.getElementById("mode");
const hudStatus = document.getElementById("status");
const shareLinkInput = document.getElementById("share-link");
const copyLinkButton = document.getElementById("copy-link");
const roomInput = document.getElementById("room-input");
const applyRoomButton = document.getElementById("apply-room");
const newRoomButton = document.getElementById("new-room");
const resetRoomButton = document.getElementById("reset-room");
const scoreboardList = document.getElementById("scoreboard-list");

let renderer;
let scene;
let camera;
let sharedSpace = null;
let viewerSpace = null;
const sharedSpaceId = null;
let roomId = null;
let modeLabel = "共有空間";
let peer = null;
let peerId = null;
const peerConnections = new Map();
const peers = new Map();
let lastSent = 0;
let scorePoll = 0;
let spaceRequested = false;
let framecount = 0;

const clock = new THREE.Clock();
const _raycaster = new THREE.Raycaster();
const _tempMatrix = new THREE.Matrix4();
const gltfLoader = new GLTFLoader();

// 弾丸システム
const bullets = new THREE.Group();
const mixers = [];
const bulletGeometry = new THREE.SphereGeometry(0.015, 32, 16);
const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const positionKF = new THREE.VectorKeyframeTrack(
	".position",
	[0, 1],
	[0, 0, 0, 0, 0, -3],
);
const bulletClip = new THREE.AnimationClip("Action", 1.01, [positionKF]);

// プレイヤー表示用
const viewerGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.1);
const viewerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

// コントローラー
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let leftControllerModel, rightControllerModel;

let _scores = {};

init();

function init() {
	scene = new THREE.Scene();
	// ARモードでは背景を透明にする（カメラ映像が見えるように）
	// scene.background = null;
	scene.add(bullets);

	camera = new THREE.PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.1,
		50,
	);

	const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
	light.position.set(0.5, 1, 0.25);
	scene.add(light);

	// ARモード用にalphaを有効化
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.xr.enabled = true;
	renderer.autoClear = false;
	document.body.appendChild(renderer.domElement);

	// ARセッション設定（公式デモと同様）
	const sessionInit = {
		requiredFeatures: ["local-floor"],
		optionalFeatures: ["shared", "unbounded"],
	};
	document.body.appendChild(ARButton.createButton(renderer, sessionInit));

	initRoomFromUrl();
	setupPeer();
	setupControllers();

	// コントローラーモデルを事前ロード
	gltfLoader.load(
		"https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles/meta-quest-touch-plus/left.glb",
		(asset) => {
			leftControllerModel = asset;
		},
	);
	gltfLoader.load(
		"https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles/meta-quest-touch-plus/right.glb",
		(asset) => {
			rightControllerModel = asset;
		},
	);

	renderer.setAnimationLoop(render);
	window.addEventListener("resize", onWindowResize);
}

function initRoomFromUrl() {
	const url = new URL(window.location.href);
	const rawRoom = url.searchParams.get("room");
	const normalized = normalizeRoomId(rawRoom);

	if (normalized) {
		setRoomId(normalized, "シェアリンク");
	} else {
		modeLabel = "共有空間";
		hudRoom.textContent = "共有空間待ち";
	}

	copyLinkButton.addEventListener("click", () => {
		if (!shareLinkInput.value) return;
		navigator.clipboard
			.writeText(shareLinkInput.value)
			.then(() => {
				copyLinkButton.textContent = "コピー済み";
				setTimeout(() => {
					copyLinkButton.textContent = "コピー";
				}, 1200);
			})
			.catch(() => {});
	});

	applyRoomButton.addEventListener("click", () => {
		const nextRoom = normalizeRoomId(roomInput.value);
		if (!nextRoom) return;
		setRoomId(nextRoom, "シェアリンク");
		roomInput.value = "";
	});

	newRoomButton.addEventListener("click", () => {
		const nextRoom = `room-${Math.random().toString(36).slice(2, 8)}`;
		setRoomId(nextRoom, "シェアリンク");
		roomInput.value = "";
	});

	resetRoomButton.addEventListener("click", () => {
		const url = new URL(window.location.href);
		url.searchParams.delete("room");
		window.history.replaceState({}, "", url.toString());

		if (sharedSpaceId) {
			setRoomId(sharedSpaceId, "共有空間");
			return;
		}

		roomId = null;
		modeLabel = "共有空間";
		updateRoomDisplay();
		hudStatus.textContent = "共有空間待ち";
		shareLinkInput.value = "";
	});
}

function normalizeRoomId(value) {
	if (!value || typeof value !== "string") return null;
	const cleaned = value.trim().replace(/[^a-zA-Z0-9_-]/g, "");
	return cleaned.slice(0, 64) || null;
}

function updateRoomDisplay() {
	hudMode.textContent = modeLabel;
	hudRoom.textContent = roomId ?? "-";
}

function updateShareLink() {
	if (!roomId) return;
	const url = new URL(window.location.href);
	url.searchParams.set("room", roomId);
	shareLinkInput.value = url.toString();
}

function setRoomId(nextRoom, nextMode) {
	roomId = nextRoom;
	modeLabel = nextMode;
	updateRoomDisplay();
	updateShareLink();
	updateStatus();

	const url = new URL(window.location.href);
	url.searchParams.set("room", roomId);
	window.history.replaceState({}, "", url.toString());
}

function setupPeer() {
	peer = new Peer();
	peer.on("open", (id) => {
		peerId = id;
		hudPeer.textContent = id;
		console.log("[Peer] Connected with ID:", id);
	});
	peer.on("connection", (conn) => {
		registerConnection(conn);
	});
	peer.on("error", (err) => {
		console.error("[Peer] Error:", err);
	});
	peer.on("disconnected", () => {
		console.log("[Peer] Disconnected, attempting to reconnect...");
		setTimeout(() => {
			if (peer && !peer.destroyed) {
				peer.reconnect();
			}
		}, 5000);
	});
}

function setupControllers() {
	function onSelectStart() {
		// 弾丸を発射
		const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
		const bulletWrap = new THREE.Group();
		bullets.add(bulletWrap);
		bulletWrap.add(bullet);

		bulletWrap.position.copy(this.position);
		bulletWrap.quaternion.copy(this.quaternion);

		const mixer = new THREE.AnimationMixer(bullet);
		const clipAction = mixer.clipAction(bulletClip);
		clipAction.setLoop(THREE.LoopOnce);
		clipAction.clampWhenFinished = true;
		clipAction.play();
		mixers.push(mixer);

		console.log("[Controller] Bullet fired!");
	}

	controller1 = renderer.xr.getController(0);
	controller1.addEventListener("selectstart", onSelectStart);
	controller1.addEventListener("connected", function (event) {
		this.add(buildController(event.data));
	});
	controller1.addEventListener("disconnected", function () {
		this.remove(this.children[0]);
	});
	scene.add(controller1);

	controller2 = renderer.xr.getController(1);
	controller2.addEventListener("selectstart", onSelectStart);
	controller2.addEventListener("connected", function (event) {
		this.add(buildController(event.data));
	});
	controller2.addEventListener("disconnected", function () {
		this.remove(this.children[0]);
	});
	scene.add(controller2);

	const controllerModelFactory = new XRControllerModelFactory();

	controllerGrip1 = renderer.xr.getControllerGrip(0);
	controllerGrip1.add(
		controllerModelFactory.createControllerModel(controllerGrip1),
	);
	scene.add(controllerGrip1);

	controllerGrip2 = renderer.xr.getControllerGrip(1);
	controllerGrip2.add(
		controllerModelFactory.createControllerModel(controllerGrip2),
	);
	scene.add(controllerGrip2);
}

function buildController(data) {
	let geometry, material;
	switch (data.targetRayMode) {
		case "tracked-pointer":
			geometry = new THREE.BufferGeometry();
			geometry.setAttribute(
				"position",
				new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3),
			);
			geometry.setAttribute(
				"color",
				new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3),
			);
			material = new THREE.LineBasicMaterial({
				vertexColors: true,
				blending: THREE.AdditiveBlending,
			});
			return new THREE.Line(geometry, material);
		case "gaze":
			geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, -1);
			material = new THREE.MeshBasicMaterial({
				opacity: 0.5,
				transparent: true,
			});
			return new THREE.Mesh(geometry, material);
	}
}

function render() {
	const delta = clock.getDelta();
	const session = renderer.xr.getSession();

	// 弾丸のアニメーション更新
	let i = mixers.length;
	while (i--) {
		const mixer = mixers[i];
		if (mixer.time >= 1) {
			const root = mixer.getRoot();
			if (root.parent) {
				root.parent.removeFromParent();
			}
			mixers.splice(i, 1);
		} else {
			mixer.update(delta);
		}
	}

	if (session) {
		// 共有空間をリクエスト（初回のみ）
		if (!spaceRequested) {
			spaceRequested = true;
			requestSharedSpace(session);
		}

		// ヒット検出
		detectHits();

		// ポーズの送受信（5フレームごと）
		if (sharedSpace && framecount++ % 5 === 0) {
			sendPoseWithBullets(session);
		}
	}

	if (roomId && peerId) {
		pollPeers();
		updateScoreboard();
	}

	renderer.render(scene, camera);
}

// UUID取得ヘルパー関数
function getSharedSpaceUUID(space) {
	// 公式デモでは UUId（大文字I）を使用
	// 複数のプロパティ名をチェック
	return space?.UUId || space?.uuid || space?.UUID || null;
}

function requestSharedSpace(session) {
	// まずviewerスペースを取得
	session.requestReferenceSpace("viewer").then((space) => {
		viewerSpace = space;
		console.log("[SharedSpaces] Viewer space acquired");
	});

	session
		.requestReferenceSpace("shared")
		.then((space) => {
			sharedSpace = space;

			// 初期UUIDは一時的な可能性があるため、表示だけ更新
			const initialUUID = getSharedSpaceUUID(space);
			hudSpace.textContent = initialUUID
				? `確立中... (${initialUUID.slice(0, 8)}...)`
				: "確立中...";

			console.log("[SharedSpaces] Initial space acquired, UUID:", initialUUID);

			if (sharedSpace) {
				renderer.xr.setReferenceSpace(sharedSpace);
			}

			// updateSpaceを開始（公式デモと同様）
			updateSpace();

			// resetイベントで座標系が更新される
			sharedSpace.addEventListener("reset", () => {
				console.log("[SharedSpaces] Reset event received");
				const uuid = getSharedSpaceUUID(sharedSpace);
				hudSpace.textContent = uuid
					? `${uuid.slice(0, 8)}... (確定)`
					: "unknown";

				if (!roomId && uuid) {
					setRoomId(uuid, "共有空間");
				}
			});
		})
		.catch((err) => {
			console.warn("[SharedSpaces] Failed to request shared space:", err);
			hudSpace.textContent = "shared未対応";
			if (!roomId) {
				const fallbackRoom = `room-${Math.random().toString(36).slice(2, 8)}`;
				setRoomId(fallbackRoom, "シェアリンク");
			}
		});
}

// 公式デモと同様のupdateSpace関数
function updateSpace() {
	if (!sharedSpace) return;

	const uuid = getSharedSpaceUUID(sharedSpace);
	if (uuid && uuid.length !== 0) {
		// roomIdが設定されていなければ共有空間UUIDを使用
		if (!roomId) {
			setRoomId(uuid, "共有空間");
		}
		hudSpace.textContent = `${uuid.slice(0, 8)}...`;
	}

	setTimeout(updateSpace, 1000);
}

function detectHits() {
	// プレイヤーのバウンディングボックスを計算
	const playerboxes = {};
	for (const [key, data] of peers.entries()) {
		if (data.object) {
			playerboxes[key] = new THREE.Box3().setFromObject(data.object);
		}
	}

	// 弾丸とプレイヤーの衝突判定
	let i = mixers.length;
	while (i--) {
		const mixer = mixers[i];
		const bullet = mixer.getRoot();
		if (!bullet.parent) continue;

		const bulletBox = new THREE.Box3().setFromObject(bullet.parent);
		for (const [playerID, playerbox] of Object.entries(playerboxes)) {
			if (bulletBox.intersectsBox(playerbox)) {
				mixer.stopAllAction();
				bullet.parent.removeFromParent();
				mixers.splice(i, 1);
				sendScore(peerId, playerID);
				break;
			}
		}
	}
}

function sendScore(attacker, victim) {
	console.log("[Score] Hit:", attacker, "->", victim);
	fetch("/api/score", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			spaceID: roomId,
			attacker: attacker,
			victim: victim,
		}),
	}).catch(() => {});
}

function pollPeers() {
	if (!roomId) return;
	if (performance.now() - lastSent < 1000) return;
	lastSent = performance.now();

	fetch("/api/peers", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ spaceID: roomId, peerID: peerId }),
	})
		.then((res) => res.json())
		.then((data) => {
			const list = data.peers || [];
			hudPeers.textContent = String(list.length);
			updateStatus();
			list.forEach((id) => {
				connectToPeer(id);
			});

			// スコア情報も更新
			if (data.scores) {
				_scores = data.scores;
			}
		})
		.catch(() => {});
}

function connectToPeer(id) {
	if (id === peerId || peerConnections.has(id) || !peer) return;
	const conn = peer.connect(id, { reliable: false });
	registerConnection(conn);
}

function registerConnection(conn) {
	console.log("[Peer] New connection from:", conn.peer);
	peerConnections.set(conn.peer, conn);
	conn.on("open", () => {
		console.log("[Peer] Connection open:", conn.peer);
	});
	conn.on("data", (payload) => {
		handlePeerData(conn.peer, payload);
	});
	conn.on("close", () => {
		console.log("[Peer] Connection closed:", conn.peer);
		removePeer(conn.peer);
	});
	conn.on("error", (err) => {
		console.error("[Peer] Connection error:", err);
	});
	updateStatus();
}

function handlePeerData(peerId, data) {
	let entry = peers.get(peerId);
	if (!entry) {
		// プレイヤーラッパーを作成
		const playerWrap = new THREE.Group();
		const player = new THREE.Group();
		const bulletGroup = new THREE.Group();
		const playerBox = new THREE.Mesh(viewerGeometry, viewerMaterial);

		playerWrap.name = peerId;
		scene.add(playerWrap);
		playerWrap.add(player);
		player.add(playerBox);
		playerWrap.add(bulletGroup);

		entry = { object: player, wrap: playerWrap, bulletGroup };
		peers.set(peerId, entry);
	}

	// プレイヤー位置更新
	if (data.position) {
		entry.object.position.set(
			data.position.x,
			data.position.y,
			data.position.z,
		);
	}
	if (data.orientation) {
		entry.object.quaternion.set(
			data.orientation.x,
			data.orientation.y,
			data.orientation.z,
			data.orientation.w,
		);
	}

	// コントローラー更新
	if (data.left) {
		let controller = entry.object.getObjectByName("left");
		if (!controller && leftControllerModel) {
			controller = leftControllerModel.scene.clone();
			controller.name = "left";
			entry.object.add(controller);
		}
		if (controller) {
			controller.position.set(
				data.left.position.x,
				data.left.position.y,
				data.left.position.z,
			);
			controller.quaternion.set(
				data.left.orientation.x,
				data.left.orientation.y,
				data.left.orientation.z,
				data.left.orientation.w,
			);
		}
	}

	if (data.right) {
		let controller = entry.object.getObjectByName("right");
		if (!controller && rightControllerModel) {
			controller = rightControllerModel.scene.clone();
			controller.name = "right";
			entry.object.add(controller);
		}
		if (controller) {
			controller.position.set(
				data.right.position.x,
				data.right.position.y,
				data.right.position.z,
			);
			controller.quaternion.set(
				data.right.orientation.x,
				data.right.orientation.y,
				data.right.orientation.z,
				data.right.orientation.w,
			);
		}
	}

	// 相手の弾丸を表示
	if (data.bullets && entry.bulletGroup) {
		while (entry.bulletGroup.children.length < data.bullets.length) {
			entry.bulletGroup.add(
				new THREE.Mesh(bulletGeometry, bulletMaterial.clone()),
			);
		}
		while (entry.bulletGroup.children.length > data.bullets.length) {
			entry.bulletGroup.remove(entry.bulletGroup.children[0]);
		}
		for (let i = 0; i < data.bullets.length; i++) {
			entry.bulletGroup.children[i].position.set(
				data.bullets[i].x,
				data.bullets[i].y,
				data.bullets[i].z,
			);
		}
	}
}

function removePeer(id) {
	const entry = peers.get(id);
	if (entry?.wrap) {
		scene.remove(entry.wrap);
	}
	peers.delete(id);
	peerConnections.delete(id);
	updateStatus();
}

function sendPoseWithBullets(session) {
	if (!peerConnections.size || !viewerSpace || !sharedSpace) return;

	const frame = renderer.xr.getFrame();
	if (!frame) return;

	const viewerPose = frame.getPose(viewerSpace, sharedSpace);
	if (!viewerPose) return;

	const info = {
		peer: peerId,
		position: viewerPose.transform.position,
		orientation: viewerPose.transform.orientation,
	};

	// コントローラーのポーズを追加
	for (let i = 0; i < session.inputSources.length; i++) {
		const input = session.inputSources[i];
		if (input.gripSpace) {
			const pose = frame.getPose(input.gripSpace, viewerSpace);
			if (pose) {
				info[input.handedness] = {
					position: pose.transform.position,
					orientation: pose.transform.orientation,
				};
			}
		}
	}

	// 弾丸の位置を追加
	const bulletPositions = [];
	const target = new THREE.Vector3();
	for (let i = 0; i < bullets.children.length; i++) {
		if (bullets.children[i].children[0]) {
			bullets.children[i].children[0].getWorldPosition(target);
			bulletPositions.push({ x: target.x, y: target.y, z: target.z });
		}
	}
	info.bullets = bulletPositions;

	// 全ピアに送信
	peerConnections.forEach((conn) => {
		if (conn.open) {
			conn.send(info);
		}
	});
}

function updateScoreboard() {
	if (!roomId) return;
	if (performance.now() - scorePoll < 2000) return;
	scorePoll = performance.now();

	fetch(`/api/scoreboard?spaceID=${encodeURIComponent(roomId)}`)
		.then((res) => res.json())
		.then((data) => {
			const scores = data.scores || {};
			scoreboardList.innerHTML = "";
			Object.entries(scores).forEach(([id, entry]) => {
				const li = document.createElement("li");
				li.textContent = `${id.slice(0, 8)}...: ${entry.score || 0}`;
				scoreboardList.appendChild(li);
			});
		})
		.catch(() => {});
}

function updateStatus() {
	if (peerConnections.size > 0) {
		hudStatus.textContent = `接続中 (${peerConnections.size})`;
	} else {
		hudStatus.textContent = "待機中";
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
