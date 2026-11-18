// 批注面板：审核人圈选后的批注列表，制作方逐条回复与关闭
import { For, Show, createSignal } from 'solid-js';
import { deleteAnnotation, replyAnnotation, resolveAnnotation, uiState } from '../store';

export default function AnnotationsPanel() {
  const [replyDrafts, setReplyDrafts] = createSignal<Record<string, string>>({});

  const sendReply = (annoId: string) => {
    const text = (replyDrafts()[annoId] ?? '').trim();
    if (!text) return;
    replyAnnotation(annoId, text, uiState.currentUserName);
    setReplyDrafts((d) => ({ ...d, [annoId]: '' }));
  };

  return (
    <div>
      <div class="hint" style={{ margin: '4px 2px 10px' }}>
        审核人：选择工具栏「✎ 圈选批注」后在画面上拖拽圈选，松开即可填写意见。
        制作方在每条批注下回复处理情况并可标记已解决。
      </div>
      <Show when={uiState.annotations.length} fallback={<div class="hint">暂无批注。</div>}>
        <For each={[...uiState.annotations].sort((a, b) => b.createdAt - a.createdAt)}>
          {(anno) => (
            <div class="anno-card" classList={{ resolved: anno.status === 'resolved' }}>
              <div class="anno-meta">
                <span>{anno.author}</span>
                <span>{new Date(anno.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }}>
                <span class="badge" classList={{ open: anno.status === 'open', resolved: anno.status === 'resolved' }}>
                  {anno.status === 'open' ? '待处理' : '已解决'}
                </span>
                <span class="layer-actions">
                  <button
                    class="btn small"
                    title={anno.status === 'open' ? '标记已解决' : '重新打开'}
                    onClick={() => resolveAnnotation(anno.id)}
                  >
                    {anno.status === 'open' ? '✓ 解决' : '↺ 重开'}
                  </button>
                  <button class="btn small danger" onClick={() => deleteAnnotation(anno.id)}>删除</button>
                </span>
              </div>
              <div class="anno-text">{anno.text}</div>
              <For each={anno.replies}>
                {(r) => (
                  <div class="reply">
                    <strong>{r.author}</strong>
                    <span class="anno-meta" style={{ margin: '0 6px' }}>
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                    <div>{r.text}</div>
                  </div>
                )}
              </For>
              <div class="form-row" style={{ margin: '6px 0 0' }}>
                <input
                  type="text"
                  placeholder="制作方回复处理意见…"
                  value={replyDrafts()[anno.id] ?? ''}
                  onInput={(e) =>
                    setReplyDrafts((d) => ({ ...d, [anno.id]: e.currentTarget.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendReply(anno.id);
                  }}
                />
                <button class="btn small" onClick={() => sendReply(anno.id)}>回复</button>
              </div>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
}
