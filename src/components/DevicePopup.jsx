import { useState } from 'react'
import { useStore } from '../core/store'
import { DEVICE_TYPES, DEVICE_STATUS, STATUS_LIST } from '../core/constants'

export default function DevicePopup({ onClose }) {
  const { selectedIds, getDevice, getPool, deviceStatus, setDeviceStatus, registerFault, parkData } =
    useStore()
  const [desc, setDesc] = useState('')
  const [msg, setMsg] = useState('')
  const id = selectedIds[0]
  const d = getDevice(id)
  if (!d || selectedIds.length !== 1) return null
  const pool = getPool(d.poolId)
  const district = parkData.districts.find((x) => x.id === d.districtId)
  const status = deviceStatus(d.id)

  const register = () => {
    registerFault({ deviceIds: [d.id], desc, reporter: '前台登记' })
    setMsg('已登记故障并生成工单，可在“工单”页派单')
  }

  return (
    <div className="popup">
      <div className="popup-head">
        <span
          className="swatch"
          style={{ background: DEVICE_TYPES[d.type] ? `#${DEVICE_TYPES[d.type].color.toString(16).padStart(6, '0')}` : '#888' }}
        />
        <b>{d.code}</b>
        <button className="icon-btn" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="popup-body">
        <Row k="构件编号" v={d.id} />
        <Row k="设备类型" v={DEVICE_TYPES[d.type].name} />
        <Row k="所属池体" v={`${district?.name} / ${pool?.name}`} />
        <Row k="上次检修" v={d.lastInspect} />
        <div className="popup-row">
          <span className="row-k">当前状态</span>
          <span className="status-pill" style={{ background: DEVICE_STATUS[status].color }}>
            {DEVICE_STATUS[status].name}
          </span>
        </div>

        <div className="popup-row col">
          <span className="row-k">直接改状态</span>
          <div className="btn-row">
            {STATUS_LIST.map((s) => (
              <button
                key={s.key}
                className={`mini-btn ${status === s.key ? 'active' : ''}`}
                onClick={() => setDeviceStatus([d.id], s.key)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="popup-row col">
          <span className="row-k">前台登记故障</span>
          <textarea
            rows={2}
            placeholder="故障现象描述…"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <button className="btn danger" onClick={register}>
            登记并生成工单
          </button>
          {msg && <span className="ok-text">{msg}</span>}
        </div>
      </div>
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="popup-row">
      <span className="row-k">{k}</span>
      <span className="row-v">{v}</span>
    </div>
  )
}
