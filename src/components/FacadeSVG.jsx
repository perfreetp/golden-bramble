// 立面 SVG 画布：mm 坐标直接作为 SVG 用户单位，d3-zoom 负责平移缩放
import { For, Show, createMemo, onMount, onCleanup, createSignal } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import { COLOR_GRADES, ZONES } from '../domain/constants.js';
import { generateMotifWithPalette } from '../domain/motif.js';

const TAU = Math.PI * 2;

function paletteOf(piece, orderGrade) {
  const grade = piece.colorGrade ?? orderGrade;
  return COLOR_GRADES[grade] ?? COLOR_GRADES[1];
}

// 分区底色角色
const ZONE_FILL = {
  dougong: 'main', frame: 'secondary', fangxin: 'main',
  chajiao: 'secondary', qunban: 'ground', trim: 'ground',
};

// 单个构件（独立组件，纹样随种子/参数/设色记忆化，保证重渲染确定性）
function PieceGlyph(props) {
  const palette = createMemo(() => paletteOf(props.piece, props.orderGrade));
  const motifEls = createMemo(() => {
    const p = props.piece;
    return generateMotifWithPalette(p.motifKey, p.seed, p.w, p.h, p.motifParams ?? {}, palette());
  });
  const clipId = () => `clip-${props.piece.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <g
      class={`piece ${props.selected ? 'selected' : ''} ${props.piece.locked ? 'locked' : ''}`}
      transform={`translate(${props.piece.x},${props.piece.y})`}
      onClick={(e) => { e.stopPropagation(); props.onSelect(props.piece.id); }}
    >
      <Show when={props.piece.shape === 'triangle'}>
        <clipPath id={clipId()}>
          <polygon points={trianglePoints(props.piece)} />
        </clipPath>
      </Show>
      <g clip-path={props.piece.shape === 'triangle' ? `url(#${clipId()})` : undefined}>
        <Show
          when={props.piece.shape === 'triangle'}
          fallback={
            <rect
              class="piece-body"
              width={props.piece.w}
              height={props.piece.h}
              rx={4}
              fill={palette()[ZONE_FILL[props.piece.zoneKey] ?? 'main']}
            />
          }
        >
          <polygon
            class="piece-body"
            points={trianglePoints(props.piece)}
            fill={palette()[ZONE_FILL[props.piece.zoneKey] ?? 'secondary']}
          />
        </Show>
        <For each={motifEls()}>{(el) => <Dynamic component={el.tag} {...el.attrs} />}</For>
      </g>
      <Show when={props.piece.isTrim}>
        <text class="piece-code" x={props.piece.w / 2} y={props.piece.h / 2 + 4} text-anchor="middle">
          {props.piece.code}
        </text>
      </Show>
      <Show when={props.piece.locked}>
        <g transform={`translate(${Math.min(26, props.piece.w - 20)},22)`}>
          <rect x={-14} y={-14} width={28} height={22} rx={4} fill="rgba(92,68,119,.92)" />
          <path d="M-7,-2 V-8 a7,7 0 0,1 14,0 V-2 M-9,-2 H9 V8 H-9 Z" fill="none" stroke="#fff" stroke-width={2.2} />
        </g>
      </Show>
      <Show when={props.piece.manual && !props.piece.locked}>
        <circle cx={Math.min(20, props.piece.w - 14)} cy={18} r={7} fill="#b03a2e" stroke="#fff" stroke-width={1.5} />
      </Show>
      <Show when={props.piece.orphan}>
        <text class="piece-code" x={props.piece.w / 2} y={18} text-anchor="middle" fill="#5c4477">原位保留</text>
      </Show>
    </g>
  );
}

function trianglePoints(p) {
  return {
    tl: `0,0 ${p.w},0 0,${p.h}`,
    tr: `0,0 ${p.w},0 ${p.w},${p.h}`,
    br: `${p.w},0 ${p.w},${p.h} 0,${p.h}`,
    bl: `0,0 ${p.w},${p.h} 0,${p.h}`,
  }[p.corner] || `0,0 ${p.w},0 0,${p.h}`;
}

export default function FacadeSVG(props) {
  let svgEl;
  const [tf, setTf] = createSignal({ k: 1, x: 0, y: 0 });
  const meta = () => props.facade.meta;
  const W = () => meta().width;
  const H = () => meta().height;

  const zoomBehavior = zoom()
    .scaleExtent([0.3, 6])
    .on('zoom', (event) => setTf(event.transform));

  onMount(() => {
    select(svgEl).call(zoomBehavior);
  });
  onCleanup(() => {
    if (svgEl) select(svgEl).on('.zoom', null);
  });

  const zoomBy = (factor) => select(svgEl).call(zoomBehavior.scaleBy, factor);
  const reset = () => select(svgEl).call(zoomBehavior.transform, zoomIdentity);

  const zoneLabelPos = (zone) => {
    const r = zone.rects[0];
    if (!r) return null;
    return { x: r.x + 10, y: r.y + 24 };
  };

  const bayLines = createMemo(() => {
    const m = meta();
    const innerX = 150;
    const innerW = m.width - 300;
    const lines = [];
    for (let i = 1; i < m.bays; i++) {
      lines.push(innerX + (innerW / m.bays) * i);
    }
    return lines;
  });

  return (
    <div class="canvas-wrap">
      <svg
        ref={svgEl}
        viewBox={`-140 -60 ${W() + 280} ${H() + 180}`}
        role="img"
        aria-label="琉璃照壁立面图"
      >
        <g transform={`translate(${tf().x},${tf().y}) scale(${tf().k})`}>
          {/* 外墙轮廓 */}
          <rect x={0} y={0} width={W()} height={H()} fill="#e7dcc7" stroke="#4a382a" stroke-width={4} />

          {/* 开间分隔（壁柱影缝） */}
          <For each={bayLines()}>
            {(x) => (
              <line x1={x} y1={150} x2={x} y2={H() - 150} stroke="rgba(74,56,42,.35)"
                stroke-width={3} stroke-dasharray="14 10" />
            )}
          </For>

          {/* 分区名水印 */}
          <For each={props.facade.zones.filter((z) => z.key !== 'trim')}>
            {(zone) => {
              const pos = zoneLabelPos(zone);
              return pos ? <text class="zone-label" x={pos.x} y={pos.y}>{ZONES[zone.key].name}</text> : null;
            }}
          </For>

          {/* 构件 */}
          <For each={props.facade.pieces}>
            {(piece) => (
              <PieceGlyph
                piece={piece}
                orderGrade={props.orderColorGrade}
                selected={props.selectedId === piece.id}
                onSelect={props.onSelect}
              />
            )}
          </For>

          {/* 冲突高亮 */}
          <For each={props.facade.conflicts}>
            {(cf) => (
              <Show when={!cf.resolution}>
                <g class="conflict-flash" transform={`translate(${cf.x},${cf.y})`}>
                  <rect width={Math.max(cf.w, 60)} height={Math.max(cf.h, 40)}
                    fill="rgba(176,58,46,.28)" stroke="#b03a2e" stroke-width={3} stroke-dasharray="10 6" />
                  <text x={Math.max(cf.w, 60) / 2} y={Math.max(cf.h, 40) / 2 + 8}
                    text-anchor="middle" font-size={30} font-weight={700} fill="#8f2a20">冲突</text>
                </g>
              </Show>
            )}
          </For>

          {/* 尺寸标注 */}
          <g stroke="#6b6258" fill="#6b6258" font-size={26}>
            <line x1={0} y1={-28} x2={W()} y2={-28} stroke-width={2} />
            <line x1={0} y1={-38} x2={0} y2={-18} stroke-width={2} />
            <line x1={W()} y1={-38} x2={W()} y2={-18} stroke-width={2} />
            <text x={W() / 2} y={-38} text-anchor="middle">总宽 {W()} mm</text>
            <line x1={-70} y1={0} x2={-70} y2={H()} stroke-width={2} />
            <line x1={-80} y1={0} x2={-60} y2={0} stroke-width={2} />
            <line x1={-80} y1={H()} x2={-60} y2={H()} stroke-width={2} />
            <text transform={`translate(-92 ${H() / 2}) rotate(-90)`} text-anchor="middle">总高 {H()} mm</text>
          </g>
        </g>
      </svg>
      <div class="zoom-ctrl">
        <button title="放大" onClick={() => zoomBy(1.35)}>＋</button>
        <button title="缩小" onClick={() => zoomBy(1 / 1.35)}>－</button>
        <button title="复位" onClick={reset}>⊙</button>
      </div>
    </div>
  );
}
