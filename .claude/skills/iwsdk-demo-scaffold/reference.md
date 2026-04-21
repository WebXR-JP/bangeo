# IWSDK / WebXR リファレンス

IWSDK（Immersive Web SDK）は `llms.txt` を公開していないため、`https://iwsdk.dev/` の公式ドキュメント（2026年4月時点）と、W3C の WebXR 仕様をまとめたリファレンス。

## IWSDK 公式URL

| 項目 | URL |
| --- | --- |
| Top | https://iwsdk.dev/ |
| AI Getting Started | https://iwsdk.dev/ai/getting-started.html |
| MCP Tools | https://iwsdk.dev/ai/mcp-tools.html |
| Workflows | https://iwsdk.dev/ai/workflows.html |
| Modes | https://iwsdk.dev/ai/modes.html |
| Project Setup | https://iwsdk.dev/guides/01-project-setup.html |
| GitHub | https://github.com/facebook/immersive-web-sdk |

> 注意: `/ai/llms-txt`、`/ai/rules`、`/ai/cursor`、`/ai/claude-code` は404（存在しない）。

## ヒアリング時に参照するBANGEO内データ

デモ依頼を受けたら、以下のファイルを Read して対応デバイス・対応ブラウザを整理する。結果は `experiments/<demo-name>.mdx` の `devices` フィールドや記事中の「対応デバイス」表にも反映する。

| ファイル | 内容 | 使い方 |
| --- | --- | --- |
| `apps/blog/src/data/devices.ts` | VR/AR デバイス一覧（Meta Quest 3、Quest 3S、Quest Pro、Pico 4／Ultra、VIVE、Samsung Galaxy XR、Android、iPhone/iPad、Apple Vision Pro など） | 各デバイスの `webxrSupport.status`（"対応"／"非対応"）と `notes` を見て、ターゲット／非対象を判断 |
| `apps/blog/src/data/webxr-status.ts` | WebXR各モジュール（Core / AR Module / Hit Test / Anchors / Layers / DOM Overlays / Gamepads / Hand Input など）の仕様ステージとブラウザ対応状況 | 使いたいモジュールの `support` 欄（chromeDesktop／chromeAndroid／quest／safari）で対応ブラウザを確定 |
| `apps/blog/src/data/platforms.ts` | 関連プラットフォーム（XRift、DeoVR） | 配信・視聴環境への言及が必要な場合のみ |
| `apps/blog/src/data/libraries.ts` | WebXR関連ライブラリ | `tags` や `frameworks` の候補として参照 |

典型的な結論:

- **VRハンドトラッキング系** → Meta Quest 2/3/3S/Pro、Pico 4 Ultra、Samsung Galaxy XR が対応、iOS Safari は非対応
- **AR Hit Test／Anchors系** → Android Chrome（ARCore）と Quest Browser が対応、Desktop Chrome／iOS Safari は未対応
- **Layers** → Quest Browser のみ（Chrome各種・Safariは未対応）
- **Depth Sensing** → Chrome Android と Quest のみ
- **iOS Safari** → WebXR自体が未対応のため基本的に常に対象外

## WebXR 仕様リンク集

spec依存のデモを作るときは、実装前に該当仕様を WebFetch で読む。APIの引数形状、イベント順序、セッション機能の `requiredFeatures` / `optionalFeatures` 指定、ブラウザ対応状況などを確認する。

| モジュール | 仕様URL | 用途 |
| --- | --- | --- |
| WebXR Device API (Core) | https://www.w3.org/TR/webxr/ | セッション取得、リファレンススペース、入力、レンダリングの基盤 |
| Hit Test | https://www.w3.org/TR/webxr-hit-test-1/ | 実世界平面との交差判定（AR配置） |
| Anchors | https://www.w3.org/TR/webxr-anchors-module/ | 実世界に固定されるアンカー |
| Depth Sensing | https://www.w3.org/TR/webxr-depth-sensing-1/ | 深度マップ取得、オクルージョン |
| Hand Input | https://www.w3.org/TR/webxr-hand-input-1/ | 25関節のハンドトラッキング |
| Lighting Estimation | https://www.w3.org/TR/webxr-lighting-estimation-1/ | 実環境のライティング推定 |
| DOM Overlays | https://www.w3.org/TR/webxr-dom-overlays-1/ | ARセッション中のHTML UIオーバーレイ |
| Layers | https://www.w3.org/TR/webxrlayers-1/ | 高品質な合成レイヤー（映像・UI用） |
| Gamepads Module | https://www.w3.org/TR/webxr-gamepads-module-1/ | コントローラーのボタン・軸マッピング |
| AR Module | https://www.w3.org/TR/webxr-ar-module/ | `immersive-ar` セッション関連 |

補助リソース:

- WebXR Samples: https://immersive-web.github.io/webxr-samples/
- Explainers（各モジュールの背景）: https://github.com/immersive-web
- Meta Quest の対応状況: https://developers.meta.com/horizon/documentation/web/webxr-overview/
- `caniuse` WebXR: https://caniuse.com/webxr

## システム要件

- Node.js 20.19.0 以上
- Chrome または Edge（WebXR 対応版）
- AIツール: Claude Code / Codex / Cursor / Copilot のいずれか

## CLI

```bash
# プロジェクト作成
npm create @iwsdk@latest

# 開発サーバー起動（Playwright 起動と .mcp.json 同期を含む）
npm run dev          # https://localhost:8081

# ランタイム状態の確認
npx iwsdk dev status

# 停止
npx iwsdk dev down
```

## vite.config.ts — IWSDK プラグインのAI設定

```typescript
import { iwsdkDev } from '@iwsdk/core/vite';

export default {
  base: './',                               // BANGEOの配信規約（相対パス固定）
  plugins: [
    iwsdkDev({
      ai: {},                               // デフォルト: Claude
      // ai: { tools: ['cursor'] },
      // ai: { tools: ['copilot'] },
      // ai: { tools: ['codex'] },
      // screenshotSize: { width: 500, height: 500 },
    }),
  ],
};
```

## MCP サーバー

`.mcp.json` は `npx iwsdk adapter sync` または `npm run dev` が自動生成する。中身は以下の形。

```json
{
  "mcpServers": {
    "iwsdk": {
      "command": "npx",
      "args": ["@iwsdk/core", "mcp", "stdio"]
    }
  }
}
```

Claude Code はプロジェクトルートの `.mcp.json` を自動検出するため、追加のセットアップは不要。

## MCP ツール（全32種）

### Session
- `xr_get_session_status` — セッションの状態を取得
- `xr_accept_session` — VR/AR セッションを受け入れる
- `xr_end_session` — セッションを終了

### Transform
- `xr_get_transform` — HMD／コントローラー／ハンドの位置・回転を取得
- `xr_set_transform` — 位置・回転を即時変更
- `xr_look_at` — 指定座標を向かせる
- `xr_animate_to` — アニメーションで移動させる

### Input / Gamepad
- ボタン、トリガー、軸、ハンドジェスチャーのシミュレーション

### Browser
- `browser_screenshot` — スクリーンショット撮影
- `browser_get_console_logs` — コンソールログ取得
- `browser_reload_page` — ページ再読み込み

### Scene
- `scene_get_hierarchy` — Three.js シーン階層を取得
- `scene_get_object_transform` — オブジェクトの transform を取得

### ECS
- `ecs_pause` / `ecs_resume` / `ecs_step` — シミュレーションの制御
- `ecs_query_entity` / `ecs_find_entities` — エンティティの検索
- `ecs_list_systems` / `ecs_list_components` — 一覧取得
- `ecs_toggle_system` — システムの有効／無効を切り替え
- `ecs_set_component` — コンポーネント値の変更
- `ecs_snapshot` / `ecs_diff` — 状態スナップショットと差分

## 動作モード

| モード | 説明 | Playwright | 開発者のブラウザ |
| --- | --- | --- | --- |
| Agent | AI が自律的に作業（デフォルト） | ヘッドレス | 別途通常ブラウザで開発 |
| Oversight | AI の作業をリアルタイムで確認 | 可視化 | Playwright を兼用 |
| Collaborate | 開発者と AI がセッションを共有 | 可視化＋DevUI | Playwright を兼用 |

## プロジェクト構造（`npm create @iwsdk@latest` の生成物）

```
my-iwsdk-app/
├── src/
│   ├── index.ts         # World.create のエントリーポイント
│   ├── systems/         # ECS システム
│   └── components/      # ECS コンポーネント
├── ui/
│   └── *.uikitml        # 空間UIのマークアップ
├── public/
│   ├── audio/
│   ├── gltf/            # .gltf / .glb
│   └── textures/
├── vite.config.ts
├── index.html
├── package.json
├── tsconfig.json
├── CLAUDE.md            # Claude Code 用コンテキスト
├── AGENTS.md            # AI 汎用コンテキスト
└── .mcp.json            # 自動生成
```

## 主要 API

### World.create

```typescript
import { World, SessionMode, AssetManager } from '@iwsdk/core';

World.create(document.getElementById('scene-container'), {
  assets: {
    environmentDesk: { url: 'gltf/desk.glb', type: 'gltf' },   // 相対パスで書く
  },
  xr: {
    sessionMode: SessionMode.ImmersiveVR,
    features: { handTracking: true, layers: true },
  },
  features: {
    locomotion: { useWorker: true },
    grabbing: true,
  },
}).then((world) => {
  const { scene: envMesh } = AssetManager.getGLTF('environmentDesk');
  world.createTransformEntity(envMesh);
});
```

### ECS パターン

```typescript
import { createComponent, createSystem, Types } from '@iwsdk/core';

const Spinner = createComponent('Spinner', {
  speed: { type: Types.Float32, default: 1.0 },
});

class SpinSystem extends createSystem({
  spinners: { required: [Spinner, Transform] },
}) {
  update(delta) {
    for (const entity of this.queries.spinners.entities) {
      const speed = entity.getValue(Spinner, 'speed');
      entity.object3D.rotateY(speed * delta);
    }
  }
}
```

## 技術スタック

| レイヤー | 採用技術 |
| --- | --- |
| レンダリング | Three.js |
| ECS | ELICS（カラム型配列で高速） |
| 物理 | Havok（WASM） |
| ビルド | Vite |
| XRエミュレーション | IWER |
| 空間UI | UIKitML |
| 開発支援 | Playwright ＋ MCP |

## AI への推奨システムプロンプト（IWSDK 公式推奨）

> "Before any action, call `xr_get_session_status`. Navigate scenes with `scene_get_hierarchy`, verify changes via screenshots, debug with ECS tools, and monitor console logs for errors."

## 初回確認に使う推奨プロンプト

- "Take a screenshot of the current scene."
- "Accept the XR session so we can see the immersive experience."
- "Position the right controller at (0.3, 1.2, -0.5) and take a screenshot."

## 補助 MCP（任意）

- `@felixtz/iwsdk-rag-mcp` — IWSDK コードベースのセマンティック検索（3,000チャンク以上）
- `@meta-quest/hzdb` — Quest デバイス管理
