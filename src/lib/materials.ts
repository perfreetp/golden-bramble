// 材质库：日化包装常见瓶用塑料
export interface MaterialDef {
  id: string;
  name: string;
  color: string;
  transparent: boolean;
  note: string;
}

export const MATERIALS: MaterialDef[] = [
  { id: 'PET', name: 'PET 聚酯', color: '#bfe3f2', transparent: true, note: '透明饮料/洗护瓶，易拉伸' },
  { id: 'HDPE', name: 'HDPE 高密度聚乙烯', color: '#e8e4d8', transparent: false, note: '日化瓶主力材质，乳白可着色' },
  { id: 'LDPE', name: 'LDPE 低密度聚乙烯', color: '#f0ead9', transparent: false, note: '柔软挤压瓶' },
  { id: 'PP', name: 'PP 聚丙烯', color: '#e3ecf2', transparent: false, note: '耐温瓶盖与瓶身' },
  { id: 'PVC', name: 'PVC 聚氯乙烯', color: '#d9e8f5', transparent: true, note: '收缩膜标签适配' },
  { id: 'PETG', name: 'PETG', color: '#cfeaf0', transparent: true, note: '高透明厚壁瓶' },
  { id: 'PCR-PE', name: 'PCR-PE 再生料', color: '#cfd3c8', transparent: false, note: '再生颗粒，色泽偏灰' },
];

export function materialById(id: string): MaterialDef {
  return MATERIALS.find((m) => m.id === id) ?? MATERIALS[1];
}
