import { useState } from 'react'
import { useStore } from '../core/store'
import { STATUS_LIST, DEVICE_TYPES } from '../core/constants'

// 框选一批构件后的整组操作条
export default function BatchBar() {
  const selectedIds = useStore((s) => s.selectedIds)
  const [open, setOpen] = useState(true)
  const [desc, setDesc] = useState('')
  if (selectedIds.length < 2) return null

  const types = [...new Set(selectedIds.map((id) => DEVICE_TYPES[useStore.getState().getDevice(id)?.type]?.name))].filter(Boolean)

  const applyStatus = (status) => useStore.getState().setDeviceStatus(useStore.getState().selectedIds, status)
  const register = () =>
    useStore.getState().registerFault({
      deviceIds: useStore.getState().selectedIds,
      desc,
      reporter: '前台登记',
    })

  return (
    <div className="batch-bar">
      <div className="batch-head" onClick={() => setOpen(!open)}>
        已框选 <b>{selectedIds.length}</b> 个构件（{types.join('、') || '多类型'}）
        <span className="batch-toggle">{open ? '收起 ▾' : '操作 ▴'}</span>
      </div>
      {open && (
        <div className="batch-body">
          <div className="btn-row">
            {STATUS_LIST.map((s) => (
              <button key={s.key} className="mini-btn" onClick={() => applyStatus(s.key)}>
                整组置为{s.name}
              </button>
            ))}
          </div>
          <div className="batch-fault">
            <input
              placeholder="批量故障描述（可选）"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <button className="btn danger" onClick={register}>
              批量登记故障
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
