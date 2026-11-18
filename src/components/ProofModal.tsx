// 分色打样：每个色板一张独立 SVG，可逐张下载或在新窗口查看
import { For, Show } from 'solid-js';
import Modal from './Modal';
import type { SprayDoc } from '../types';
import { buildColorProofs, collectColorPlates } from '../lib/exporters';
import { triggerDownload } from '../lib/storage';

interface Props {
  doc: SprayDoc;
  onClose: () => void;
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function ProofModal(props: Props) {
  const proofs = buildColorProofs(props.doc);
  const plates = collectColorPlates(props.doc);

  const downloadOne = (color: string, svg: string, index: number) => {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownload(URL.createObjectURL(blob), `proof-${index + 1}-${color.replace('#', '')}.svg`);
  };

  return (
    <Modal title="分色打样图（每色一张模板）" onClose={props.onClose} width={680}>
      <p class="hint">
        共提取 {plates.length} 个色板。每张打样图只保留该色板的填充与描边，用于制板分色施工。
      </p>
      <For each={proofs}>
        {(proof, i) => (
          <div class="proof-card" style={{ margin: '8px 0' }}>
            <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
              <div class="swatch" style={{ background: proof.color, width: '60px', height: '40px' }} />
              <div style={{ flex: 1 }}>
                <strong>色板 {i() + 1}：{proof.color}</strong>
                <div class="hint">独立 SVG，白底单色输出</div>
              </div>
              <a class="btn small" href={svgToDataUrl(proof.svg)} target="_blank" rel="noopener">
                预览
              </a>
              <button class="btn small" onClick={() => downloadOne(proof.color, proof.svg, i())}>
                下载SVG
              </button>
            </div>
          </div>
        )}
      </For>
      <Show when={!proofs.length}>
        <div class="hint">文档中没有可提取的颜色，请先为闭合路径设置填充或描边。</div>
      </Show>
      <div class="modal-actions">
        <button class="btn" onClick={props.onClose}>关闭</button>
      </div>
    </Modal>
  );
}
