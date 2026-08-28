/**
 * /webgpu-report のカタログデータ。1行 = 1項目。
 *
 * WebGPUのfeature名・limit名・既定値は W3C WebGPU 仕様の
 * 「Limits」表と GPUFeatureName 列挙を一次情報とする（最終確認: 2026-08-28）。
 * https://www.w3.org/TR/webgpu/
 *
 * limit の default は「すべての対応環境が最低限保証する値」。
 * このサイトでは端末の実測値をこの既定値と比べて「標準の何倍か」を示す。
 */

export type WebGPUFeatureCategory =
	| "core"
	| "texture"
	| "shader"
	| "render"
	| "profiling";

export interface WebGPUFeatureEntry {
	/** GPUFeatureName（requestDevice の requiredFeatures に渡す文字列） */
	name: string;
	/** 日本語の見出し */
	title: string;
	category: WebGPUFeatureCategory;
	/** 何ができる機能かの1行説明 */
	description: string;
	/** 無いと何に困るか */
	whyNote?: string;
}

export const featureCategoryLabel: Record<WebGPUFeatureCategory, string> = {
	core: "コア",
	texture: "テクスチャ",
	shader: "シェーダー",
	render: "描画",
	profiling: "計測",
};

/** W3C WebGPU 仕様の GPUFeatureName 列挙（2026-08-28 時点で23件） */
export const webgpuFeatureCatalog: WebGPUFeatureEntry[] = [
	{
		name: "core-features-and-limits",
		title: "コア機能と標準上限",
		category: "core",
		description:
			"WebGPUのコア機能一式と、仕様が定める標準の上限値をすべて満たしているアダプターであることを示します。",
		whyNote:
			"これが無い環境は互換モード（compatibility mode）相当で、テクスチャサイズやストレージバッファ数の上限が標準より低く設定されます。同じコードでも初期化に失敗することがあります。",
	},
	{
		name: "depth-clip-control",
		title: "深度クリップの無効化",
		category: "render",
		description:
			"視錐台の手前・奥の面で図形が切り落とされる処理を止め、深度値を範囲内に丸めて描画できます。",
		whyNote:
			"影のボリューム描画やスカイボックスのように、カメラの近接面・遠方面をまたぐ図形を扱うときに欠けが出ます。",
	},
	{
		name: "depth32float-stencil8",
		title: "32bit深度 + 8bitステンシル",
		category: "render",
		description:
			"depth32float-stencil8 フォーマットのテクスチャを深度・ステンシルバッファとして使えます。",
		whyNote:
			"広い空間を扱うシーンで、遠景のZファイティング（面のちらつき）を抑えながらステンシルも併用したいときに必要です。",
	},
	{
		name: "texture-compression-bc",
		title: "BC圧縮テクスチャ",
		category: "texture",
		description:
			"BC1〜BC7（S3TC / DXT / BPTC）形式の圧縮テクスチャをGPUに直接読み込めます。",
		whyNote:
			"非対応だと展開済みの生テクスチャを送ることになり、VRAM使用量と読み込み時間が数倍に増えます。デスクトップGPUで一般的な形式です。",
	},
	{
		name: "texture-compression-bc-sliced-3d",
		title: "BC圧縮の3Dテクスチャ対応",
		category: "texture",
		description:
			"BC圧縮を3Dテクスチャのスライス単位で扱えます（ボリュームデータの圧縮保持）。",
	},
	{
		name: "texture-compression-etc2",
		title: "ETC2圧縮テクスチャ",
		category: "texture",
		description:
			"ETC2 / EAC 形式の圧縮テクスチャを読み込めます。Androidやスタンドアロン型ヘッドセットのGPUで広く使われる形式です。",
	},
	{
		name: "texture-compression-astc",
		title: "ASTC圧縮テクスチャ",
		category: "texture",
		description:
			"ASTC形式の圧縮テクスチャを読み込めます。圧縮率と画質のバランスが良く、モバイル系GPUの標準的な選択肢です。",
		whyNote:
			"WebXRのようにテクスチャ枚数が多く、フレーム時間の余裕が少ない用途では、配布サイズとVRAM削減の効き方が大きい項目です。",
	},
	{
		name: "texture-compression-astc-sliced-3d",
		title: "ASTC圧縮の3Dテクスチャ対応",
		category: "texture",
		description: "ASTC圧縮を3Dテクスチャのスライス単位で扱えます。",
	},
	{
		name: "timestamp-query",
		title: "GPUタイムスタンプ計測",
		category: "profiling",
		description:
			"レンダーパス・コンピュートパスの開始と終了のGPU時刻を取得し、処理時間を計測できます。",
		whyNote:
			"非対応だとCPU側の時間しか測れず、描画が重い原因がGPUのどのパスにあるかを切り分けられません。",
	},
	{
		name: "indirect-first-instance",
		title: "間接描画のインスタンス開始位置指定",
		category: "render",
		description:
			"GPU側のバッファから描画命令を読む間接描画で、firstInstance に0以外を指定できます。",
	},
	{
		name: "shader-f16",
		title: "16bit浮動小数点シェーダー",
		category: "shader",
		description:
			"WGSLで16bit浮動小数点（f16）型を使えます。演算量とメモリ帯域を減らせます。",
		whyNote:
			"モバイルGPUや推論処理で効果が大きく、非対応だとすべてf32で計算するためフレーム時間が伸びます。",
	},
	{
		name: "rg11b10ufloat-renderable",
		title: "rg11b10ufloat への描画",
		category: "render",
		description:
			"rg11b10ufloat フォーマットをレンダーターゲットとして使えます。HDRの中間バッファを軽量に持てます。",
	},
	{
		name: "bgra8unorm-storage",
		title: "bgra8unorm ストレージテクスチャ",
		category: "texture",
		description:
			"bgra8unorm フォーマットのテクスチャにシェーダーから直接書き込めます。",
	},
	{
		name: "float32-filterable",
		title: "32bit floatテクスチャのフィルタ",
		category: "texture",
		description:
			"32bit float テクスチャをバイリニア補間でサンプリングできます。",
		whyNote:
			"高さマップや距離場のような精度が要るデータを、シェーダー側で手動補間せずに滑らかに読めます。",
	},
	{
		name: "float32-blendable",
		title: "32bit floatターゲットのブレンド",
		category: "render",
		description:
			"32bit float のレンダーターゲットでアルファブレンドなどの合成を使えます。",
	},
	{
		name: "clip-distances",
		title: "任意平面でのクリップ",
		category: "shader",
		description:
			"WGSLから clip_distances を出力し、任意の平面で図形を切り取れます。",
		whyNote:
			"水面の反射描画や断面表示のように、シーンの一部だけを平面で切りたい場面で使います。",
	},
	{
		name: "dual-source-blending",
		title: "デュアルソースブレンド",
		category: "render",
		description:
			"1つのフラグメントから2つの色を出力し、それらを使って合成できます。",
		whyNote:
			"サブピクセル単位のテキストアンチエイリアスなど、色ごとに異なるブレンド係数が要る表現で必要になります。",
	},
	{
		name: "subgroups",
		title: "サブグループ演算",
		category: "shader",
		description:
			"同時に走るスレッドの集まり（サブグループ）の間で、共有メモリを介さず値を交換・集計できます。",
		whyNote:
			"リダクションやソート、ポストプロセスの高速化に効きます。非対応ならワークグループ共有メモリ経由の実装にフォールバックします。",
	},
	{
		name: "subgroup-size-control",
		title: "サブグループサイズの指定",
		category: "shader",
		description:
			"パイプライン作成時にサブグループのサイズを指定し、GPU間での挙動差を抑えられます。",
	},
	{
		name: "texture-formats-tier1",
		title: "追加テクスチャフォーマット Tier1",
		category: "texture",
		description:
			"標準セットに加えて、Tier1として定義された追加フォーマットの読み書きができます。",
	},
	{
		name: "texture-formats-tier2",
		title: "追加テクスチャフォーマット Tier2",
		category: "texture",
		description:
			"Tier1をさらに広げた追加フォーマット群（ストレージテクスチャ用途を含む）を使えます。",
	},
	{
		name: "primitive-index",
		title: "プリミティブインデックス参照",
		category: "shader",
		description:
			"フラグメントシェーダーから、いま描いている三角形の番号を参照できます。",
		whyNote:
			"ID書き出しによるピッキングや、頂点データを持たない可視化で使われます。",
	},
	{
		name: "texture-component-swizzle",
		title: "テクスチャ成分の並び替え",
		category: "texture",
		description:
			"テクスチャビューを作るときにRGBAの成分の並びを入れ替えられます。",
		whyNote:
			"素材ごとにチャンネル配置が違うテクスチャを、シェーダーを分けずに1本の実装で読めます。",
	},
];

export const webgpuFeatureByName = new Map(
	webgpuFeatureCatalog.map((entry) => [entry.name, entry]),
);

/** limit の性質。maximum は大きいほど良い、alignment は小さいほど良い。 */
export type WebGPULimitClass = "maximum" | "alignment";

export type WebGPULimitCategory =
	| "texture"
	| "binding"
	| "buffer"
	| "vertex"
	| "render"
	| "compute";

export interface WebGPULimitEntry {
	/** GPUSupportedLimits のプロパティ名 */
	name: string;
	title: string;
	category: WebGPULimitCategory;
	limitClass: WebGPULimitClass;
	/** 仕様が定める既定値（すべての対応環境が最低限保証する値） */
	default: number;
	/** バイト数として表示するか */
	bytes?: boolean;
	description: string;
}

export const limitCategoryLabel: Record<WebGPULimitCategory, string> = {
	texture: "テクスチャ",
	binding: "バインド",
	buffer: "バッファ",
	vertex: "頂点",
	render: "描画",
	compute: "コンピュート",
};

/** W3C WebGPU 仕様「Limits」表（2026-08-28 時点で36件） */
export const webgpuLimitCatalog: WebGPULimitEntry[] = [
	{
		name: "maxTextureDimension1D",
		title: "1Dテクスチャの最大幅",
		category: "texture",
		limitClass: "maximum",
		default: 8192,
		description: 'dimension が "1d" のテクスチャに指定できる幅の上限です。',
	},
	{
		name: "maxTextureDimension2D",
		title: "2Dテクスチャの最大辺",
		category: "texture",
		limitClass: "maximum",
		default: 8192,
		description:
			"通常の2Dテクスチャの幅と高さの上限です。レンダーターゲットの解像度もこの値に収める必要があります。",
	},
	{
		name: "maxTextureDimension3D",
		title: "3Dテクスチャの最大辺",
		category: "texture",
		limitClass: "maximum",
		default: 2048,
		description:
			"3Dテクスチャの幅・高さ・奥行きの上限です。ボリュームデータやLUTの解像度を左右します。",
	},
	{
		name: "maxTextureArrayLayers",
		title: "テクスチャ配列の最大枚数",
		category: "texture",
		limitClass: "maximum",
		default: 256,
		description:
			"2Dテクスチャ配列に積める枚数の上限です。素材をまとめて1本のバインドで扱うときの上限になります。",
	},
	{
		name: "maxBindGroups",
		title: "バインドグループの最大数",
		category: "binding",
		limitClass: "maximum",
		default: 4,
		description:
			"1つのパイプラインで同時に使えるバインドグループの数です。リソースを更新頻度ごとに分ける設計の余地を決めます。",
	},
	{
		name: "maxBindGroupsPlusVertexBuffers",
		title: "バインドグループ+頂点バッファの合計",
		category: "binding",
		limitClass: "maximum",
		default: 24,
		description:
			"バインドグループ数と頂点バッファ数の合計の上限です。両方を多用する構成で先に頭打ちになります。",
	},
	{
		name: "maxImmediateSize",
		title: "イミディエイトデータの最大バイト数",
		category: "binding",
		limitClass: "maximum",
		default: 64,
		bytes: true,
		description:
			"バッファを経由せずコマンドに直接埋め込めるデータのバイト数です。小さな定数の差し替えを軽くできます。",
	},
	{
		name: "maxBindingsPerBindGroup",
		title: "1バインドグループ内の最大バインド番号",
		category: "binding",
		limitClass: "maximum",
		default: 1000,
		description:
			"1つのバインドグループで使えるバインド番号の上限です。番号を飛ばして割り当てる設計のときに効きます。",
	},
	{
		name: "maxDynamicUniformBuffersPerPipelineLayout",
		title: "動的オフセット付きユニフォームバッファ数",
		category: "binding",
		limitClass: "maximum",
		default: 8,
		description:
			"パイプライン全体で使える、動的オフセット指定つきユニフォームバッファの数です。描画ごとに定数を切り替える手法の上限になります。",
	},
	{
		name: "maxDynamicStorageBuffersPerPipelineLayout",
		title: "動的オフセット付きストレージバッファ数",
		category: "binding",
		limitClass: "maximum",
		default: 4,
		description:
			"パイプライン全体で使える、動的オフセット指定つきストレージバッファの数です。",
	},
	{
		name: "maxSampledTexturesPerShaderStage",
		title: "シェーダーステージあたりのテクスチャ数",
		category: "binding",
		limitClass: "maximum",
		default: 16,
		description:
			"1つのシェーダーステージから同時に読めるテクスチャの数です。マテリアルの複雑さの上限に直結します。",
	},
	{
		name: "maxSamplersPerShaderStage",
		title: "シェーダーステージあたりのサンプラー数",
		category: "binding",
		limitClass: "maximum",
		default: 16,
		description:
			"1つのシェーダーステージで使えるサンプラーの数です。フィルタ設定の種類数の上限になります。",
	},
	{
		name: "maxStorageBuffersPerShaderStage",
		title: "シェーダーステージあたりのストレージバッファ数",
		category: "binding",
		limitClass: "maximum",
		default: 8,
		description:
			"1つのシェーダーステージから読み書きできるストレージバッファの数です。GPU計算の入出力の本数を決めます。",
	},
	{
		name: "maxStorageBuffersInVertexStage",
		title: "頂点シェーダーのストレージバッファ数",
		category: "binding",
		limitClass: "maximum",
		default: 8,
		description:
			"頂点シェーダーから使えるストレージバッファの数です。互換モードの環境では0になることがあります。",
	},
	{
		name: "maxStorageBuffersInFragmentStage",
		title: "フラグメントシェーダーのストレージバッファ数",
		category: "binding",
		limitClass: "maximum",
		default: 8,
		description: "フラグメントシェーダーから使えるストレージバッファの数です。",
	},
	{
		name: "maxStorageTexturesPerShaderStage",
		title: "シェーダーステージあたりのストレージテクスチャ数",
		category: "binding",
		limitClass: "maximum",
		default: 4,
		description:
			"シェーダーから直接書き込めるテクスチャの数です。ポストプロセスや画像処理の同時出力数を決めます。",
	},
	{
		name: "maxStorageTexturesInVertexStage",
		title: "頂点シェーダーのストレージテクスチャ数",
		category: "binding",
		limitClass: "maximum",
		default: 4,
		description: "頂点シェーダーから書き込めるテクスチャの数です。",
	},
	{
		name: "maxStorageTexturesInFragmentStage",
		title: "フラグメントシェーダーのストレージテクスチャ数",
		category: "binding",
		limitClass: "maximum",
		default: 4,
		description: "フラグメントシェーダーから書き込めるテクスチャの数です。",
	},
	{
		name: "maxUniformBuffersPerShaderStage",
		title: "シェーダーステージあたりのユニフォームバッファ数",
		category: "binding",
		limitClass: "maximum",
		default: 12,
		description:
			"1つのシェーダーステージで使えるユニフォームバッファの数です。",
	},
	{
		name: "maxUniformBufferBindingSize",
		title: "ユニフォームバッファの最大バインドサイズ",
		category: "buffer",
		limitClass: "maximum",
		default: 65536,
		bytes: true,
		description:
			"1回のバインドで参照できるユニフォームバッファの最大バイト数です。ボーン行列やライト配列をまとめて渡せる量を決めます。",
	},
	{
		name: "maxStorageBufferBindingSize",
		title: "ストレージバッファの最大バインドサイズ",
		category: "buffer",
		limitClass: "maximum",
		default: 134217728,
		bytes: true,
		description:
			"1回のバインドで参照できるストレージバッファの最大バイト数です。大きな点群やパーティクル配列を分割せずに扱えるかが決まります。",
	},
	{
		name: "minUniformBufferOffsetAlignment",
		title: "ユニフォームバッファのオフセット境界",
		category: "buffer",
		limitClass: "alignment",
		default: 256,
		bytes: true,
		description:
			"ユニフォームバッファの動的オフセットに要求される境界です。小さいほど詰めて配置でき、無駄なパディングが減ります。",
	},
	{
		name: "minStorageBufferOffsetAlignment",
		title: "ストレージバッファのオフセット境界",
		category: "buffer",
		limitClass: "alignment",
		default: 256,
		bytes: true,
		description:
			"ストレージバッファの動的オフセットに要求される境界です。小さいほど詰めて配置できます。",
	},
	{
		name: "maxVertexBuffers",
		title: "頂点バッファの最大数",
		category: "vertex",
		limitClass: "maximum",
		default: 8,
		description:
			"1回の描画で同時にバインドできる頂点バッファの数です。属性をバッファごとに分ける設計の上限になります。",
	},
	{
		name: "maxBufferSize",
		title: "バッファ1本の最大サイズ",
		category: "buffer",
		limitClass: "maximum",
		default: 268435456,
		bytes: true,
		description:
			"作成できるGPUバッファ1本のバイト数の上限です。大きなメッシュやボクセルデータを分割せずに置けるかが決まります。",
	},
	{
		name: "maxVertexAttributes",
		title: "頂点属性の最大数",
		category: "vertex",
		limitClass: "maximum",
		default: 16,
		description:
			"1つの頂点に持たせられる属性（位置・法線・UV・スキンウェイトなど）の数です。",
	},
	{
		name: "maxVertexBufferArrayStride",
		title: "頂点バッファのストライド上限",
		category: "vertex",
		limitClass: "maximum",
		default: 2048,
		bytes: true,
		description:
			"頂点1件あたりのバイト数の上限です。属性を1本のバッファに詰め込む構成で効いてきます。",
	},
	{
		name: "maxInterStageShaderVariables",
		title: "シェーダー間で渡せる変数の数",
		category: "render",
		limitClass: "maximum",
		default: 16,
		description:
			"頂点シェーダーからフラグメントシェーダーへ受け渡せる変数の数です。補間して渡す情報量の上限になります。",
	},
	{
		name: "maxColorAttachments",
		title: "カラーアタッチメントの最大数",
		category: "render",
		limitClass: "maximum",
		default: 8,
		description:
			"1回のレンダーパスで同時に書き込めるカラーターゲットの数です。ディファードレンダリングのGバッファ構成を左右します。",
	},
	{
		name: "maxColorAttachmentBytesPerSample",
		title: "1サンプルあたりのカラー総バイト数",
		category: "render",
		limitClass: "maximum",
		default: 32,
		bytes: true,
		description:
			"すべてのカラーアタッチメントを合わせた、1サンプルあたりのバイト数の上限です。枚数だけでなく、フォーマットの重さも合算されます。",
	},
	{
		name: "maxComputeWorkgroupStorageSize",
		title: "ワークグループ共有メモリの上限",
		category: "compute",
		limitClass: "maximum",
		default: 16384,
		bytes: true,
		description:
			"コンピュートシェーダーの1ワークグループが使える共有メモリのバイト数です。タイル単位の処理でどれだけデータを手元に置けるかが決まります。",
	},
	{
		name: "maxComputeInvocationsPerWorkgroup",
		title: "1ワークグループの最大スレッド数",
		category: "compute",
		limitClass: "maximum",
		default: 256,
		description:
			"1ワークグループ内で走らせられるスレッド数の上限です（X×Y×Zの積）。",
	},
	{
		name: "maxComputeWorkgroupSizeX",
		title: "ワークグループサイズX",
		category: "compute",
		limitClass: "maximum",
		default: 256,
		description: "ワークグループサイズのX方向の上限です。",
	},
	{
		name: "maxComputeWorkgroupSizeY",
		title: "ワークグループサイズY",
		category: "compute",
		limitClass: "maximum",
		default: 256,
		description: "ワークグループサイズのY方向の上限です。",
	},
	{
		name: "maxComputeWorkgroupSizeZ",
		title: "ワークグループサイズZ",
		category: "compute",
		limitClass: "maximum",
		default: 64,
		description: "ワークグループサイズのZ方向の上限です。",
	},
	{
		name: "maxComputeWorkgroupsPerDimension",
		title: "ディスパッチの最大ワークグループ数",
		category: "compute",
		limitClass: "maximum",
		default: 65535,
		description:
			"dispatchWorkgroups の各次元に指定できるワークグループ数の上限です。1回のディスパッチで処理できる件数の目安になります。",
	},
];

export const webgpuLimitByName = new Map(
	webgpuLimitCatalog.map((entry) => [entry.name, entry]),
);

export interface WgslLanguageFeatureEntry {
	name: string;
	title: string;
	description: string;
}

/** WGSL言語機能（navigator.gpu.wgslLanguageFeatures）の解説。未知の項目は名前のみ表示する。 */
export const wgslLanguageFeatureCatalog: WgslLanguageFeatureEntry[] = [
	{
		name: "readonly_and_readwrite_storage_textures",
		title: "ストレージテクスチャの読み取り・読み書き",
		description:
			"ストレージテクスチャを書き込み専用だけでなく、読み取り・読み書きモードでも宣言できます。画像処理を1パスにまとめやすくなります。",
	},
	{
		name: "packed_4x8_integer_dot_product",
		title: "4x8bit整数の内積命令",
		description:
			"32bitに詰めた4つの8bit整数どうしの内積を1命令で計算できます。量子化した推論処理などで効きます。",
	},
	{
		name: "unrestricted_pointer_parameters",
		title: "ポインタ引数の制限緩和",
		description:
			"関数の引数として渡せるポインタの種類が広がり、共通処理を関数に切り出しやすくなります。",
	},
	{
		name: "pointer_composite_access",
		title: "ポインタからの直接メンバーアクセス",
		description:
			"構造体や配列のポインタに対して、逆参照を書かずに要素へアクセスできます。",
	},
];

export const wgslLanguageFeatureByName = new Map(
	wgslLanguageFeatureCatalog.map((entry) => [entry.name, entry]),
);

export interface AdapterInfoField {
	key: string;
	title: string;
	description: string;
}

/** GPUAdapterInfo の各フィールドの日本語解説 */
export const adapterInfoFields: AdapterInfoField[] = [
	{
		key: "vendor",
		title: "ベンダー",
		description:
			"GPUの製造元です（nvidia / amd / intel / apple / qualcomm など）。プライバシー保護のため空欄になる環境もあります。",
	},
	{
		key: "architecture",
		title: "アーキテクチャ",
		description:
			"GPUの世代・系統です。同じ系統なら性能特性や不具合の傾向も近く、実装の分岐条件に使われます。",
	},
	{
		key: "device",
		title: "デバイス",
		description: "GPUの型番を示す識別子です。多くの環境では空欄です。",
	},
	{
		key: "description",
		title: "説明",
		description:
			"ドライバーが返すGPUの説明文です。ブラウザによって内容と粒度が異なります。",
	},
	{
		key: "subgroupMinSize",
		title: "サブグループ最小サイズ",
		description:
			"同時に走るスレッド集団（サブグループ）の最小要素数です。サブグループ演算の実装を調整するときに使います。",
	},
	{
		key: "subgroupMaxSize",
		title: "サブグループ最大サイズ",
		description: "サブグループの最大要素数です。",
	},
];
